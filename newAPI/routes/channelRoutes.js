const express = require('express');
const authController = require('../controllers/authController');
const channelController = require('../controllers/channelController');

const router = express.Router();

router.use(authController.protect);

router.route('/create-channel').post(channelController.createChannel);

module.exports = router;
