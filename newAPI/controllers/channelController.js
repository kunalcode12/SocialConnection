const Channel = require('../models/channelModel');
const Message = require('../models/channelModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createChannel = catchAsync(async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.user.id;

    const admin = await User.findById(userId);
    if (!admin) {
      next(new AppError('Admin User not found', 400));
    }

    const validMembers = await User.find({ _id: { $in: members } });

    if (validMembers.length !== members.length) {
      next(new AppError('Some members are not valid users.', 400));
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();

    res.status(201).json({
      Channel: newChannel,
    });
  } catch (error) {
    console.log({ error });
    next(new AppError('Internal Server Error', 500));
  }
});
