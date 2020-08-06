const router = require('express').Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/video', (req, res) => {
  res.render('video');
});

router.get('/profile', (req, res) => {
  res.render('profile');
});

router.get('/error404', (req, res) => {
  res.render('error404');
});

module.exports = router;
