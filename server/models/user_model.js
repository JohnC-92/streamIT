const bcrypt = require('bcrypt');
const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const {query, connection, connectionQuery, transaction, commit, rollback} = require('../../utils/mysqlcon');
const {secret, salt} = require('../../utils/config');
const saltRounds = parseInt(salt);
const requestPromise = require('request-promise');

const signUp = async (name, password, email, expire) => {
  const dbConnection = await connection();

  try {
    await transaction(dbConnection);

    // Check if email exists
    const userQuery = await connectionQuery(dbConnection,
        'SELECT * FROM users WHERE email = ? FOR UPDATE', [email]);

    if (userQuery.length > 0) {
      await commit(dbConnection);
      return {error: 'Email already exists'};
    }

    // Create login time, hashed password and JWT token
    const loginAt = new Date();
    const hashpass = bcrypt.hashSync(password, saltRounds);
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
      access_token: token,
      access_expired: expire,
      login_at: loginAt,
      stream_key: shortid.generate(),
      stream_title: 'Welcome to ' + name + `'s world`,
      stream_type: 'Gaming',
    };

    // Insert into user info into database
    const userInsertQuery = await connectionQuery(dbConnection,
        'INSERT INTO users SET ?', user);
    user.id = userInsertQuery.insertId;
    await commit(dbConnection);
    dbConnection.release();

    return {
      accessToken: token,
      loginAt: loginAt,
      user: user,
    };
  } catch (err) {
    // rollback everything and return error msg if error
    await rollback(dbConnection);
    dbConnection.release();
    return {error: err};
  }
};

const nativeSignIn = async (email, password, expire) => {
  const dbConnection = await connection();

  try {
    await transaction(dbConnection);

    // check if username exists
    const userQuery = await query('SELECT * FROM users WHERE email = ?', [email]);

    if (userQuery.length === 0) {
      await commit(dbConnection);
      return {error: 'Invalid Email'};
    };

    // check if password is correct
    if (!bcrypt.compareSync(password, userQuery[0].password)) {
      await commit(dbConnection);
      return {error: 'Invalid Password'};
    }

    // Create login time, hashed password and JWT token
    const loginAt = new Date();
    const token = jwt.sign({
      name: userQuery.name,
    }, secret, {expiresIn: expire});

    // update user info
    const queryStr = 'UPDATE users SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?';
    await connectionQuery(dbConnection, queryStr, [token, expire, loginAt, userQuery[0].id]);
    await commit(dbConnection);
    dbConnection.release();

    return {
      accessToken: token,
      loginAt: loginAt,
      user: userQuery[0],
    };
  } catch (err) {
    // rollback everything if error
    await rollback(dbConnection);
    dbConnection.release();
    return {error: err};
  }
};

const facebookSignIn = async (accessToken, expire) => {
  const dbConnection = await connection();

  try {
    await transaction(dbConnection);

    const options = {
      method: 'POST',
      uri: 'https://graph.facebook.com/me?fields=id,name,email&access_token=' + accessToken,
      json: true,
    };

    const {id, name, email} = await requestPromise(options);

    // check if user id, name, email exists
    if (!id || !name || !email) {
      await commit(dbConnection);
      return {error: 'facebook token can not get id, name or email'};
    }

    // Create login time, hashed password and JWT token
    const loginAt = new Date();
    const token = jwt.sign({
      name: name,
    }, secret, {expiresIn: expire});
    const user = {
      provider: 'facebook',
      email: email,
      password: 'null',
      name: name,
      picture: 'https://graph.facebook.com/' + id + '/picture?type=large',
      access_token: token,
      access_expired: expire,
      login_at: loginAt,
      stream_key: shortid.generate(),
      stream_title: 'Welcome to ' + name + `'s world`,
      stream_type: 'Gaming',
    };

    // create user if user doesnt exist
    // else update user info
    const userQuery = await connectionQuery(dbConnection,
          `SELECT * FROM users WHERE name = ? AND provider = 'facebook' FOR UPDATE`, [name]);
    let userId;
    if (userQuery.length === 0) {
      const userInsertQuery = await connectionQuery(dbConnection, 'INSERT INTO users SET ?', user);
      userId = userInsertQuery.insertId;
    } else {
      userId = userQuery[0].id;
      await connectionQuery(dbConnection,
          'UPDATE users SET access_token = ?, access_expired = ?, login_at = ? WHERE id = ?', [token, expire, loginAt, userId]);
    }
    user.id = userId;
    await commit(dbConnection);
    dbConnection.release();

    return {
      accessToken: token,
      loginAt: loginAt,
      user: user,
    };
  } catch (err) {
    await rollback(dbConnection);
    dbConnection.release();
    return {error: err};
  }
};

