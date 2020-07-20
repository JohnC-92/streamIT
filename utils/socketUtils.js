const moment = require('moment');
const users = [];
const usersCount = {};

/**
 * Function to return user text with sent time
 * @param {*} username
 * @param {*} text
 * @return {*} Message Obj with sent time
 */
function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
  };
}

// Join user to chat
/**
 * Function to add record of user details and room
 * @param {*} id
 * @param {*} username
 * @param {*} room
 * @return {*} returns user obj
 */
function userJoin(id, username, room) {
  const user = {id, username, room};

  users.push(user);
  // userCount[room] = userCount[room] + 1 || 1;

  return user;
}

// Get current user
/**
 * Function to get current user info
 * @param {*} id
 * @return {*} Return user info
 */
function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

// User leaves chat
/**
 * Function to get user info and remove user from user list
 * @param {*} id
 * @return {*} Return name of left user
 */
function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    // const user = users.splice(index, 1)[0];
    // userCount[user.room] = userCount[user.room] - 1;
    return users.splice(index, 1)[0];
  }
}

// Get room users
/**
 * Function to get all users and users length that are in same room
 * @param {*} room
 * @return {*} Return users and users length in the same room
 */
function getRoomUsers(room) {
  const userList = users.filter((user) => user.room === room);
  const userCount = userList.length;

  // add users count to userCount Object everytime someone enters or leave the room
  usersCount[room] = userCount;

  return [userList, userCount];
}

/**
 * Function to return all room users count object for index and sidebar use
 * @return {*} return usersCount object
 */
function returnUsersCount() {
  return usersCount;
}

module.exports = {
  formatMessage,
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  returnUsersCount,
};
