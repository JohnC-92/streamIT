const router = require('express').Router();
const {catchAsyncError} = require('../../utils/util');

const {
  getStripeKey,
  makePayment,
  updatePayment,
  getPayment,
} = require('../controllers/payment_controller');

router.get('/payment/stripe-key',
    catchAsyncError(getStripeKey));

router.post('/payment/pay',
    catchAsyncError(makePayment));

router.post('/payment/updatePay',
    catchAsyncError(updatePayment));

router.post('/payment/records/:id',
    catchAsyncError(getPayment));

module.exports = router;
