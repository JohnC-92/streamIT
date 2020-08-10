const router = require('express').Router();

// index page
router.get('/', (req, res) => {
  res.render('index');
});

// video page
router.get('/video', (req, res) => {
  res.render('video');
});

// profile page
router.get('/profile', (req, res) => {
  res.render('profile');
});

// error 404 (page not found) page
router.get('/error404', (req, res) => {
  res.render('error404');
});

// error 500 (internal server error) page
router.get('/error500', (req, res) => {
  res.render('error500');
});

module.exports = router;
