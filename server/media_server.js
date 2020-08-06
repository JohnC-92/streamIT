const NodeMediaServer = require('node-media-server');
const rtmpConfig = require('../utils/config').rtmp_server;
const s3 = require('../utils/config').s3;
const {query} = require('../utils/mysqlcon');
const {generateStreamThumbnail, processVideo} = require('../utils/util');

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

// nms.on('donePublish', (id, StreamPath, args) => {
//   console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

//   // resize video + delete video + upload resized video + update video info to database
//   const streamKey = getStreamKeyFromStreamPath(StreamPath);
//   processVideo(streamKey, StreamPath);
// });

nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  // resize video + delete video + upload resized video + update video info to database
  const streamKey = getStreamKeyFromStreamPath(StreamPath);
  processVideo(streamKey, StreamPath);
});

// parse stream key from stream path
const getStreamKeyFromStreamPath = (path) => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

module.exports = nms;
