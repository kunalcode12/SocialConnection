const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  index: Number,
  data: Buffer,
  size: Number,
});

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  url: {
    type: String,
  },
  cloudinaryId: {
    type: String,
  },
  status: {
    type: String,
    enum: ['uploading', 'processing', 'completed', 'failed'],
    default: 'uploading',
  },
  uploadId: {
    type: String,
    unique: true,
  },
  chunks: [chunkSchema],
  uploadedChunks: [
    {
      type: Number,
    },
  ],
  totalChunks: {
    type: Number,
  },
  metadata: {
    size: Number,
    format: String,
    duration: Number,
    width: Number,
    height: Number,
    contentType: String,
    filename: String,
  },
  // References to other schemas
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

mediaSchema.index({ title: 'text' });
mediaSchema.index({ uploadId: 1 });
mediaSchema.index({ user: 1 });
mediaSchema.index({ content: 1 });

module.exports = mongoose.model('Media', mediaSchema);
