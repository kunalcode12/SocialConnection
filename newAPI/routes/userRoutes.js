const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/signin', authController.signin);

router.post('/forgotPassword', authController.forgetPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router
  .route('/bookmark/:contentId')
  .post(userController.addBookmarks)
  .delete(userController.removeBookmarks);

router.route('/searchUser').get(userController.searchuser);

router.get('/me', userController.getMe, userController.getMeUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);

router.route('/:id').get(userController.getUser);
router.use(authController.restrictTo('admin'));
router.route('/').get(userController.getAllUser);

module.exports = router;
