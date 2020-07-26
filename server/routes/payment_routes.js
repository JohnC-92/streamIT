const router = require('express').Router();
const {wrapAsync} = require('../../utils/util');

const {
  getStripeKey,
  makePayment,
} = require('../controllers/payment_controller');

router.get('/payment/stripe-key',
    wrapAsync(getStripeKey));

router.post('/payment/pay',
    wrapAsync(makePayment));

module.exports = router;