const getUserProfileToken = async (token) => {
  return new Promise((resolve, reject) => {
    // verify if JWT token is valid by comparing secretKey and endTime
    jwt.verify(token, secret, async (err) => {
      if (err) {
        reject({error: 'Token invalid/ token expired'});
      }
      const userQuery = await query('SELECT * FROM users WHERE access_token = ?', [token]);
      if (userQuery.length === 0) {
        reject({error: 'No matching token found'});
      }
      resolve(userQuery[0]);
    });
  });
};

const getProfiles = async (ids) => {
  try {
    const profileQuery = await query('SELECT id, name, picture, stream_key, stream_title, stream_type FROM users WHERE id IN (?)', [ids]);
    return profileQuery;
  } catch (err) {
    return {error: err};
  }
};

const getAllUsers = async () => {
  try {
    const profilesQuery = await query('SELECT id, name, stream_key, stream_title, picture, stream_type FROM users', []);
    return profilesQuery;
  } catch (err) {
    return {error: err};
  }
};

const getSingleUser = async (id) => {
  try {
    const profileQuery = await query('SELECT id, name, stream_key, stream_title, stream_type, picture FROM users WHERE id = ?', [id]);
    return profileQuery;
  } catch (err) {
    return {error: err};
  }
};

const updateUserImg = async (email, imgUrl) => {
  try {
    const imgUpdateQuery = await query('UPDATE users SET picture = ? WHERE email = ?', [imgUrl, email]);
    return imgUpdateQuery;
  } catch (err) {
    return {error: err};
  }
};

const updateUserProfile = async (name, email, streamTitle, streamType) => {
  try {
    const profileUpdateQuery = await query('UPDATE users SET name = ?, stream_title = ?, stream_type = ? WHERE email = ?', [name, streamTitle, streamType, email]);
    return profileUpdateQuery;
  } catch (err) {
    return {error: err};
  }
};

const deleteUserProfile = async (email) => {
  try {
    const profileUpdateQuery = await query('DELETE FROM users WHERE email = ?', [email]);
    return profileUpdateQuery;
  } catch (err) {
    return {error: err};
  }
};

const getFollowers = async (id, from) => {
  try {
    if (from === true) {
      const followedQuery = await query('SELECT to_id, followed_at FROM followers WHERE from_id = ?', [id]);
      return followedQuery;
    } else {
      const followerQuery = await query('SELECT from_id, followed_at FROM followers WHERE to_id = ?', [id]);
      return followerQuery;
    }
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
    const followerInsertQuery = await query('INSERT INTO followers SET ?', [followObj]);
    return followerInsertQuery;
  } catch (err) {
    return {error: err};
  }
};

const removefollowUser = async (fromId, toId) => {
  try {
    const followerRemoveQuery = await query('DELETE FROM followers WHERE from_id = ? AND to_id = ?', [fromId, toId]);
    return followerRemoveQuery;
  } catch (err) {
    return {error: err};
  }
};

module.exports = {
  signUp,
  nativeSignIn,
  facebookSignIn,
  getUserProfileToken,
  getProfiles,
  getAllUsers,
  getSingleUser,
  updateUserImg,
  updateUserProfile,
  deleteUserProfile,
  addfollowUser,
  removefollowUser,
  getFollowers,
};

