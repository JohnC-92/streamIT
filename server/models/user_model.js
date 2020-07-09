require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {query, transaction, commit, rollback} = require('../../utils/mysqlcon');
const secret = process.env.SECRET;
const saltRounds = parseInt(process.env.BCRYPT_SALT);

const signUp = async (name, password, email, expire) => {
  try {
    await transaction();
    // Check if name exists
    const nameQuery = await query('SELECT * FROM users WHERE name = ?', [name]);
    if (nameQuery.length > 0) {
      await commit();
      return {error: 'Name already exists'};
    }

    // Check if email exists
    const emailQuery = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (emailQuery.length > 0) {
      await commit();
      return {error: 'Email already exists'};
    }

    // Create login time, hashed password and JWT token
    const loginAt = new Date();
    const hashpass = bcrypt.hashSync(password, saltRounds);
    const token = jwt.sign({
      name: name,
    }, secret, {expiresIn: expire});

    const user = {
      provider: 'native',
      email: email,
      password: hashpass,
      name: name,
      picture: null,
      description: '',
      access_token: token,
      access_expired: expire,
      login_at: loginAt,
    };

    // Insert into user info into database
    const queryStr = 'INSERT INTO users SET ?';

    const result = await query(queryStr, user);
    user.id = result.insertId;
    await commit();

    return {
      accessToken: token,
      loginAt: loginAt,
      user: user,
    };
  } catch (err) {
    // rollback everything and return error msg if error
    await rollback;
    return {error: err};
  }
};

const nativeSignIn = async (name, password, expire) => {
  try {
    await transaction();

    // check if username exists
    const user = await query('SELECT * FROM users WHERE name = ?', [name]);
    if (user.length === 0) {
      return {error: 'Invalid User'};
    };

    // check if password is correct
    if (!bcrypt.compareSync(password, user[0].password)) {
      await commit();
      return {error: 'Invalid Password'};
    }

    // Create login time, hashed password and JWT token
    const loginAt = new Date();
    const token = jwt.sign({
      name: user.name,
    }, secret, {expiresIn: expire});

    const queryStr = 'UPDATE users SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?';
    await query(queryStr, [token, expire, loginAt, user[0].id]);
    await commit();

    return {
      accessToken: token,
      loginAt: loginAt,
      user: user[0],
    };
  } catch (err) {
    // rollback everything if error
    await rollback();
    return {error: err};
  }
};

const facebookSignIn = async () => {

}

const getUserProfile = async () => {

}

const getFacebookProfile = async () => {

}

const getFollowers = async () => {

}

const getSubscribers = async () => {
  
}

module.exports = {
  signUp,
  nativeSignIn,
  facebookSignIn,
  getUserProfile,
  getFacebookProfile,
  getFollowers,
  getSubscribers,
};

