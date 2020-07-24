const spawn = require('child_process').spawn;
const config = require('./config');
const ffmpeg = config.rtmp_server.trans.ffmpeg;
const host = config.host.local;
const CronJob = require('cron').CronJob;
const rp = require('request-promise');
const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');
const fs = require('fs');

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

// make generated video smaller
const generateResizedVideo = (streamPath) => {
  console.log('--------Generating Resized Video--------')

  const filePath = 'server/media' + streamPath + '/';
  fs.readdir(filePath, (err, files) => {
    files.forEach((filename) => {
      if (filename.indexOf('resized') === -1) {
        const name = filename.split('.')[0]+'-resized.mp4';
        if (!files.includes(name)) {
          console.log('Inside Condition');
          const args = [
            '-i', filePath + filename,
            '-s', '1280x720',
            '-ss', '00:00:04',
            '-vframes', '600',
            '-max_muxing_queue_size', '1024',
            filePath+name,
          ];

          spawn(ffmpeg, args, {
            detached: true,
            stdio: 'ignore',
          }).unref();
        }
      }
    });
  });
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
  rejectUnauthorized: false,
  json: true, // Automatically parses the JSON string in the response
};

// const job = new CronJob('*/5 * * * * *', () => {
//   rp(options)
//       .then((res) => {
//         if (res) {
//           const liveStreams = res.live;
//           for (let stream in liveStreams) {
//             if (!liveStreams.hasOwnProperty(stream)) continue;
//             generateStreamThumbnail(stream);
//           }
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//       });
// }, null, true);

// accepting a file with multer S3 and upload file
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

// uploading a file to S3
const uploadFile = (key, fileName) => {
  // const fileContent = fs.readFileSync(fileName);

  const name = 'D:/AppWorks/videoStream/streamit/server/media/live/CVRbgD9gy/2020-07-24-12-14-resized.mp4';
  const content = fs.readFileSync(name);

  // s3 upload parameters
  const params = {
    Bucket: 'streamit-tw',
    // Key: `${key}/${fileName}`,
    // Body: fileContent,
    Key: 'media/CVRbgD9gy/2020-07-24-12-14-resized.mp4',
    Body: content,
  };

  s3.upload(params, (err, data) => {
    if (err) {
      throw err;
    }
    console.log(`Video file uploaded successfully...Location: ${data.location}`);
  });
};

module.exports = {
  generateStreamThumbnail,
  generateResizedVideo,
  wrapAsync,
  // job,
  fileType,
  uploadFile,
};

