const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userCount = document.getElementById('usersCount');
const userList = document.getElementById('users');
let users = {};

// Get username and room
let username;
if (token) {
  username = JSON.parse(localStorage.getItem('userInfo')).name;
} else {
  username = undefined;
}

const {room} = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', {username, room});

// Get room and users
socket.on('roomUsers', ({users}) => {
  outputUsers(users);
});

// Message from server
socket.on('message', (msg) => {
  outputMessage(msg);

  // Scroll down to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

/**
 * Output Message to DOM
 * @param {string} message A message from user sent from server
 */
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `
  <p class="meta"> ${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>
  `;
  document.querySelector('.chat-messages').appendChild(div);
};


// Add users to DOM
/**
 * Function to get users in same room and replace room users HTML
 * @param {*} users
 */
function outputUsers(users) {
  const usersDiv = document.getElementById('chat-user');
  // const userObj = {};
  let userHTML = '';
  users.map((user)=> {
    // if (!userObj[user.username]) {
    // userHTML += `<div class="chat-user">${user.username}</div>`;
    // userObj[user] = 1;
    // }
    userHTML += `<div class="chat-user">${user}</div>`;
  });
  usersDiv.innerHTML = userHTML;
};

// Get room and users
socket.on('usersCount', ({usersCount}) => {
  users = usersCount;
  if (Object.keys(users).length > 0) {
    getViewers(users);
    getStreamViewers();
  };
});

/**
 * Function to input viewers
 * @param {*} users
 */
function getViewers(users) {
  Object.keys(users).forEach((key) => {
    const viewers = users[key];

    const sideclassName = '.side'+key;
    const sideViewCount = document.querySelector(sideclassName);

    if (sideViewCount !== null) {
      sideViewCount.innerText = viewers;
    }
 });
}

/**
 * Function to input specific stream viewers
 * @param {*} users
 */
function getStreamViewers() {
  const viewers = users[room];
  const streamerclassName = '.streamerViewers';
  const streamerViewCount = document.querySelector(streamerclassName);
  if (viewers !== undefined) {
    streamerViewCount.innerText = '觀看人數： '+viewers;
  }
}