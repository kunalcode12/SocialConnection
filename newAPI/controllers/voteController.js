const Vote = require('../models/voteModel');
const Content = require('../models/contentModel');
const Comment = require('../models/commentModel');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getVoteContent = catchAsync(async (req, res, next) => {
  const { contentId } = req.query;
  const result = await Vote.find({ contentId: contentId }).populate({
    path: 'userId',
  });
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.getAlltheVote = catchAsync(async (req, res, next) => {
  const result = await Vote.find(req.query).populate({ path: 'userId' });
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

exports.createVote = catchAsync(async (req, res, next) => {
  if (!req.body.userId) {
    req.body.userId = req.user.id;
  }
  if (!req.body.contentId) {
    req.body.contentId = req.params.contentId;
  }
  const { contentId, userId, voteType, flagged } = req.body;

  const existingLike = await Vote.findOne({ contentId, userId });

  if (!existingLike) {
    const vote = await Vote.create(req.body);

    const voteField = voteType === 'upvote' ? { upVote: 1 } : { downVote: 1 };

    await Content.findByIdAndUpdate(
      contentId,
      { $inc: voteField },
      { new: true }
    );
    return res.status(201).json({
      status: 'success',
      data: {
        message: 'upvote added successfull',
        data: vote,
      },
    });
  } else {
    const vote = await Vote.findByIdAndDelete(existingLike._id);
    const voteField = voteType === 'upvote' ? { upVote: -1 } : { downVote: -1 };

    await Content.findByIdAndUpdate(
      contentId,
      { $inc: voteField },
      { new: true }
    );
    return res.status(201).json({
      status: 'success',
      data: {
        message: 'upvote removed successfull',
        data: vote,
      },
    });
  }
});

exports.createVoteOnComment = catchAsync(async (req, res, next) => {
  if (!req.body.userId) {
    req.body.userId = req.user.id;
  }
  if (!req.body.commentId) {
    req.body.commentId = req.params.commentId;
  }
  const { userId, commentId, flagged } = req.body;

  const existingLike = await Vote.findOne({ commentId, userId });
  if (!existingLike) {
    const vote = await Vote.create(req.body);

    const d1 = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { upVote: 1 } },
      { new: true }
    );
    return res.status(201).json({
      status: 'success',
      data: {
        message: 'upvote added successfull',
        data: vote,
      },
    });
  } else {
    const vote = await Vote.findByIdAndDelete(existingLike._id);

    await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { upVote: -1 } },
      { new: true }
    );
    return res.status(201).json({
      status: 'success',
      data: {
        message: 'upvote removed successfull',
        data: vote,
      },
    });
  }
});

exports.getUserCommentAndReplyVotes = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch votes on comments (commentId) by the user
    const commentVotes = await Vote.find({
      userId,
      commentId: { $exists: true },
    })
      .select('commentId voteType userId')
      .populate('commentId', 'contentId'); // Optional: Populate contentId for context

    // Fetch votes on replies (replyId) by querying the Comment model
    const commentsWithReplies = await Comment.find({
      'replies.userId': userId,
    }).select('replies');

    // Filter the replies where the user has voted
    const replyVotes = [];
    commentsWithReplies.forEach((comment) => {
      comment.replies.forEach((reply) => {
        if (reply.userId.toString() === userId) {
          replyVotes.push({
            replyId: reply.commentId,
            voteType: 'upvote',
            userId: reply.userId,
          });
        }
      });
    });

    // Prepare the combined result
    const result = {
      commentVotes: commentVotes.map((vote) => ({
        commentId: vote.commentId,
        voteType: vote.voteType,
        userId: vote.userId,
      })),
      replyVotes,
    };

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.createVoteOnReplyOfComment = catchAsync(async (req, res, next) => {});
