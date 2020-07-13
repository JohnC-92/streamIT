const spawn = require('child_process').spawn;
const config = require('./config');
const ffmpeg = config.rtmp_server.trans.ffmpeg;
const host = config.host.local;
const streamAPI = host + ':8888/live/';

const CronJob = require('cron').CronJob;
const request = require('request');

const generateStreamThumbnail = (streamKey) => {
  console.log('--------Generating Thumbnails--------')
  const args = [
    '-y',
    '-i', streamAPI + streamKey + '/index.m3u8',
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

// reference: https://thecodebarbarian.com/80-20-guide-to-express-error-handling
const wrapAsync = (fn) => {
  return function(req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next);
  };
};

const job = new CronJob('*/5 * * * * *', () => {
  request
      .get(host + ':/8888/api/streams', (err, res, body) => {
        if (body) {
          const streams = JSON.parse(body);
          if (typeof (streams['live'] !== undefined)) {
            const liveStreams = streams['live'];
            for (let stream in liveStreams) {
              if (!liveStreams.hasOwnProperty(stream)) continue;
              generateStreamThumbnail(stream);
            }
          }
        }
      });
}, null, true);

module.exports = {
  generateStreamThumbnail,
  wrapAsync,
  job,
};

