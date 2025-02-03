const express = require('express');
const messageController = require('../controllers/messageController');
const authController = require('../controllers/authController');

const router = express.Router();
router.use(authController.protect);

router.route('/get-messages').post(messageController.getMessages);

module.exports = router;
