require('dotenv').config();

// RTMP server config & process env configs
const config = {

  host: {
    local: 'http://127.0.0.1',
    cloud: 'https://streamit.website',
  },

  rtmp_server: {
    rtmp: {
      port: 1935,
      chunk_size: 60000,
      gop_cache: true,
      ping: 60,
      ping_timeout: 30,
    },

    // RTMP server http video route
    http: {
      // port: 8000,
      port: 8888,
      mediaroot: './server/media',
      allow_origin: '*',
    },

    // RTMP server https video route
    // https: {
    //   port: 8888,
    //   mediaroot: './server/media',
    //   key: './private.pem',
    //   cert: './certChain.crt',
    //   allow_origin: '*',
    // },

    // Set ffmpeg route and video converting format
    trans: {
      //ffmpeg: 'D:/AppWorks/videoStream/streamit/utils/ffmpeg.exe',
      ffmpeg: 'F:/AppWorks/videoStream/ffmpeg/bin/ffmpeg.exe',
      // ffmpeg: '/usr/bin/ffmpeg',
      tasks: [
        {
          app: 'live',
          mp4: true,
          mp4Flags: '[movflags=faststart]',
        },
      ],
    },
  },

  s3: {
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY,
    url: process.env.AWS_S3_URL,
  },

  tokenExpire: process.env.TOKEN_EXPIRE,

  salt: process.env.BCRYPT_SALT,

  secret: process.env.SECRET,

  nodeEnv: process.env.NODE_ENV,

  dbhost: process.env.dbHOST,

  dbUser: process.env.dbUSERNAME,

  dbPass: process.env.dbPASSWORD,

  db: process.env.DATABASE,

  dbTest: process.env.DATABASE_TEST,

  stripePK: process.env.STRIPE_PUBLISHABLE_KEY,

  stripeSK: process.env.STRIPE_SECRET_KEY,

};

module.exports = config;
