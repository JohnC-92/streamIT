const users = [];

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
    return users.splice(index, 1)[0];
  }
}

// Get room users
/**
 * Function to get all users that are in same room
 * @param {*} room
 * @return {*} Return users in the same room
 */
function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
};
