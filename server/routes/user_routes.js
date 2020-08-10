const router = require('express').Router();
// const {catchAsyncError} = require('../../utils/util');
const {catchAsyncError, fileType} = require('../../utils/util');

const {
  signUp,
  signIn,
  getUserProfile,
  getUserKeys,
  getStreamerProfile,
  updateUserImg,
  updateUserProfile,
  deleteUserProfile,
  getFollowers,
  updateFollowers,
} = require('../controllers/user_controllers');

router.post('/user/signup',
    catchAsyncError(signUp));

router.post('/user/signin',
    catchAsyncError(signIn));

router.get('/user/profile',
    catchAsyncError(getUserProfile));

router.get('/user/keys',
    catchAsyncError(getUserKeys));

router.get('/user/keys/:id',
    catchAsyncError(getStreamerProfile));

// update profile img route
router.post('/user/updateImg', fileType,
    catchAsyncError(updateUserImg));

// update profile route
router.post('/user/updateProfile',
    catchAsyncError(updateUserProfile));

// delete user profile
router.post('/user/deleteProfile',
    catchAsyncError(deleteUserProfile));

// get and update followers route
router.get('/user/getFollowers',
    catchAsyncError(getFollowers));

router.post('/user/updateFollowers',
    catchAsyncError(updateFollowers));

module.exports = router;
