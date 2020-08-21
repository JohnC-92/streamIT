const socketio = require('socket.io');
const {
  formatMessage,
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
  returnUsersCount,
} = require('./socketUtils');
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
      // Add user to user array
      const user = userJoin(socket.id, username, room);

      // Join current user to his specific room
      socket.join(user.room);

      // Welcome current user
      socket.emit('message', formatMessage(botName, '歡迎來到聊天室 :D'));

      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        users: getRoomUsers(user.room)[0],
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
        // Send room info, users list and users count
        io.to(user.room).emit('roomUsers', {
          users: getRoomUsers(user.room)[0],
        });
      };
    });
  });

  // Runs every few seconds to update frontend users count
  const socketJob = new CronJob('*/2 * * * * *', () => {
    io.emit('usersCount', {
      usersCount: returnUsersCount(),
    });
  }, null, true);
  socketJob.start();
}

module.exports = initSocket;

