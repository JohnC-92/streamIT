const socket = io();

// Get room and users
socket.on('usersCount', ({usersCount}) => {
  console.log(usersCount);
});
