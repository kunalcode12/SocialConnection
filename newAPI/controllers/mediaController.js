const Media = require('../models/mediaModel');
const uploadService = require('../services/uploadService');
const { Worker } = require('worker_threads');
const path = require('path');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/appError');
const mongoose = require('mongoose');
const redis = require('redis');
const { promisify } = require('util');
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
});

const redisClient = redis.createClient(process.env.REDIS_URL);
const getCache = promisify(redisClient.get).bind(redisClient);
const setCache = promisify(redisClient.setEx).bind(redisClient);

exports.getUserMedia = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    type,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const userId = req.params.userId || req.user._id;

  // Create cache key
  const cacheKey = `user-media:${userId}:${page}:${limit}:${type}:${sortBy}:${order}`;

  // Try to get from cache
  const cachedResult = await getCache(cacheKey);
  if (cachedResult) {
    return res.status(200).json({
      status: 'success',
      data: JSON.parse(cachedResult),
    });
  }

  // Build query
  const query = { user: userId, status: 'completed' };
  if (type) query.type = type;

  // Build sort object
  const sortObject = {};
  sortObject[sortBy] = order === 'desc' ? -1 : 1;

  // Execute query with pagination
  const [media, total] = await Promise.all([
    Media.find(query)
      .select('-chunks -uploadedChunks')
      .populate('user', 'name username avatar')
      .populate('content', 'title description')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sortObject)
      .lean(),
    Media.countDocuments(query),
  ]);

  const result = {
    media,
    currentPage: parseInt(page),
    totalPages: Math.ceil(total / limit),
    totalItems: total,
    hasMore: page * limit < total,
  };

  // Cache for 5 minutes
  await setCache(cacheKey, 300, JSON.stringify(result));

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.getFeed = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 20, lastId, type } = req.query;

  // Build base query
  const query = { status: 'completed' };
  if (type) query.type = type;
  if (lastId) {
    query._id = { $lt: new mongoose.Types.ObjectId(lastId) };
  }

  // Get user's following list if authenticated
  let following = [];
  if (req.user) {
    const user = await User.findById(req.user._id).select('following');
    following = user.following;
    query.user = { $in: [...following, req.user._id] };
  }

  const media = await Media.find(query)
    .select('-chunks -uploadedChunks')
    .populate('user', 'name username avatar')
    .populate('content', 'title description')
    .sort({ _id: -1 })
    .limit(parseInt(limit))
    .lean();

  // Get the last ID for next page
  const lastItemId = media.length > 0 ? media[media.length - 1]._id : null;

  res.status(200).json({
    status: 'success',
    data: {
      media,
      hasMore: media.length === parseInt(limit),
      nextCursor: lastItemId,
    },
  });
});

exports.searchMedia = catchAsync(async (req, res, next) => {
  const {
    query = '',
    type,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    order = 'desc',
  } = req.query;

  const aggregationPipeline = [
    // Match stage
    {
      $match: {
        status: 'completed',
        ...(type && { type }),
        ...(query && {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { 'metadata.filename': { $regex: query, $options: 'i' } },
          ],
        }),
      },
    },
    // Lookup user data
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    // Unwind user array
    {
      $unwind: '$userDetails',
    },
    // Project needed fields
    {
      $project: {
        title: 1,
        type: 1,
        url: 1,
        metadata: 1,
        createdAt: 1,
        user: {
          _id: '$userDetails._id',
          name: '$userDetails.name',
          username: '$userDetails.username',
          avatar: '$userDetails.avatar',
        },
      },
    },
    // Sort
    {
      $sort: {
        [sortBy]: order === 'desc' ? -1 : 1,
      },
    },
    // Pagination
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ];

  const [results, totalCount] = await Promise.all([
    Media.aggregate(aggregationPipeline),
    Media.countDocuments({
      status: 'completed',
      ...(type && { type }),
      ...(query && {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { 'metadata.filename': { $regex: query, $options: 'i' } },
        ],
      }),
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      media: results,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      totalItems: totalCount,
      hasMore: results.length === parseInt(limit),
    },
  });
});

exports.initializeUpload = catchAsync(async (req, res, next) => {
  const { title, contentId, totalChunks, type, metadata } = req.body;

  const uploadId = uploadService.generateUploadId();
  const media = await Media.create({
    title,
    type,
    uploadId,
    totalChunks,
    metadata,
    user: req.user._id,
    status: 'uploading',
  });

  res.status(201).json({
    status: 'success',
    data: {
      uploadId,
      chunksReceived: 0,
      totalChunks,
    },
  });
});

