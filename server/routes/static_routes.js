const router = require('express').Router();

router.get('/layout', (req, res) => {
  res.render('layout');
});

router.get('/index', (req, res) => {
  res.render('index');
});

router.get('/video', (req, res) => {
  res.render('video');
});

router.get('/profile', (req, res) => {
  res.render('profile');
});

router.get('/payment/donate', (req, res) => {
  res.sendFile('web/donate.html');
});

module.exports = router;
