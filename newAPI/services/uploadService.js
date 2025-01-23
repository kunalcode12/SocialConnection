const crypto = require('crypto');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { createReadStream, createWriteStream } = require('fs');
const os = require('os');
const path = require('path');
const fs = require('fs').promises;
const cloudinary = require('../config/cloudinary');
const Media = require('../models/mediaModel');
const uploadDir = path.join(__dirname, 'uploads');

// try {
//   fs.mkdir(uploadDir, { recursive: true });
// } catch (error) {
//   console.error('Failed to create uploads directory:', error);
// }
class UploadService {
  constructor() {
    this.CHUNK_SIZE = 1024 * 1024 * 5; // 5MB chunks
    this.tmpDir = path.join(os.tmpdir(), 'uploads');
  }

  async initialize() {
    await fs.mkdir(this.tmpDir, { recursive: true });
  }

  generateUploadId() {
    return crypto.randomBytes(16).toString('hex');
  }

  async createTempFile(uploadId) {
    try {
      // Ensure the temp directory exists
      await fs.mkdir(this.tmpDir, { recursive: true });

      const tempPath = path.join(this.tmpDir, `${uploadId}.tmp`);

      // Create an empty file to ensure it can be written to
      await fs.writeFile(tempPath, Buffer.from(''), { flag: 'w' });

      return tempPath;
    } catch (error) {
      console.error('Error creating temp file:', error);
      throw new Error(`Failed to create temporary file: ${error.message}`);
    }
  }

  // async handleChunk(chunk, uploadId, chunkIndex, totalChunks, media) {
  //   try {
  //     // Validate inputs
  //     if (!chunk || !Buffer.isBuffer(chunk)) {
  //       throw new Error('Invalid chunk data');
  //     }

  //     const tempPath = await this.createTempFile(uploadId);

  //     // Append chunk to file
  //     const writeStream = createWriteStream(tempPath, { flags: 'a' });
  //     await new Promise((resolve, reject) => {
  //       writeStream.write(chunk, (err) => {
  //         if (err) reject(err);
  //         else resolve();
  //       });
  //     });
  //     writeStream.end();

  //     // Save chunk metadata
  //     media.chunks.push({
  //       index: chunkIndex,
  //       size: chunk.length,
  //     });

  //     if (!media.uploadedChunks.includes(chunkIndex)) {
  //       media.uploadedChunks.push(chunkIndex);
  //     }

  //     await media.save();

  //     // If all chunks received, process the complete file
  //     if (media.uploadedChunks.length === totalChunks) {
  //       return this.processCompleteFile(media, tempPath);
  //     }

  //     return {
  //       uploadId,
  //       chunksReceived: media.uploadedChunks.length,
  //       totalChunks,
  //       status: 'uploading',
  //     };
  //   } catch (error) {
  //     console.error('Chunk handling error:', error);
  //     media.status = 'failed';
  //     await media.save();
  //     throw error;
  //   }
  // }
  async handleChunk(chunk, uploadId, chunkIndex, totalChunks) {
    let filePath = null;
    try {
      // Ensure chunk is a Buffer
      if (!Buffer.isBuffer(chunk)) {
        throw new Error('Chunk must be a buffer');
      }

      // Convert chunkIndex to a number
      const parsedChunkIndex = Number(chunkIndex);
      const parsedTotalChunks = Number(totalChunks);

      // Find or create the media upload record
      let media = await Media.findOne({ uploadId });

      if (!media) {
        media = new Media({
          uploadId,
          totalChunks: parsedTotalChunks,
          status: 'uploading',
          uploadedChunks: [],
        });
      }

      // Check if chunk already exists
      const existingChunkIndex = media.uploadedChunks.findIndex(
        (c) => c.chunkIndex === parsedChunkIndex
      );

      if (existingChunkIndex === -1) {
        // Add new chunk
        media.uploadedChunks.push({
          chunkIndex: parsedChunkIndex,
          chunkData: chunk,
        });
      } else {
        // Update existing chunk
        media.uploadedChunks[existingChunkIndex].chunkData = chunk;
      }

      // Sort chunks by index
      media.uploadedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

      // Check if upload is complete
      if (media.uploadedChunks.length === parsedTotalChunks) {
        // Create a temporary file path
        filePath = path.join(this.tmpDir, `${uploadId}-complete.tmp`);

        // Combine and write chunks to temp file
        const fullFile = Buffer.concat(
          media.uploadedChunks.map((chunk) => chunk.chunkData)
        );
        await fs.writeFile(filePath, fullFile);

        try {
          // Upload to Cloudinary
          const cloudinaryResponse = await this.uploadToCloudinary(
            filePath,
            media
          );

          // Update media record
          media.status = 'completed';
          media.url = cloudinaryResponse.secure_url;
          media.cloudinaryPublicId = cloudinaryResponse.public_id;
        } catch (cloudinaryError) {
          // Cloudinary upload failed
          media.status = 'failed';
          console.error('Cloudinary upload error:', cloudinaryError);
        } finally {
          // Always attempt to remove the temporary file
          await this.cleanupTempFile(filePath);
        }
      } else {
        media.status = 'uploading';
      }

      // Save the media document
      await media.save();

      return {
        uploadId,
        status: media.status,
        receivedChunks: media.uploadedChunks.length,
        totalChunks: parsedTotalChunks,
        url: media.url || null,
      };
    } catch (error) {
      // Attempt to cleanup temp file in case of error
      if (filePath) {
        await this.cleanupTempFile(filePath);
      }

      // Update media status to failed
      await Media.findOneAndUpdate(
        { uploadId },
        { status: 'failed' },
        { new: true }
      );

      console.error('Handle chunk error:', error);
      throw new Error(`Failed to handle chunk: ${error.message}`);
    }
  }

  async cleanupTempFile(filePath) {
    if (!filePath) return;

    try {
      // Check if file exists before attempting to delete
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log(`Temporary file deleted: ${filePath}`);
    } catch (error) {
      // If file doesn't exist or can't be deleted, log the error
      console.warn(
        `Failed to delete temporary file ${filePath}:`,
        error.message
      );
    }
  }

  async processCompleteFile(media, tempPath) {
    try {
      media.status = 'processing';
      await media.save();

      // Ensure all chunks are in the correct order
      const sortedChunks = media.chunks.sort((a, b) => a.index - b.index);

      // Use pipeline for more robust file writing
      await new Promise((resolve, reject) => {
        const writeStream = createWriteStream(tempPath);

        const chunks = sortedChunks.map((chunk) => chunk.data);

        pipeline(
          require('stream').Readable.from(chunks),
          writeStream,
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      // Rest of the method remains the same...
    } catch (error) {
      console.error('File processing error:', error);
      media.status = 'failed';
      await media.save();

      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath).catch(() => {});
      } catch {}

      throw error;
    }
  }

  async uploadToCloudinary(filePath, media) {
    const uploadOptions = {
      resource_type: media.type === 'video' ? 'video' : 'image',
      chunk_size: this.CHUNK_SIZE,
      eager_async: true,
      eager: this.getTransformations(media.type),
    };

    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(filePath, uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  }

  getTransformations(mediaType) {
    if (mediaType === 'video') {
      return [
        { format: 'mp4', quality: 'auto:good' },
        { format: 'webm', quality: 'auto:good' },
      ];
    }
    return [
      { format: 'webp', quality: 'auto:good' },
      { format: 'jpg', quality: 'auto:good' },
    ];
  }
}

module.exports = new UploadService();
