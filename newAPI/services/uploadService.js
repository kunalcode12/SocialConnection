const crypto = require('crypto');
const { promisify } = require('util');
const { pipeline } = require('stream');
const { createReadStream, createWriteStream } = require('fs');
const os = require('os');
const path = require('path');
const fs = require('fs').promises;
const cloudinary = require('../config/cloudinary');

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
    return path.join(this.tmpDir, `${uploadId}.tmp`);
  }

  async handleChunk(chunk, uploadId, chunkIndex, totalChunks, media) {
    const tempPath = await this.createTempFile(uploadId);

    // Save chunk to database
    media.chunks.push({
      index: chunkIndex,
      data: chunk,
      size: chunk.length,
    });

    if (!media.uploadedChunks.includes(chunkIndex)) {
      media.uploadedChunks.push(chunkIndex);
    }

    await media.save();

    // If all chunks received, process the complete file
    if (media.uploadedChunks.length === totalChunks) {
      return this.processCompleteFile(media, tempPath);
    }

    return {
      uploadId,
      chunksReceived: media.uploadedChunks.length,
      totalChunks,
      status: 'uploading',
    };
  }

  async processCompleteFile(media, tempPath) {
    try {
      media.status = 'processing';
      await media.save();

      // Combine chunks
      const sortedChunks = media.chunks.sort((a, b) => a.index - b.index);
      const writeStream = createWriteStream(tempPath);

      for (const chunk of sortedChunks) {
        await promisify(writeStream.write.bind(writeStream))(chunk.data);
      }
      writeStream.end();

      // Upload to Cloudinary with transform options
      const uploadResult = await this.uploadToCloudinary(tempPath, media);

      // Update media record
      media.url = uploadResult.secure_url;
      media.cloudinaryId = uploadResult.public_id;
      media.status = 'completed';
      media.chunks = []; // Clear chunks after successful upload
      media.metadata = {
        ...media.metadata,
        size: uploadResult.bytes,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration || null,
      };

      await media.save();
      await fs.unlink(tempPath);

      return {
        status: 'completed',
        mediaId: media._id,
        url: media.url,
      };
    } catch (error) {
      media.status = 'failed';
      await media.save();
      throw error;
    }
  }

  async uploadToCloudinary(filePath, media) {
    const uploadOptions = {
      resource_type: 'auto',
      chunk_size: this.CHUNK_SIZE,
      eager_async: true,
      eager: this.getTransformations(media.type),
    };

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      const readStream = createReadStream(filePath);
      pipeline(readStream, uploadStream, (error) => {
        if (error) reject(error);
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
