const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Content',
      required: [true, 'A comment must be on some content'],
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A comment must be by some user'],
    },
    comment: {
      type: String,
      required: true,
    },
    upVote: {
      type: Number,
      default: 0,
    },

    replies: [
      {
        userId: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: [true, 'A reply must be by some user'],
        },
        commentId: {
          type: mongoose.Schema.ObjectId,
          ref: 'Comment',
          required: true,
        },
        reply: {
          type: String,
          required: true,
        },
        upVoteReply: {
          type: Number,
          default: 0,
        },

        createdAt: {
          type: Date,
          default: new Date().getTime(),
        },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
