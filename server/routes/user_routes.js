const router = require('express').Router();
// const {catchAsyncError} = require('../../utils/util');
const {catchAsyncError, fileType} = require('../../utils/util');

const {
  signUp,
  signIn,
  getUserProfileToken,
  getAllUsers,
  getSingleUser,
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
    catchAsyncError(getUserProfileToken));

router.get('/user/keys',
    catchAsyncError(getAllUsers));

router.get('/user/keys/:id',
    catchAsyncError(getSingleUser));

// update profile img route
router.put('/user/img', fileType,
    catchAsyncError(updateUserImg));

// update profile route
router.put('/user/profile',
    catchAsyncError(updateUserProfile));

// delete user profile
router.delete('/user/profile',
    catchAsyncError(deleteUserProfile));

// get and update followers route
router.get('/user/followers',
    catchAsyncError(getFollowers));

router.put('/user/followers',
    catchAsyncError(updateFollowers));

module.exports = router;
