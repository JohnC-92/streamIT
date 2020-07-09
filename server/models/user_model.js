require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {query, transaction, commit, rollback} = require('../../utils/mysqlcon');
const secret = process.env.SECRET;
const saltRounds = parseInt(process.env.BCRYPT_SALT);
const requestPromise = require('request-promise');

const signUp = async (name, password, email, expire) => {
  try {
    await transaction();
    // Check if name exists
    const nameQuery = await query('SELECT * FROM users WHERE name = ? FOR UPDATE', [name]);
    if (nameQuery.length > 0) {
      await commit();
      return {error: 'Name already exists'};
    }

    // Check if email exists
    const emailQuery = await query('SELECT * FROM users WHERE email = ? FOR UPDATE', [email]);
    if (emailQuery.length > 0) {
      await commit();
      return {error: 'Email already exists'};
    }

    // Create login time, hashed password and JWT token
    const loginAt = new Date();
    const hashpass = bcrypt.hashSync(password, saltRounds);
    // jwt.sign({payload}, secretKey, {options})
    // const token = 'Bearer ' + jwt.sign(
    const token = jwt.sign(
        {
          name: name,
        },
        secret,
        {
          expiresIn: expire,
        },
    );

    const user = {
      provider: 'native',
      email: email,
      password: hashpass,
      name: name,
      // picture: null,
      picture: 'https://www.dlf.pt/dfpng/middlepng/2-23802_meme-faces-happy-png-transparent-png.png',
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

    // update user info
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

const facebookSignIn = async (accessToken, expire) => {
  try {
    await transaction();
    const options = {
      method: 'POST',
      uri: 'https://graph.facebook.com/me?fields=id,name,email&access_token=' + accessToken,
      json: true,
    };

    const {id, name, email} = await requestPromise(options);

    // check if user id, name, email exists
    if (!id || !name || !email) {
      await commit();
      return {error: 'facebook token can not get id, name or email'};
    }

    // Create login time, hashed password and JWT token
    const loginAt = new Date();
    const user = {
      provider: 'facebook',
      email: email,
      password: null,
      name: name,
      picture: 'https://graph.facebook.com/' + id + '/picture?type=large',
      description: '',
      access_token: accessToken,
      access_expired: expire,
      login_at: loginAt,
    };

    // create user if user doesnt exist
    // else update user info
    const nameResult = await query(`SELECT * FROM users WHERE name = ? AND provider = 'facebook' FOR UPDATE`, [name]);
    let userId;
    if (nameResult.length === 0) {
      const result = await query('INSERT INTO users SET ?', user);
      userId = result.insertId;
    } else {
      userId = nameResult[0].id;
      await query('UPDATE users SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?', [accessToken, expire, loginAt, userId]);
    }
    user.id = userId;
    await commit();

    return {accessToken, loginAt, user};
  } catch (err) {
    return {error: err};
  }
};

const getUserProfile = async (token) => {
  try {
    const user = await query('SELECT * FROM users WHERE access_token = ?', [token]);
    if (user.length === 0) {
      return {error: 'No matching token found'};
    }
    return user[0];
  } catch (err) {
    return {error: err};
  }
};

const getFollowers = async () => {

}

const getSubscribers = async () => {
  
}

module.exports = {
  signUp,
  nativeSignIn,
  facebookSignIn,
  getUserProfile,
  getFollowers,
  getSubscribers,
};

