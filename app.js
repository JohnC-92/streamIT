require('dotenv').config();
const path = require('path');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const nodeMediaServer = require('./server/media_server');
const thumbnailGenerator = require('./utils/util').job;

const app = express();
const server = http.createServer(app);
const initSocket = require('./utils/socket');

// Set views engine and views engine files folder
app.set('views', './server/views');
app.set('view engine', 'ejs');

// Set body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'server')));

// CORS Control
app.use('/', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.set('Access-Control-Allow-Credentials', 'true');
  next();
});

// Routes Defining
app.use(require('./server/routes/user_routes'));

app.get('/layout', (req, res) => {
  res.render('layout');
});

app.get('/index', (req, res) => {
  res.render('index');
});

app.get('/video', (req, res) => {
  res.render('video');
});

app.get('/profile', (req, res) => {
  res.render('profile');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Internal Server Error'); // change it later to HTML page
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Start Node Media Server
nodeMediaServer.run();

// Start Socket Server
initSocket(server);

// Cron Job to generate thumbnails every 5 seconds
thumbnailGenerator.start();
