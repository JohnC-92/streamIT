const router = require('express').Router();
const {catchAsyncError} = require('../../utils/util');

const {
  getUserVODs,
  getUserVOD,
} = require('../controllers/vod_controller');

// get all user VODs with user stream key
router.get('/vods/:streamKey',
    catchAsyncError(getUserVODs));

// get single user VOD with video id
router.get('/vod/:id',
    catchAsyncError(getUserVOD));

module.exports = router;
