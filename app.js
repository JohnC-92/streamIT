const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const {stripePK, stripeSK} = require('./utils/config');
const stripe = require('stripe')(stripeSK);
const nodeMediaServer = require('./server/media_server');
const thumbnailGenerator = require('./utils/util').job;
const initSocket = require('./utils/socket');

const http = require('http');
const https = require('https');
const httpPort = 3000;
const httpsPort = 3001;

const app = express();

const options = {
  key: fs.readFileSync('private.pem'),
  cert: fs.readFileSync('certChain.crt'),
};
const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

// Set views engine and views engine files folder
app.set('views', './server/views');
app.set('view engine', 'ejs');

// Set body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

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

// -------------------------STRIPE-------------------------
// app.get('/donate', (req, res) => {
//   res.render('donate');
// });

app.get('/donate', (req, res) => {
  res.sendFile('web/donate.html');
});

app.get('/stripe-key', (req, res) => {
  res.send({publishableKey: stripePK});
});

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // You should always calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};

app.post('/pay', async (req, res) => {
  const {paymentMethodId, paymentIntentId, items, currency, useStripeSdk} = req.body;
  console.log(req.body)
  const orderAmount = calculateOrderAmount(items);

  try {
    let intent;
    if (paymentMethodId) {
      console.log('im here')
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
      console.log('im here')
      // After create, if the PaymentIntent's status is succeeded, fulfill the order.
    } else if (paymentIntentId) {
      // Confirm the PaymentIntent to finalize payment after handling a required action
      // on the client.
      intent = await stripe.paymentIntents.confirm(paymentIntentId);
      // After confirm, if the PaymentIntent's status is succeeded, fulfill the order.
    }
    console.log('INTENT ',intent)
    res.send(generateResponse(intent));
  } catch (e) {
    // Handle "hard declines" e.g. insufficient funds, expired card, etc
    // See https://stripe.com/docs/declines/codes for more
    res.send({error: e.message});
  }
});

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
      console.log('💰 Payment received!');
      return {clientSecret: intent.client_secret};
  }
};

// -------------------------STRIPE-------------------------

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Internal Server Error'); // change it later to HTML page
});

httpServer.listen(httpPort, () => {
  console.log(`HTTP Server is running on port ${httpPort}`);
});

httpsServer.listen(httpsPort, () => {
  console.log(`HTTPS Server is running on port ${httpsPort}`);
});

// Start Node Media Server
nodeMediaServer.run();

// Start Socket Server
initSocket(httpServer);

// Cron Job to generate thumbnails every 5 seconds
thumbnailGenerator.start();
