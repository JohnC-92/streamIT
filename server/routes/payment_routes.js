const router = require('express').Router();
const {wrapAsync} = require('../../utils/util');

const {
  getStripeKey,
  makePayment,
  updatePayment,
  getPayment,
} = require('../controllers/payment_controller');

router.get('/payment/stripe-key',
    wrapAsync(getStripeKey));

router.post('/payment/pay',
    wrapAsync(makePayment));

router.post('/payment/updatePay',
    wrapAsync(updatePayment));

router.post('/payment/records/:id',
    wrapAsync(getPayment))

module.exports = router;
