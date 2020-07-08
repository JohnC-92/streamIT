require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const PORT = process.env.PORT || 3000;
const nodeMediaServer = require('./server/media_server');

const app = express();
const server = http.createServer(app);
const initSocket = require('./utils/socket');

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});

nodeMediaServer.run();
initSocket(server);
