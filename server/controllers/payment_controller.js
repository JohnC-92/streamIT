
const {stripePK, stripeSK} = require('../../utils/config');
const stripe = require('stripe')(stripeSK);
const Payment = require('../models/payment_model');

const getStripeKey = async (req, res) => {
  res.send({publishableKey: stripePK});
};

const makePayment = async(req, res) => {
  const {paymentMethodId, paymentIntentId, orderAmount, currency, useStripeSdk} = req.body;
  console.log(req.body);

  try {
    let intent;
    if (paymentMethodId) {
      // Create new PaymentIntent with a PaymentMethod ID from the client.
      intent = await stripe.paymentIntents.create({
        amount: orderAmount,
        currency: currency,
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        // If a mobile client passes `useStripeSdk`, set `use_stripe_sdk=true`
        // to take advantage of new authentication features in mobile SDKs
        use_stripe_sdk: useStripeSdk,
      });
      // After create, if the PaymentIntent's status is succeeded, fulfill the order.
    } else if (paymentIntentId) {
      // Confirm the PaymentIntent to finalize payment after handling a required action
      // on the client.
      intent = await stripe.paymentIntents.confirm(paymentIntentId);
      // After confirm, if the PaymentIntent's status is succeeded, fulfill the order.
    }
    res.send(generateResponse(intent));
  } catch (err) {
    // Handle "hard declines" e.g. insufficient funds, expired card, etc
    // See https://stripe.com/docs/declines/codes for more
    res.send({error: err.message});
  }
};

const generateResponse = (intent) => {
  // Generate a response based on the intent's status
  switch (intent.status) {
    case 'requires_action':
    case 'requires_source_action':
      // Card requires authentication
      return {
        requiresAction: true,
        clientSecret: intent.client_secret,
      };
    case 'requires_payment_method':
    case 'requires_source':
      // Card was not properly authenticated, suggest a new payment method
      return {
        error: 'Your card was denied, please provide a new payment method',
      };
    case 'succeeded':
      // Payment is complete, authentication not required
      // To cancel the payment after capture you will need to issue a Refund (https://stripe.com/docs/api/refunds)
      // Payment.makePayment();
      console.log('💰 Payment received!');
      return {clientSecret: intent.client_secret};
  }
};

module.exports = {
  getStripeKey,
  makePayment,
}