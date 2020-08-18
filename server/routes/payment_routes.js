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

router.put('/payment/pay',
    catchAsyncError(updatePayment));

router.get('/payment/records',
    catchAsyncError(getPayment));

module.exports = router;
