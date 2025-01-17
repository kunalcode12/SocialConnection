const Comment = require('../models/commentModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createComment = catchAsync(async (req, res, next) => {
  const id = req.params.contentId;
  if (!req.body.userId) {
    req.body.userId = req.user.id;
  }
  if (!id) {
    next(new AppError('No content found with given id', 404));
  }
  const { userId, comment } = req.body;
  let createComment = await Comment.create({
    contentId: id,
    userId,
    comment,
    //parentCommentId: parentCommentId || null,
  });

  createComment = await createComment.populate({
    path: 'userId',
    select: 'name email',
  });

  res.status(201).json({
    status: 'success',
    data: {
      data: createComment,
    },
  });
});

exports.getAllComments = catchAsync(async (req, res, next) => {
  if (!req.params.contentId) {
    next(new AppError('No comment found on this content id', 404));
  }
  const contents = await Comment.find({ contentId: req.params.contentId })
    .sort('-createdAt')
    .populate({
      path: 'userId',
      select: 'name email',
    })
    .populate({
      path: 'replies.userId',
      select: 'name email',
    });
  res.status(201).json({
    status: 'success',
    data: {
      data: contents,
    },
  });
});

exports.addReplyToComment = catchAsync(async (req, res, next) => {
  if (!req.params.commentId) {
    next(new AppError('Please provide valid commentId', 403));
  }
  if (!req.body.userId) {
    req.body.userId = req.user.id;
  }
  const replyData = {
    userId: req.body.userId,
    commentId: req.params.commentId,
    reply: req.body.reply,
  };
  console.log(replyData);
  const reply = await Comment.findByIdAndUpdate(
    req.params.commentId,
    {
      $push: { replies: replyData },
    },
    { new: true }
  ).populate({ path: 'replies.userId', select: 'name email' });
  res.status(201).json({
    status: 'success',
    data: {
      reply,
    },
  });
});

exports.getComments = catchAsync(async (req, res, next) => {
  if (!req.params.commentId) {
    next(new AppError('Please provide valid commentId', 403));
  }
  const comment = await Comment.findById(req.params.commentId);
  res.status(201).json({
    status: 'success',
    data: {
      comment,
    },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const id = req.params.commentId;
  if (!req.body.userId) {
    req.body.userId = req.user.id;
  }
  if (!id) {
    next(new AppError('Please provide the id of comment', 404));
  }
  const comment = await Comment.findById(id);

  if (!comment) next(new AppError('please provide valid comment id', 404));
  if (comment.userId.toString() === req.body.userId) {
    const deleteCom = await Comment.findByIdAndDelete(id);
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Comment deleted successfully',
      },
    });
  } else {
    res.status(405).json({
      status: 'fail',
      data: {
        message: 'You do not have permission to delete this comment',
      },
    });
  }
});

// exports.deleteReplyComment = catchAsync(async (req, res, next) => {
//   req.body.userId = req.body.userId || req.user.id;

//   const comment_id = req.params.commentId;
//   const reply_id = req.params.replyId;

//   if (!comment_id && !reply_id)
//     next(new AppError('please provide comment and reply id', 403));

//   const sameUser = await Comment.findById(comment_id);

//   if (!sameUser || !sameUser.replies) {
//     next(new AppError('No replies found or comment does not exist', 404));
//   }

//   const userReply = sameUser.replies.find(
//     (el) =>
//       el._id.toString() === reply_id && el.userId.toString() === req.body.userId
//   );
//   console.log(userReply);

//   if (!userReply) {
//     next(
//       new AppError(
//         'Reply not found or you do not have permission to delete it',
//         403
//       )
//     );
//   }

//   const comment = await Comment.findOneAndUpdate(
//     { _id: comment_id },
//     { $pull: { replies: { _id: reply_id } } },
//     { new: true }
//   );

//   if (!comment) {
//     next(new AppError('Comment or reply not found', 404));
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       message: 'reply in a comment deleted successfully',
//     },
//   });
// });

exports.deleteReplyComment = catchAsync(async (req, res, next) => {
  req.body.userId = req.body.userId || req.user.id;

  const comment_id = req.params.commentId;
  const reply_id = req.params.replyId;

  if (!comment_id || !reply_id) {
    return next(new AppError('Please provide comment and reply IDs', 403));
  }

  const sameUser = await Comment.findById(comment_id);

  if (!sameUser || !sameUser.replies) {
    return next(
      new AppError('No replies found or comment does not exist', 404)
    );
  }

  const userReply = sameUser.replies.find(
    (el) =>
      el._id.toString() === reply_id && el.userId.toString() === req.body.userId
  );
  console.log(userReply);

  if (!userReply) {
    return next(
      new AppError(
        'Reply not found or you do not have permission to delete it',
        403
      )
    );
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: comment_id },
    { $pull: { replies: { _id: reply_id } } },
    { new: true }
  );

  if (!comment) {
    return next(new AppError('Comment or reply not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Reply in a comment deleted successfully',
    },
  });
});
