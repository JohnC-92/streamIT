const router = require('express').Router();
const {catchAsyncError} = require('../../utils/util');

const {
  getUserVOD,
  getUserOneVOD,
} = require('../controllers/vod_controller');

router.get('/vod/:streamKey',
    catchAsyncError(getUserVOD));

router.get('/vodOne/:id',
    catchAsyncError(getUserOneVOD));

module.exports = router;
