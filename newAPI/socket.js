const { Server } = require('socket.io');
const Message = require('./models/messagesModel');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  // const sendMessage = async (message) => {
  //   console.log('Running!!');
  //   const senderSocketId = userSocketMap.get(message.senders);
  //   const recipientSocketId = userSocketMap.get(message.recipient);
  //   console.log(senderSocketId);

  //   const createdMessage = await Message.create(message);
  //   console.log(createdMessage);
  //   const messageData = await Message.findById(createdMessage._id)
  //     .populate('senders', 'id email name profilePicture')
  //     .populate('recipient', 'id email name profilePicture');

  //   console.log(messageData);

  //   if (recipientSocketId) {
  //     io.to(recipientSocketId).emit('recieveMessage', messageData);
  //   }
  //   if (senderSocketId) {
  //     io.to(senderSocketId).emit('recieveMessage', messageData);
  //   }
  // };

  const sendMessage = async (message) => {
    try {
      const createdMessage = await Message.create(message);
      const messageData = await Message.findById(createdMessage._id)
        .populate('senders', 'id email name profilePicture')
        .populate('recipient', 'id email name profilePicture');

      // console.log(messageData);
      // console.log(userSocketMap);

      const senderSocketId = userSocketMap.get(message.senders);
      const recipientSocketId = userSocketMap.get(message.recipient);

      console.log('Sender Socket ID:', senderSocketId);
      console.log('Recipient Socket ID:', recipientSocketId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('recieveMessage', messageData);
      }

      if (senderSocketId) {
        io.to(senderSocketId).emit('recieveMessage', messageData);
      }

      // return messageData;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  };

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log('User Id not provided during connection.');
    }

    socket.on('sendMessage', sendMessage);
    socket.on('disconnect', () => disconnect(socket));
  });
};

module.exports = setupSocket;
