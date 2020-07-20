const spawn = require('child_process').spawn;
const config = require('./config');
const ffmpeg = config.rtmp_server.trans.ffmpeg;
const host = config.host.local;
const CronJob = require('cron').CronJob;
const rp = require('request-promise');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

// function to generate stream thumbnail
const generateStreamThumbnail = (streamKey) => {
  console.log('--------Generating Thumbnails--------')
  // const url = host + ':8888/live/' + streamKey + '/index.m3u8';
  const streamUrl = host + ':8888/live/' + streamKey + '.flv';
  const args = [
    '-y',
    // '-i', host + ':8888/live/' + streamKey + '/index.m3u8',
    // '-i', 'http://127.0.0.1:8888/live/CVRbgD9gy/index.m3u8',
    '-i', streamUrl,
    '-ss', '00:00:01',
    '-vframes', '1',
    '-vf', 'scale=-2:300',
    'server/thumbnails/'+streamKey+'.png',
  ];

  spawn(ffmpeg, args, {
    detached: true,
    stdio: 'ignore',
  }).unref();
};

// function to catch error
// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function(req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

// function to update thumbnails every 5s
const options = {
  uri: host + ':8888/api/streams',
  headers: {
    'User-Agent': 'Request-Promise',
  },
  json: true, // Automatically parses the JSON string in the response
};

const job = new CronJob('*/5 * * * * *', () => {
  rp(options)
      .then((res) => {
        if (res) {
          const liveStreams = res.live;
          for (let stream in liveStreams) {
            if (!liveStreams.hasOwnProperty(stream)) continue;
            generateStreamThumbnail(stream);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
}, null, true);

// multer S3 file uploading
aws.config.update({
  secretAccessKey: config.s3.secretKey,
  accessKeyId: config.s3.accessKey,
  region: 'ap-northeast-2',
});

const s3 = new aws.S3();
const storage = multerS3({
  s3: s3,
  acl: 'public-read',
  bucket: 'streamit-tw',
  key: function(req, file, cb) {
    console.log(file);
    const fileName = req.body.email.split('.').join('-');
    const fileExt = file.originalname.split('.').pop();
    cb(null, 'profileImg/' + fileName + '.' + fileExt);
  },
});

const upload = multer({storage: storage});
const fileType = upload.fields(
    [
      {name: 'profileImg', maxCount: 1},
    ],
);

module.exports = {
  generateStreamThumbnail,
  wrapAsync,
  job,
  fileType,
};

