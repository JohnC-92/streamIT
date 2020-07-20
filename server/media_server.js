const NodeMediaServer = require('node-media-server');
const rtmpConfig = require('../utils/config').rtmp_server;
const {query} = require('../utils/mysqlcon');
const {generateStreamThumbnail} = require('../utils/util');

nms = new NodeMediaServer(rtmpConfig);

nms.on('prePublish', async (id, StreamPath, args) => {
  const streamKey = getStreamKeyFromStreamPath(StreamPath);
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

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
  console.log('--------------------DONE PUBLISHING---------------------------')
});

nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log('-------------------------PRE PLAY-----------------------------------')
  // let session = nms.getSession(id);
  // session.reject();
});

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
