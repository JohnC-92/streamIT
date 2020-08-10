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

const getUserProfile = async (req, res) => {
  try {
    // if header authorization, check if provided token is valid
    if (req.header('Authorization')) {
      let token = req.header('Authorization');
      token = token.replace('Bearer ', '');

      const result = await User.getUserProfile(token);
      const {followers, followersTime, followed, followedTime} = await followFunction(result.id);

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
          followers: followers,
          followersTime: followersTime,
          followed: followed,
          followedTime: followedTime,
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
    resObj[res.stream_key + '-name'] = res.name;
    resObj[res.stream_key + '-title'] = res.stream_title;
    resObj[res.stream_key + '-picture'] = res.picture;
    resObj[res.stream_key + '-type'] = res.stream_type;
    resObj[res.stream_key + '-id'] = res.id;
  });

  return res.send(resObj);
};

const getStreamerProfile = async (req, res) => {
  const {id} = req.params;
  const result = await User.getStreamerProfile(id);
  const {followers, followersTime, followed, followedTime} = await followFunction([id]);
  // return res.send(result);
  res.send({
    data: {
      id: result[0].id,
      name: result[0].name,
      picture: result[0].picture,
      streamKey: result[0].stream_key,
      streamTitle: result[0].stream_title,
      streamType: result[0].stream_type,
      followers: followers,
      followersTime: followersTime,
      followed: followed,
      followedTime: followedTime,
    },
  });
};

const updateUserImg = async(req, res) => {
  console.log(req.body);
  const {email} = req.body;
  // const fileName = email.split('.').join('-');
  let fileName = email.replace('.', '-');
  fileName = fileName.replace('@', '-');
  console.log(fileName);

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
  const {id, from} = req.body;
  const result = User.getFollowers(id, from);
  return res.send(result);
};

const updateFollowers = async (req, res) => {
  const {follow} = req.body;
  console.log(follow)
  if (follow) {
    const {fromId, toId} = req.body;
    const followedAt = new Date();
    const result = await User.addfollowUser(fromId, toId, followedAt);
    return res.send(result);
  } else {
    const {fromId, toId} = req.body;
    const result = await User.removefollowUser(fromId, toId);
    return res.send(result);
  }
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

const followFunction = async(id) => {
  const followersResult = await User.getFollowers(id, false);
  const followedResult = await User.getFollowers(id, true);

  let followers = followersResult.map((f) => {
    return f.from_id;
  });

  followers = await User.getProfiles(followers);

  const followersTime = followersResult.map((f) => {
    return f.followed_at;
  });

  let followed = followedResult.map((f) => {
    return f.to_id;
  });

  followed = await User.getProfiles(followed);

  const followedTime = followedResult.map((f) => {
    return f.followed_at;
  });

  return {followers, followersTime, followed, followedTime};
};

module.exports = {
  signUp,
  signIn,
  getUserProfile,
  getUserKeys,
  getStreamerProfile,
  updateUserImg,
  updateUserProfile,
  deleteUserProfile,
  getFollowers,
  updateFollowers,
};

