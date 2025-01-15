const Content = require('../models/contentModel');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const appError = require('../utils/appError');

exports.CreateContent = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  const { upVote, downVote, flagged, ...updates } = req.body;
  const content = await Content.create(updates);

  res.status(201).json({
    status: 'success',
    data: {
      data: content,
    },
  });
});

exports.getAllContent = catchAsync(async (req, res, next) => {
  // const content = await Content.find(req.query);
  // res.status(201).json({
  //   status: 'success',
  //   result: content.length,
  //   data: {
  //     data: content,
  //   },
  // });
});

exports.contentDiscovery = catchAsync(async (req, res, next) => {
  const search = req.query.search;

  const queryObj = { ...req.query };
  const excludedField = ['page', 'sort', 'limit', 'field'];
  excludedField.forEach((el) => delete queryObj[el]);

  let queryStr = JSON.stringify(queryObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

  let query = Content.find(JSON.parse(queryStr));

  //most popular(most upvoted),newest content
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    console.log(req.query.sort);
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  //pages
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  //Search
  if (search) {
    query = Content.find({
      title: { $regex: search, $options: 'i' },
    });
  }

  const contents = await query.populate('user');

  res.status(200).json({
    status: 'success',
    results: contents.length,
    data: {
      data: contents,
    },
  });
});

exports.trendingContent = catchAsync(async (req, res, next) => {
  req.query.sort = '-upVote';
  req.query.limit = '10';
  next();
});

exports.contentCategory = catchAsync(async (req, res, next) => {
  const content = await Content.find()
    .where('category')
    .equals(req.query.category);

  res.status(200).json({
    status: 'success',
    results: content.length,
    data: {
      data: content,
    },
  });
});

exports.getFlaggedContent = catchAsync(async (req, res, next) => {});

exports.updateContent = catchAsync(async (req, res, next) => {
  const content = await Content.findById(req.params.id);

  if (!content.isOwnedBy(req.user.id)) {
    next(
      new appError('You do not have permission to update this content', 403)
    );
  }
  if (!content) {
    next(new appError('No content found with that ID', 404));
  }

  const { upVote, downVote, flagged, ...updates } = req.body;
  const update = await Content.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!update) {
    next(new appError('No content found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      data: update,
    },
  });
});

exports.deleteContent = catchAsync(async (req, res, next) => {
  const content = await Content.findById(req.params.id);

  if (!content.isOwnedBy(req.user.id)) {
    next(
      new appError('You do not have permission to update this content', 403)
    );
  }
  if (!content) {
    next(new appError('No content found with that ID', 404));
  }
  const deleteContent = await Content.findByIdAndDelete(req.params.id);
  res.status(201).json({
    status: 'success',
    message: 'Content deleted successfully',
  });
});
