const router = require('express').Router();
const {wrapAsync} = require('../../utils/util');

const {
  getUserVOD,
} = require('../controllers/vod_controller');

router.get('/vod/user',
    wrapAsync(getUserVOD));

module.exports = router;
