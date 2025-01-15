const mongoose = require('mongoose');
const appError = require('../utils/appError');

const voteSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Content',
    },
    commentId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Comment',
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A vote must have some user'],
    },
    voteType: {
      type: String,
      enum: ['upvote', 'downvote'],
      required: true,
    },
    flagged: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

voteSchema.pre('save', function (next) {
  if (!this.commentId && !this.contentId) {
    next(
      new appError(
        'A vote must be associated with either content or a comment.',
        400
      )
    );
  }
  if (this.commentId && this.contentId) {
    next(
      new appError(
        'A vote cannot be associated with both content and a comment.',
        400
      )
    );
  }
  next();
});
const Vote = mongoose.model('Vote', voteSchema);
module.exports = Vote;
