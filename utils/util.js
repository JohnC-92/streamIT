const spawn = require('child_process').spawn;
const config = require('./config');
const ffmpeg = config.rtmp_server.trans.ffmpeg;
const host = config.host.local;
const {query} = require('./mysqlcon');
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
// resize video, delete video, upload video,
// upload video thumbnails, update video info to db
const processVideo = (streamKey, streamPath) => {
  console.log('--------Generating Resized Video--------');

  const filePath = 'server/media' + streamPath + '/';
  fs.readdir(filePath, (err, files) => {
    if (err) {
      throw err;
    }

    let numProcess = 0;
    files.forEach((filename) => {
      if (filename.indexOf('resized') === -1) {
        const name = filename.split('.')[0]+'-resized.mp4';
        if (!files.includes(name)) {
          numProcess += 1;
          console.log('--------process number start: ', numProcess, '--------');

          const args = [
            '-i', filePath + filename,
            '-s', '1280x720',
            '-ss', '00:00:04',
            '-vframes', '600',
            '-max_muxing_queue_size', '1024',
            filePath+name,
          ];

          const ffmpegProcess = spawn(ffmpeg, args);

          ffmpegProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });

          ffmpegProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
          });

          ffmpegProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
          });

          ffmpegProcess.on('close', (code) => {
            console.log(`ffmpeg process exited with code ${code}`);
            console.log('--------process number end: ', numProcess, '--------');
            numProcess -= 1;
            if (numProcess === 0) {
              console.log('All ffmpeg process done!');
              removeAndUploadFiles(streamKey, filePath);
            }
          });
        }
      }
    });
  });

};

const removeAndUploadFiles = (streamKey, filePath) => {
  fs.readdir(filePath, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach((fileName) => {
      if (fileName.indexOf('resized') === -1) {
        fs.unlink(filePath+fileName, (err) => {
          if (err) {
            throw err;
          }
          console.log(fileName, ' removed');
        });
      } else {
        // upload video file and video thumbnail
        uploadFile(streamKey, filePath, fileName);

        const videoURL = config.s3.url+`/media/${streamKey}/${fileName}`;
        const thumbnailURL = config.s3.url+`/media/${streamKey}/${fileName.split('.')[0]+'.png'}`;

        const videoObj = {
          stream_key: streamKey,
          video_url: videoURL,
          img_url: thumbnailURL,
          time_created: new Date(),
        };
        query('INSERT INTO videos SET ?', [videoObj]);
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

// function to update thumbnails every 20s
const options = {
  uri: host + ':8888/api/streams',
  headers: {
    'User-Agent': 'Request-Promise',
  },
  rejectUnauthorized: false,
  json: true, // Automatically parses the JSON string in the response
};

const job = new CronJob('*/20 * * * * *', () => {
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
    let fileName = req.body.email.split('.').join('-');
    fileName = fileName.replace('@', '-');
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

const uploadFile = (streamKey, filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath+fileName);

  // s3 video upload parameters
  const videoFile = {
    Bucket: 'streamit-tw',
    Key: `media/${streamKey}/${fileName}`,
    Body: fileContent,
    // Key: `${key}/${fileName}`,
    // Body: fileContent,
  };

  s3.upload(videoFile, (err, data) => {
    if (err) {
      throw err;
    }
    console.log(`Video file uploaded successfully...`);
    fs.unlink(filePath+fileName, (err) => {
      if (err) {
        throw err;
      }
      console.log(`Original file removed successfully...`);
    });
  });

  // s3 thumbnail upload parameters
  const thumbnailContent = fs.readFileSync('server/thumbnails/'+streamKey+'.png');
  const thumbnailName = fileName.split('.')[0]+'.png';
  const thumbnailFile = {
    Bucket: 'streamit-tw',
    Key: `media/${streamKey}/${thumbnailName}`,
    Body: thumbnailContent,
  };

  s3.upload(thumbnailFile, (err, data) => {
    if (err) {
      throw err;
    }
    console.log(`Video thumbnail uploaded successfully...`);
  });
};

module.exports = {
  generateStreamThumbnail,
  processVideo,
  wrapAsync,
  job,
  fileType,
  uploadFile,
};
