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

// Function to generate stream thumbnail
const generateStreamThumbnail = (streamKey) => {
  console.log('--------Generating Thumbnails--------')
  const streamUrl = host + ':8888/live/' + streamKey + '.flv';
  const streamThumbnailArgs = [
    '-y',
    '-i', streamUrl,
    '-ss', '00:00:01',
    '-vframes', '1',
    '-vf', 'scale=-2:300',
    'server/thumbnails/'+streamKey+'.png',
  ];

  // Spawn child process to generate stream thumbnail in background
  spawn(ffmpeg, streamThumbnailArgs, {
    detached: true,
    stdio: 'ignore',
  }).unref();
};

// Make generated video smaller
// Resize video, delete video, upload video,
// Upload video thumbnails, update video info to db
const processVideo = (streamKey, streamPath) => {
  console.log('--------Generating Resized Video--------');

  // Set video file path and read files in directory
  const filePath = 'server/media' + streamPath + '/';
  fs.readdir(filePath, (err, files) => {
    if (err) {
      throw err;
    }

    // Add 1 to child process for every video file
    // Child process counter is needed to account for process done later
    let numChildProcess = 0;
    files.forEach((filename) => {
      if (filename.indexOf('resized') === -1) {
        const name = filename.split('.')[0]+'-resized.mp4';
        if (!files.includes(name)) {
          numChildProcess += 1;
          console.log('--------process number start: ', numChildProcess, '--------');

          const videoResizingArgs = [
            '-i', filePath + filename,
            '-s', '1280x720',
            '-ss', '00:00:04',
            '-vframes', '600',
            '-max_muxing_queue_size', '1024',
            filePath+name,
          ];

          const ffmpegProcess = spawn(ffmpeg, videoResizingArgs);

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
            // Code 0 indicating ffmpeg process successed
            console.log(`ffmpeg process exited with code ${code}`);
            console.log('--------process number end: ', numChildProcess, '--------');
            numChildProcess -= 1;

            // Upload resized files to s3 and remove all video files
            if (numChildProcess === 0 && code === 0) {
              console.log('All ffmpeg process done!');
              removeAndUploadFiles(streamKey, filePath);
            }
          });
        }
      }
    });
  });
};

// Function to remove video files and upload files to s3
const removeAndUploadFiles = async (streamKey, filePath) => {
  fs.readdir(filePath, (err, files) => {
    if (err) {
      throw err;
    }

    files.forEach((fileName) => {
      if (fileName.indexOf('resized') === -1) {
        // Delete original video file
        fs.unlink(filePath+fileName, (err) => {
          if (err) {
            throw err;
          }
          console.log(fileName, ' removed');
        });
      } else {
        // Upload resized video file and video thumbnail
        uploadFile(streamKey, filePath, fileName);

        const videoURL = config.s3.url+`/media/${streamKey}/${fileName}`;
        const thumbnailURL = config.s3.url+`/media/${streamKey}/${fileName.split('.')[0]+'.png'}`;

        // const streamTitle = await query('SELECT stream_title FROM users WHERE stream_key = ?', [streamKey])

        // Insert video url and video thumbnail url into database
        const videoObj = {
          stream_key: streamKey,
          // stream_title: streamTitle,
          video_url: videoURL,
          img_url: thumbnailURL,
          time_created: new Date(),
        };
        query('INSERT INTO videos SET ?', [videoObj]);
      }
    });
  });
};

// Function to catch error
// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const catchAsyncError = (fn) => {
  return function(req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

// Function to update thumbnails every 20s
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

// Accepting a file with multer S3 and upload file
aws.config.update({
  secretAccessKey: config.s3.secretKey,
  accessKeyId: config.s3.accessKey,
  region: 'ap-northeast-2',
});

// Define s3 and s3 multer
const s3 = new aws.S3();
const storage = multerS3({
  s3: s3,
  acl: 'public-read',
  bucket: 'streamit-tw',
  key: function(req, file, cb) {
    // set uploaded filename with user email
    let fileName = req.body.email.split('.').join('-');
    fileName = fileName.replace('@', '-');

    // get image file extension
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

// Uploading a file to S3
const uploadFile = (streamKey, filePath, fileName) => {
  const fileContent = fs.readFileSync(filePath+fileName);

  // S3 video upload parameters
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

  // S3 thumbnail upload parameters
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
  catchAsyncError,
  job,
  fileType,
  uploadFile,
};
