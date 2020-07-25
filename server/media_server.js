const NodeMediaServer = require('node-media-server');
const rtmpConfig = require('../utils/config').rtmp_server;
const {query} = require('../utils/mysqlcon');
const {generateStreamThumbnail, generateResizedVideo, uploadFile} = require('../utils/util');

const rp = require('request-promise');

nms = new NodeMediaServer(rtmpConfig);

nms.on('prePublish', async (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  const streamKey = getStreamKeyFromStreamPath(StreamPath);

  const user = await query('SELECT * FROM users WHERE stream_key = ?', [streamKey]);
  if (user.length !== 0) {
    generateStreamThumbnail(streamKey);
  } else {
    const session = nms.getSession(id);
    session.reject();
  }
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  // resized video
  generateResizedVideo(StreamPath);

  // delete video file
  // fs.unlink()

  // // upload video file
  // const streamKey = getStreamKeyFromStreamPath(StreamPath);
  // uploadFile(streamKey, '123');

  // // function to update thumbnails every 5s
  // const options = {
  //   uri: 'http://localhost:4000/resize',
  //   headers: {
  //     'User-Agent': 'Request-Promise',
  //   },
  //   rejectUnauthorized: false,
  //   json: true, // Automatically parses the JSON string in the response
  // };

  // rp(options)
  //     .then((res) => {
  //       console.log('Request promising!')
  //       console.log(res);
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
});

// const generateResizedVideo = (StreamPath) => {
//   console.log('--------Generating Resized Video--------')

//   const filePath = 'server/media' + StreamPath + '/';

//   fs.readdir(filePath, (err, files) => {
//     files.forEach((filename) => {
//       if (filename.indexOf('resized') === -1) {
//         const args = [
//           '-i', filePath + filename,
//           '-s', '1280x720',
//           '-ss', '00:00:04',
//           '-vframes', '600',
//           '-max_muxing_queue_size', '1024',
//           filePath+filename.split('.')[0]+'-resized.mp4',
//         ];

//         spawn(ffmpeg, args, {
//           detached: true,
//           stdio: 'ignore',
//         }).unref();
//       }
//     });
//   });
// };

// nms.on('prePlay', (id, StreamPath, args) => {
//   console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
//   console.log('-------------------------PRE PLAY-----------------------------------')
//   // let session = nms.getSession(id);
//   // session.reject();
// });

// nms.on('doneConnect', (id, args) => {
//   if(!args.streamPath) {

//   }
// });

// parse stream key from stream path
const getStreamKeyFromStreamPath = (path) => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

const saveStreamVideo = (stream) => {

}

module.exports = nms;
