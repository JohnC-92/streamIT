const NodeMediaServer = require('node-media-server');
const config = require('../utils/config').rtmp_server;
const {query} = require('../utils/mysqlcon');
const {generateStreamThumbnail} = require('../utils/util');

nms = new NodeMediaServer(config);

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

const getStreamKeyFromStreamPath = (path) => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

module.exports = nms;
