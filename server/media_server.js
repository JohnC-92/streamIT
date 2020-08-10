const NodeMediaServer = require('node-media-server');
const rtmpConfig = require('../utils/config').rtmp_server;
const {query} = require('../utils/mysqlcon');
const {generateStreamThumbnail, processVideo} = require('../utils/util');

// Create media server with preset configs
nms = new NodeMediaServer(rtmpConfig);

// Check if requesting stream user is valid before publishing with provided stream key
nms.on('prePublish', async (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  const streamKey = getStreamKeyFromStreamPath(StreamPath);

  // Query database with user provided stream key
  const user = await query('SELECT * FROM users WHERE stream_key = ?', [streamKey]);

  // Generate stream thumbnail if user valid
  if (user.length !== 0) {
    generateStreamThumbnail(streamKey);
  } else {
  // Reject streaming if user invalid
    const session = nms.getSession(id);
    session.reject();
  }
});

// Process video after streaming is done
nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

  // Resize video + Delete video + Upload resized video + Update video info to database
  const streamKey = getStreamKeyFromStreamPath(StreamPath);
  processVideo(streamKey, StreamPath);
});

// Parse stream key from stream path
const getStreamKeyFromStreamPath = (path) => {
  const parts = path.split('/');
  return parts[parts.length - 1];
};

module.exports = nms;
