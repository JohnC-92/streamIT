const validator = require('validator');
const User = require('../models/user_model');
const {tokenExpire, s3} = require('../../utils/config');
const expire = tokenExpire;

const signUp = async (req, res) => {
  let {name} = req.body;
  const {password, email} = req.body;

  // check if user provided name, password, email
  if (!name || !password || !email) {
    return res.status(400).send({error: 'Name, password and email required'});
  }

  // check if email is valid
  if (!validator.isEmail(email)) {
    return res.status(400).send({error: 'Invalid email format'});
  }

  // escape name to prevent malicious input
  name = validator.escape(name);
  const result = await User.signUp(name, password, email, expire);
  if (result.error) {
    return res.status(403).send({error: result.error});
  }

  const {accessToken, loginAt, user} = result;
  if (!user) {
    return res.status(500).send({error: 'Database Query Error'});
  }

  res.cookie('access_token', accessToken);
  res.send({
    data: {
      accessToken: accessToken,
      accessExpired: expire,
      loginAt: loginAt,
      user: {
        id: user.id,
        provider: user.provider,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    },
  });
};

const signIn = async (req, res) => {
  const {provider} = req.body;

  let result;
  switch (provider) {
    // native login
    case 'native':
      const {email, password} = req.body;
      result = await nativeSignIn(email, password);
      break;
    // facebook login
    case 'facebook':
      const {token} = req.body;
      // const token = process.env.ACCESS_TOKEN;
      result = await facebookSignIn(token);
      break;
    default:
      result = {error: 'Wrong Request'};
  }

  if (result.error) {
    const statusCode = result.status ? result.status: 403;
    return res.status(statusCode).send({error: result.error});
  }

  const {accessToken, loginAt, user} = result;
  if (!user) {
    return res.status(500).send({error: 'Database Query Error'});
  }

  res.cookie('access_token', accessToken);
  res.send({
    data: {
      accessToken: accessToken,
      accessExpired: expire,
      loginAt: loginAt,
      user: {
        id: user.id,
        provider: user.provider,
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    },
  });
};

// const getUserProfile = async (req, res) => {
//   let token = req.header('Authorization');
//   if (!token) {
//     return res.status(400).send({error: 'Token required'});
//   } else {
//     token = token.replace('Bearer ', '');
//   }
//   const result = await User.getUserProfile(token);
//   if (result.error) {
//     return res.status(403).send(result.error);
//   }

//   res.send({
//     data: {
//       id: result.id,
//       provider: result.provider,
//       email: result.email,
//       name: result.name,
//       picture: result.picture,
//     },
//   });
// };

const getUserProfile = async (req, res) => {
  try {
    // if header authorization, check if provided token is valid
    if (req.header('Authorization')) {
      let token = req.header('Authorization');
      token = token.replace('Bearer ', '');

      const result = await User.getUserProfile(token);
      res.send({
        data: {
          id: result.id,
          provider: result.provider,
          email: result.email,
          name: result.name,
          picture: result.picture,
          streamKey: result.stream_key,
          streamTitle: result.stream_title,
          streamType: result.stream_type,
        },
      });
    } else {
      return res.status(400).send({error: 'Token required'});
    };
  } catch (err) {
    return res.status(403).send({error: 'Token Invalid'});
  }
};

const getUserKeys = async(req, res) => {
  const result = await User.getUserKeys();

  const resObj = {};
  result.map((res) => {
    resObj[res.stream_key + '1'] = res.name;
    resObj[res.stream_key + '2'] = res.stream_title;
    resObj[res.stream_key + '3'] = res.picture;
  });

  return res.send(resObj);
};

const getSingleUserKey = async (req, res) => {
  const {key} = req.params;
  const result = await User.getSingleUserKey(key);
  return res.send(result);
}

const updateUserImg = async(req, res) => {
  console.log(req.body);
  const {email} = req.body;
  const fileName = email.split('.').join('-');

  const ext = req.files.profileImg[0].originalname.split('.').pop();
  const imgUrl = `${s3.url}/profileImg/${fileName}.${ext}`;

  const result = await User.updateUserImg(email, imgUrl);
  return res.send(result);
};

const updateUserProfile = async(req, res) => {
  const {name, email, streamTitle, streamType} = req.body;
  const result = await User.updateUserProfile(name, email, streamTitle, streamType);
  return res.send(result);
};

const deleteUserProfile = async(req, res) => {
  const {email} = req.body;
  const result = await User.deleteUserProfile(email);
  return res.send(result);
};

const getFollowers = async (req, res) => {
  const id = req.query.id;
  const result = User.getFollowers(id);
  return res.send(result);
};

const updateFollowers = async (req, res) => {
  const {follow} = req.body;
  if (follow) {
    const {fromId, fromName, toId, toName} = req.body;
    const followedAt = new Date();
    const result = await User.addfollowUser(fromId, fromName, toId, toName, followedAt);
    return res.send(result);
  } else {
    const {fromId, toId} = req.body;
    const result = await User.removefollowUser(fromId, toId);
    return res.send(result);
  }
};

const getSubFollow = async(req, res) => {

};

const nativeSignIn = async (email, password) => {
  try {
    // check if user provided name, password
    if (!email || !password) {
      return {error: 'Email and password required', status: 400};
    }
    const result = await User.nativeSignIn(email, password, expire);
    if (result.error) {
      return {error: result.error};
    }
    return result;
  } catch (err) {
    return {error: err};
  }
};

const facebookSignIn = async (token) => {
  try {
    // check if user provided facebook token
    if (!token) {
      return {error: 'Facebook token required', status: 400};
    }

    const result = await User.facebookSignIn(token, expire);
    if (result.error) {
      return {error: result.error};
    }

    return result;
  } catch (err) {
    return {error: err};
  }
};

module.exports = {
  signUp,
  signIn,
  getUserProfile,
  getUserKeys,
  getSingleUserKey,
  updateUserImg,
  updateUserProfile,
  deleteUserProfile,
  getFollowers,
  updateFollowers,
  getSubFollow,
};