exports.uploadChunk = (req, res, next) => {
  upload.single('chunk')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        status: 'error',
        message: `Multer upload error: ${err.message}`,
      });
    }

    if (err) {
      return res.status(500).json({
        status: 'error',
        message: `Upload error: ${err.message}`,
      });
    }

    try {
      const { uploadId, chunkIndex, totalChunks } = req.body;
      const chunk = req.file ? req.file.buffer : null;

      if (!uploadId || chunkIndex === undefined || totalChunks === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required upload parameters',
        });
      }

      if (!chunk || chunk.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'No chunk data received',
        });
      }

      const result = await uploadService.handleChunk(
        chunk,
        uploadId,
        chunkIndex,
        totalChunks
      );

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      console.error('Chunk upload error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Chunk upload failed',
      });
    }
  });
};

exports.getUploadStatus = catchAsync(async (req, res, next) => {
  const { uploadId } = req.params;

  const media = await Media.findOne({ uploadId })
    .select('status uploadedChunks totalChunks url')
    .lean();

  if (!media) {
    return next(new appError('Upload not found', 404));
  }

  // Calculate progress
  const progress = media.uploadedChunks
    ? (media.uploadedChunks.length / media.totalChunks) * 100
    : 0;

  console.log('Media Status:', {
    status: media.status,
    uploadedChunksCount: media.uploadedChunks?.length || 0,
    totalChunks: media.totalChunks,
    progress,
  });

  res.status(200).json({
    status: 'success',
    data: {
      status: media.status,
      progress,
      url: media.url || null,
    },
  });
});

exports.getMedia = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const type = req.query.type;
  const search = req.query.search;
  const contentId = req.query.contentId;
  const userId = req.query.userId;

  const query = { status: 'completed' };
  if (type) query.type = type;
  if (search) query.$text = { $search: search };
  if (contentId) query.content = contentId;
  if (userId) query.user = userId;

  const [media, total] = await Promise.all([
    Media.find(query)
      .populate('user', 'name email')
      .populate('content', 'title')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean(),
    Media.countDocuments(query),
  ]);

  res.status(200).json({
    status: 'success',
    results: media.length,
    data: {
      media,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    },
  });
});

exports.streamMedia = catchAsync(async (req, res, next) => {
  const media = await Media.findById(req.params.id);
  if (!media || media.status !== 'completed') {
    return next(new appError('Media not found', 404));
  }

  const worker = new Worker(
    path.join(__dirname, '../workers/streamWorker.js'),
    {
      workerData: {
        cloudinaryId: media.cloudinaryId,
        type: media.type,
      },
    }
  );

  worker.on('message', (chunk) => {
    res.write(chunk);
  });

  worker.on('error', (error) => {
    console.error('Streaming worker error:', error);
    res.end();
  });

  worker.on('exit', () => {
    res.end();
  });

  req.on('close', () => {
    worker.terminate();
  });
});

exports.updateMedia = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, metadata } = req.body;

  // Find media and check ownership
  const media = await Media.findById(id);

  if (!media) {
    return next(new appError('Media not found', 404));
  }

  // Check if user owns the media or is admin
  if (
    media.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new appError('Not authorized to update this media', 403));
  }

  // Only allow updating certain fields
  const updatedMedia = await Media.findByIdAndUpdate(
    id,
    {
      title,
      metadata: {
        ...media.metadata,
        ...metadata,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('user', 'name username avatar')
    .populate('content', 'title description');

  // Clear cache for this user's media
  const cachePattern = `user-media:${req.user._id}:*`;
  await redisClient.keys(cachePattern, (err, keys) => {
    if (err) console.error('Redis cache clear error:', err);
    if (keys.length > 0) {
      redisClient.del(keys);
    }
  });

  res.status(200).json({
    status: 'success',
    data: {
      media: updatedMedia,
    },
  });
});

exports.deleteMedia = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find media and check ownership
  const media = await Media.findById(id);

  if (!media) {
    return next(new appError('Media not found', 404));
  }

  // Check if user owns the media or is admin
  if (
    media.user.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    return next(new appError('Not authorized to delete this media', 403));
  }

  // If media is completed and has cloudinary ID, delete from cloud storage
  if (media.status === 'completed' && media.cloudinaryId) {
    try {
      await uploadService.deleteFromCloud(media.cloudinaryId);
    } catch (error) {
      console.error('Cloud storage deletion error:', error);
      // Continue with deletion even if cloud storage deletion fails
    }
  }

  // Delete the media document
  await Media.findByIdAndDelete(id);

  // Clear cache for this user's media
  const cachePattern = `user-media:${req.user._id}:*`;
  await redisClient.keys(cachePattern, (err, keys) => {
    if (err) console.error('Redis cache clear error:', err);
    if (keys.length > 0) {
      redisClient.del(keys);
    }
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
