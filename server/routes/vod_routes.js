const router = require('express').Router();
const {wrapAsync} = require('../../utils/util');

const {
  getUserVOD,
  getUserOneVOD,
} = require('../controllers/vod_controller');

router.get('/vod/:streamKey',
    wrapAsync(getUserVOD));

router.get('/vodOne/:id',
    wrapAsync(getUserOneVOD));

module.exports = router;
