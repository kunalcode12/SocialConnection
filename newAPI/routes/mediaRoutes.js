const express = require('express');
const mediaController = require('../controllers/mediaController');
const authController = require('../controllers/authController');
const multer = require('multer');

const router = express.Router();

router.route('/feed').get(mediaController.getFeed);
router.use(authController.protect);

router.route('/user/:userId').get(mediaController.getUserMedia);
router.route('/search').get(mediaController.searchMedia);

router.route('/initialize').post(mediaController.initializeUpload);
router.post('/chunk', mediaController.uploadChunk);
router.get('/status/:uploadId', mediaController.getUploadStatus);
router.get('/stream/:id', mediaController.streamMedia);
router.put('/:id', mediaController.updateMedia);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;
