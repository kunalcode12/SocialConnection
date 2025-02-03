const Message = require('../models/messagesModel');
const appError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getMessages = catchAsync(async (req, res, next) => {
  const user1 = req.user.id;
  const user2 = req.body.id;

  if (!user1 || !user2) {
    return next(new appError("Both user ID's are required.", 400));
  }

  const messages = await Message.find({
    $or: [
      { senders: user1, recipient: user2 },
      { senders: user2, recipient: user1 },
    ],
  }).sort({ timestamp: 1 });

  res.status(200).json({ messages });
});
