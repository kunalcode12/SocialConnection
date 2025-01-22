const express = require('express');
const mediaController = require('../controllers/mediaController');
const authController = require('../controllers/authController');
const multer = require('multer');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.route('/feed').get(mediaController.getFeed);
router.use(authController.protect);

router.route('/user/:userId').get(mediaController.getUserMedia);
router.route('/search').get(mediaController.searchMedia);

router.route('/initialize').get(mediaController.initializeUpload);
router.post('/chunk', upload.single('chunk'), mediaController.uploadChunk);
router.get('/status/:uploadId', mediaController.getUploadStatus);
router.get('/stream/:id', mediaController.streamMedia);
router.put('/:id', mediaController.updateMedia);
router.delete('/:id', mediaController.deleteMedia);

module.exports = router;
