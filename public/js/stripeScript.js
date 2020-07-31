// A reference to Stripe.js
let stripe;

let orderData = {
  items: [{id: 'photo-subscription'}],
  currency: 'usd',
};

fetch('/payment/stripe-key')
    .then(function(result) {
      return result.json();
    })
    .then(function(data) {
      return setupElements(data);
    })
    .then(function({stripe, card, clientSecret}) {
      document.querySelector('button').disabled = false;

      var form = document.getElementById('payment-form');
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        pay(stripe, card, clientSecret);
      });
    });

const setupElements = function(data) {
  stripe = Stripe(data.publishableKey);
  /* ------- Set up Stripe Elements to use in checkout form ------- */
  const elements = stripe.elements();
  const style = {
    base: {
      'color': '#32325d',
      'fontFamily': 'Helvetica Neue, Helvetica, sans-serif',
      'fontSmoothing': 'antialiased',
      'fontSize': '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  };

  const card = elements.create('card', {style: style});
  card.mount('#card-element');

  return {
    stripe: stripe,
    card: card,
    clientSecret: data.clientSecret,
  };
};

const handleAction = function(clientSecret) {
  stripe.handleCardAction(clientSecret).then(function(data) {
    if (data.error) {
      showError('Your card was not authenticated, please try again');
    } else if (data.paymentIntent.status === 'requires_confirmation') {
      fetch('/payment/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: data.paymentIntent.id,
        }),
      })
          .then(function(result) {
            return result.json();
          })
          .then(function(json) {
            if (json.error) {
              showError(json.error);
            } else {
              orderComplete(clientSecret);
            }
          });
    }
  });
};

/*
 * Collect card details and pay for the order
 */
const pay = function(stripe, card) {
  changeLoadingState(true);

  // Collects card details and creates a PaymentMethod
  stripe
      .createPaymentMethod('card', card)
      .then(function(result) {
        if (result.error) {
          showError(result.error.message);
        } else {
          orderData.paymentMethodId = result.paymentMethod.id;
          return fetch('/payment/pay', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
          });
        }
      })
      .then(function(result) {
        return result.json();
      })
      .then(function(response) {
        if (response.error) {
          console.log(1)
          showError(response.error);
        } else if (response.requiresAction) {
          console.log(2)
          // Request authentication
          handleAction(response.clientSecret);
        } else {
          console.log(3)
          orderComplete(response.clientSecret);
        }
      });
};

/* ------- Post-payment helpers ------- */

/* Shows a success / error message when the payment is complete */
const orderComplete = function(clientSecret) {
  stripe.retrievePaymentIntent(clientSecret).then(function(result) {
    const paymentIntent = result.paymentIntent;
    const paymentIntentJson = JSON.stringify(paymentIntent, null, 2);

    document.querySelector('.sr-payment-form').classList.add('hidden');
    document.querySelector('pre').textContent = paymentIntentJson;

    document.querySelector('.sr-result').classList.remove('hidden');
    setTimeout(function() {
      document.querySelector('.sr-result').classList.add('expand');
    }, 200);

    changeLoadingState(false);
  });
};

const showError = function(errorMsgText) {
  changeLoadingState(false);
  const errorMsg = document.querySelector('.sr-field-error');
  errorMsg.textContent = errorMsgText;
  setTimeout(function() {
    errorMsg.textContent = '';
  }, 4000);
};

// Show a spinner on payment submission
const changeLoadingState = function(isLoading) {
  if (isLoading) {
    document.querySelector('button').disabled = true;
    document.querySelector('#spinner').classList.remove('hidden');
    document.querySelector('#button-text').classList.add('hidden');
  } else {
    document.querySelector('button').disabled = false;
    document.querySelector('#spinner').classList.add('hidden');
    document.querySelector('#button-text').classList.remove('hidden');
  }
};
