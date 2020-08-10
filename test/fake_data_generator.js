const {nodeEnv} = require('../utils/config');
let salt = require('../utils/config').salt;
salt = parseInt(salt);
const bcrypt = require('bcrypt');
const {
  users,
  followers,
  payments,
  videos,
} = require('./fake_data');
const {transaction, commit, query, end} = require('../utils/mysqlcon.js');

/**
 * Function to create fake user and insert into db
 * @return {*} return sql query to insert users
 */
function _createFakeUser() {
  const fakeUsers = users.map((user) => {
    const fakeUser = {
      provider: user.provider,
      email: user.email,
      password: bcrypt.hashSync(user.password, salt),
      name: user.name,
      picture: user.picture,
      access_token: user.access_token,
      access_expired: user.access_expired,
      stream_key: user.stream_key,
      stream_title: user.stream_title,
      stream_type: user.stream_type,
      login_at: user.login_at,
    };
    return fakeUser;
  });
  return query(`INSERT INTO users 
  (provider, email, password, name, picture, access_token, access_expired, 
  stream_key, stream_title, stream_type, login_at) VALUES ?`,
  [fakeUsers.map((x) => Object.values(x))]);
}

/**
 * Function to create fake follower and insert into db
 * @return {*} return sql query to insert followers
 */
function _createFakeFollower() {
  return query(`INSERT INTO followers 
  (from_id, to_id, followed_at) VALUES ?`,
  [followers.map((x) => Object.values(x))]);
}

/**
 * Function to create fake payment and insert into db
 * @return {*} return sql query to insert payments
 */
function _createFakePayment() {
  return query(`INSERT INTO payment 
  (from_id, from_name, to_id, to_name, amount, message, time_created) VALUES ?`,
  [payments.map((x) => Object.values(x))]);
}

/**
 * Function to create fake video and insert into db
 * @return {*} return sql query to insert videos
 */
function _createFakeVideo() {
  return query(`INSERT INTO videos 
  (stream_key, video_url, img_url, time_created) VALUES ?`,
  [videos.map((x) => Object.values(x))]);
}

/**
 * Function to call fake data functions
 * @return {*} return function to create fake datas
 */
function createFakeData() {
  if (nodeEnv !== 'test') {
    console.log('Not in test env');
    return;
  }

  return _createFakeUser()
      .then(_createFakeFollower)
      .then(_createFakePayment)
      .then(_createFakeVideo)
      .catch(console.log);
}

/**
 * Function to truncate all data in databases
 * @return {*} return function to truncate sql tables
 */
function truncateFakeData() {
  if (nodeEnv !== 'test') {
    console.log('Not in test env');
    return;
  }

  console.log('truncate fake data');

  const truncateTable = (table) => {
    return query(`TRUNCATE TABLE ${table}`);
  };

  return truncateTable('users')
      .then(truncateTable('followers'))
      .then(truncateTable('payment'))
      .then(truncateTable('videos'))
      .catch(console.log);
}

/**
 * Function to close db connection
 * @return {*} return connection end
 */
function closeConnection() {
  return end();
}

// execute when called directly.
if (require.main === module) {
  console.log('main');
  truncateFakeData()
      .then(createFakeData)
      .then(closeConnection);
}

module.exports = {
  createFakeData,
  truncateFakeData,
  closeConnection,
};
