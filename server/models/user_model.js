const bcrypt = require('bcrypt');
const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const {query, transaction, commit, rollback} = require('../../utils/mysqlcon');
const {secret, salt} = require('../../utils/config');
const saltRounds = parseInt(salt);
const requestPromise = require('request-promise');

const signUp = async (name, password, email, expire) => {
  try {
    await transaction();

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
      picture: 'https://cdn.onlinewebfonts.com/svg/img_297675.png',
      // picture: 'https://www.dlf.pt/dfpng/middlepng/2-23802_meme-faces-happy-png-transparent-png.png',
      // picture: 'https://i0.wp.com/pinkupost.com/wp-content/uploads/2019/06/%E6%9C%A8%E6%9D%91%E6%8B%93%E5%93%89_%E9%95%B7%E5%B2%A1%E5%BC%98%E6%A8%B9_%E6%95%99%E5%A0%B4_2020%E5%B9%B4%E7%89%B9%E5%88%A5%E5%8A%87_%E5%AF%8C%E5%A3%AB%E9%9B%BB%E8%A6%96%E5%8F%B0_%E5%B0%8F%E8%AA%AA%E7%9C%9F%E4%BA%BA%E5%8C%96%E6%97%A5%E5%8A%87-2-1.jpg?resize=640%2C792',
      access_token: token,
      access_expired: expire,
      login_at: loginAt,
      stream_key: shortid.generate(),
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

const nativeSignIn = async (email, password, expire) => {
  try {
    await transaction();

    // check if username exists
    const user = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return {error: 'Invalid Email'};
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
      stream_key: shortid.generate(),
      stream_type: 'Gaming',
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
  return new Promise((resolve, reject) => {
    // verify if JWT token is valid by comparing secretKey and endTime
    jwt.verify(token, secret, async (err) => {
      if (err) {
        reject({error: 'Token invalid/ token expired'});
      }
      const user = await query('SELECT * FROM users WHERE access_token = ?', [token]);
      if (user.length === 0) {
        reject({error: 'No matching token found'});
      }
      resolve(user[0]);
    });
  });
};

const getUserKeys = async () => {
  try {
    const result = await query('SELECT id, name, stream_key, stream_title, picture, stream_type FROM users', []);
    return result;
  } catch (err) {
    return {error: err};
  }
};

const getStreamerProfile = async (id) => {
  try {
    const result = await query('SELECT id, name, stream_key, stream_title, picture FROM users WHERE id = ?', [id]);
    return result;
  } catch (err) {
    return {error: err};
  }
};

const updateUserImg = async (email, imgUrl) => {
  try {
    const result = await query('UPDATE users SET picture = ? WHERE email = ?', [imgUrl, email]);
    return result;
  } catch (err) {
    return {error: err};
  }
};

const updateUserProfile = async (name, email, streamTitle, streamType) => {
  try {
    const result = await query('UPDATE users SET name = ?, stream_title = ?, stream_type = ? WHERE email = ?', [name, streamTitle, streamType, email]);
    return result;
  } catch (err) {
    return {error: err};
  }
};

const deleteUserProfile = async (email) => {
  try {
    const result = await query('DELETE FROM users WHERE email = ?', [email]);
    return result;
  } catch (err) {
    return {error: err};
  }
};

const getFollowers = async (id) => {
  try {
    const result = await query('SELECT * FROM followers WHERE to_id = ?', [id]);
    return result;
  } catch (err) {
    return {error: err};
  }
};

const addfollowUser = async (fromId, toId, followedAt) => {
  try {
    const followObj = {
      from_id: fromId,
      to_id: toId,
      followed_at: followedAt,
    };
    const result = await query('INSERT INTO followers SET ?', [followObj]);
    return result;
  } catch (err) {
    return {error: err};
  }
};

const removefollowUser = async (fromId, toId) => {
  try {
    const result = await query('DELETE FROM followers WHERE from_id = ? AND to_id = ?', [fromId, toId]);
    return result;
  } catch (err) {
    return {error: err};
  }
};

module.exports = {
  signUp,
  nativeSignIn,
  facebookSignIn,
  getUserProfile,
  getUserKeys,
  getStreamerProfile,
  updateUserImg,
  updateUserProfile,
  deleteUserProfile,
  addfollowUser,
  removefollowUser,
  getFollowers,
};

