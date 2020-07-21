const router = require('express').Router();
// const {wrapAsync} = require('../../utils/util');
const {wrapAsync, fileType} = require('../../utils/util');

const {
  signUp,
  signIn,
  getUserProfile,
  getUserKeys,
  getSingleUserKey,
  updateUserImg,
  updateUserProfile,
  deleteUserProfile,
  getFollowers,
  updateFollowers,
  getSubFollow,
} = require('../controllers/user_controllers');

router.get('/test',
    wrapAsync(test));

router.post('/user/signup',
    wrapAsync(signUp));

router.post('/user/signin',
    wrapAsync(signIn));

router.get('/user/profile',
    wrapAsync(getUserProfile));

router.get('/user/keys',
    wrapAsync(getUserKeys));

router.get('/user/keys/:key',
    wrapAsync(getSingleUserKey));

// update profile img route
router.post('/user/updateImg', fileType,
    wrapAsync(updateUserImg));

// update profile route
router.post('/user/updateProfile',
    wrapAsync(updateUserProfile));

// delete user profile
router.post('/user/deleteProfile',
    wrapAsync(deleteUserProfile));

// get and update followers route
router.get('/user/getFollowers',
    wrapAsync(getFollowers));

router.post('/user/updateFollowers',
    wrapAsync(updateFollowers));

// update subscriber route

// router.get('/user/profile/:category',
//     wrapAsync(getSubFollow));

module.exports = router;

async function test(req, res) {
  res.send('Testing123 Works! :D');
}


// const config = require('../../utils/config');
// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const aws = require('aws-sdk');

// aws.config.update({
//   secretAccessKey: config.s3.secretKey,
//   accessKeyId: config.s3.accessKey,
//   region: 'ap-northeast-2',
// });
  
// const s3 = new aws.S3();
// // const storage = multerS3({
// //   s3: s3,
// //   acl: 'public-read',
// //   bucket: 'streamit-tw',
// //   key: function(req, file, cb) {
// //     console.log(file);
// //     console.log(req.body);
// //     const fileExt = file.originalname.split('.').pop();
// //     cb(null, 'profileImg/' + req.body.username + '.' + fileExt);
// //   },
// // });

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     console.log(req.body);
//     console.log(123)
//     req.abc = 'testing123';
//     cb(null, '/tmp/my-uploads')
//   },
//   filename: function (req, file, cb) {
//     console.log(file);
//     console.log(req.body);
//     console.log(req.abc)
//     cb(null, file.fieldname + '-' + Date.now())
//   }
// })
   
// const upload = multer({storage: storage});

// // update profileimg route
// router.post('/user/updateImg', upload.single('profileImg'),
//   update);

// async function update(req, res) {
//   console.log(req.body);
//   return res.send('good')
// }