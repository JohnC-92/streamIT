require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');
const expire = process.env.TOKEN_EXPIRE;

const signUp = async (req, res) => {
  let {name} = req.query;
  const {password, email} = req.query;

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
    return res.status(403).send(result.error);
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
  const {provider} = req.query;

  let result;
  switch (provider) {
    // native login
    case 'native':
      const {name, password} = req.query;
      result = await nativeSignIn(name, password);
      break;
    // facebook login
    case 'facebook':
      const {token} = req.query;
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
  let token = req.header('Authorization');
  if (!token) {
    return res.status(400).send({error: 'Token required'});
  } else {
    token = token.replace('Bearer ', '');
  }
  const result = await User.getUserProfile(token);
  if (result.error) {
    return res.status(403).send(result.error);
  }

  res.send({
    data: {
      id: result.id,
      provider: result.provider,
      email: result.email,
      name: result.name,
      picture: result.picture,
    },
  });
};

const getSubFollow = async (req, res) => {
  // category = subscriber || followers

};

const nativeSignIn = async (name, password) => {
  try {
    // check if user provided name, password
    if (!name || !password) {
      return {error: 'Name and password required', status: 400};
    }

    const result = await User.nativeSignIn(name, password, expire);
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
  getSubFollow,
};

