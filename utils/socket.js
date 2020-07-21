const socketio = require('socket.io');
const {formatMessage, userJoin, getCurrentUser, userLeave, getRoomUsers, returnUsersCount} = require('./socketUtils');
const CronJob = require('cron').CronJob;

/**
 * Function to initialize server side socket
 * @param {*} server Pass in http server
 */
function initSocket(server) {
  const botName = 'Bot StreamIT';
  const io = socketio(server);

  // Run when client connects
  io.on('connection', (socket) => {
    io.emit('usersCount', {
      usersCount: returnUsersCount(),
    });

    socket.on('joinRoom', ({username, room}) => {
      const user = userJoin(socket.id, username, room);

      socket.join(user.room);

      // Welcome current user
      socket.emit('message', formatMessage(botName, 'Welcome to StreamIT Chat'));

      // Broadcast when a user connects
      socket.broadcast
          .to(user.room)
          .emit(
              'message',
              formatMessage(botName, `${user.username} has joined the chat`));

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)[0],
        usersCount: getRoomUsers(user.room)[1],
      });
    });

    // Listen for chatMessage
    socket.on('chatMessage', (msg) => {
      const user = getCurrentUser(socket.id);

      io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);

      if (user) {
        io.to(user.room).emit(
            'message',
            formatMessage(botName, `${user.username} has left the chat`));

        // Send room info, users list and users count
        io.to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)[0],
          usersCount: getRoomUsers(user.room)[1],
        });
      };
    });
  });

  // Runs every few seconds to update frontend users count
  const job = new CronJob('*/5 * * * * *', () => {
    // console.log('Running socket cronjob woohoo!!!');
    io.emit('usersCount', {
      usersCount: returnUsersCount(),
    });
  }, null, true);
  job.start();
}

module.exports = initSocket;

