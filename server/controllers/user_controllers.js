require('dotenv').config();
const validator = require('validator');
const User = require('../models/user_model');
const {nativeSignIn, facebookSignIn} = require('../models/user_model');
const expire = process.env.TOKEN_EXPIRE;

const signUp = async (req, res) => {
  let {name} = req.query;
  const {password, email} = req.query;

  // check if user provided name, password, email
  if (!name || !password || !email) {
    return res.status(400).send('Name, password and email required');
  }

  // check if email is valid
  if (!validator.isEmail(email)) {
    return res.status(400).send('Invalid email format');
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
  const {name, password} = req.query;
  
  // native sign in part

  // check if user provided name, password
  if (!name || !password) {
    return res.status(400).send('Name and password required');
  }

  const result = await User.nativeSignIn(name, password, expire);
  if (result.error) {
    return res.status(403).send(result.error);
  }

  const {accessToken, loginAt, user} = result;
  if (!user) {
    return res.status(500).send({error: 'Database Query Error'});
  }

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

//   switch (data.provider) {
//     case 'native':
//       await nativeSignIn(data.name, data.password);
//       break;
//     case 'facebook':
//       await facebookSignIn();
//       break;
//     default:
//   }

};

const getUserProfile = async (req, res) => {

};

const getSubFollow = async (req, res) => {
  // category = subscriber || followers


};

// const nativeSignIn = async (name, password) => {
//   const {name, password} = req.body;

//   if (!name || !password) {
//     return {error:'Name and password required', status: 400};
//   }

//   try {
//     return await User.nativeSignIn(name, password);
//   } catch (err) {
//     return {err};
//   }
  
  
// }

// const facebookSignIn = async () => {

// }

module.exports = {
  signUp,
  signIn,
  getUserProfile,
  getSubFollow,
};

