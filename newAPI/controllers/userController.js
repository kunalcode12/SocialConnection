const Content = require('../models/contentModel');
const User = require('../models/userModel');
const { use } = require('../routes/commentRoutes');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find(req.query).populate({
    path: 'contents',
    select: '_id  -user',
  });
  res.status(201).json({
    status: 'success',
    data: users,
  });
});

exports.getMeUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: 'contents',
      select: 'title upVote downVote description createdAt -user url',
    })
    .populate({
      path: 'bookmarkedCont.content',
      select: 'title upVote downVote description createdAt  url',
    });

  if (!user) {
    return next(new AppError('No user found by this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate({
      path: 'contents',
      select: 'title upVote downVote description createdAt -user url',
    })
    .populate({
      path: 'bookmarkedCont.content',
      select: 'title upVote downVote description user createdAt url',
    });

  if (!user) {
    return next(new AppError('No user found by this ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      data: user,
    },
  });
});

exports.searchuser = catchAsync(async (req, res, next) => {
  const search = req.query.search;
  if (!search) {
    next(new AppError('Please provide the field you want to search', 403));
  }
  const result = await User.find({
    name: { $regex: search, $options: 'i' },
  }).populate({
    path: 'contents',
    select: 'title upVote downVote createdAt -user url',
  });
  if (!result) {
    next(new AppError('Could not found your query', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      result,
    },
  });
});

exports.addBookmarks = catchAsync(async (req, res, next) => {
  if (!req.body.userId) {
    req.body.userId = req.user.id;
  }
  const id = req.body.userId;
  const contentData = req.params.contentId;

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isBookmarked = user.bookmarkedCont.some((bookmark) => {
    return bookmark.content && bookmark.content.toString() === contentData;
  });

  if (isBookmarked) {
    return next(new AppError('This content is already bookmarked.', 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $push: { bookmarkedCont: { content: contentData } } },
    { new: true, runValidators: false }
  );

  if (!updatedUser) {
    return next(new AppError('Error updating user', 500));
  }

  res.status(201).json({
    status: 'success',
    data: {
      bookmarks: updatedUser.bookmarkedCont,
    },
  });
});

exports.removeBookmarks = catchAsync(async (req, res, next) => {
  const userId = req.body.userId || req.user.id;
  const contentId = req.params.contentId;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const bookmarkIndex = user.bookmarkedCont.findIndex(
    (bookmark) => bookmark.content.toString() === contentId
  );
  console.log(bookmarkIndex);

  if (bookmarkIndex === -1) {
    return next(new AppError('Bookmark not found', 404));
  }

  user.bookmarkedCont.splice(bookmarkIndex, 1);

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Bookmark deleted successfully',
    data: {
      bookmarks: user.bookmarkedCont,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1)Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates .Please use /updateMyPassword',
        400
      )
    );
  }

  //as in req.body there can we many fields which user want to update but we only want to allow the user to only update name and email so we use filterObj() function to filter out the all the unnecessary details and only provide email and name
  const filteredBody = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//from this function user can delete itself means deleting account from our webapp
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
