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

router.get('/test',
    catchAsyncError(test));

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