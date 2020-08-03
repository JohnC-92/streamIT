// A reference to Stripe.js
let stripe;

const payBtn = document.querySelector('.stripeBtn');

let orderData = {
  // items: [{id: 'photo-subscription'}],
  currency: 'twd',
};

const number = document.getElementById('number');
const stripeMsg = document.getElementById('stripeMsg');

// const checkformInput = () => {
//   if (!giver.value || !receiver.value || !number.value || !stripeMsg.value) {
//     alert('請填妥所有空格!');
//   }
// }

// const controller = new AbortController();
// const { signal } = controller;

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
        if (!giver.value || !receiver.value || !number.value || !stripeMsg.value) {
          alert('請填妥所有空格!');
        } else {
          pay(stripe, card, clientSecret);
        }      
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
  // changeLoadingState(true); 

  // const payBtn = document.querySelector('.stripeBtn');
  // payBtn.disabled = 'true';

  // Collects card details and creates a PaymentMethod
  stripe
      .createPaymentMethod('card', card)
      .then(function(result) {
        if (result.error) {
          showError(result.error.message);
        } else {
          orderData.paymentMethodId = result.paymentMethod.id;
          orderData.amount = document.querySelector('.inputNumber').value;

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
          showError(response.error);
        } else if (response.requiresAction) {
          // Request authentication
          handleAction(response.clientSecret);
        } else {
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

    if (paymentIntent.status === 'succeeded') {

      const amount = document.querySelector('.inputNumber').value;
      const from_id = JSON.parse(localStorage.getItem('userInfo')).id;
      const from_name = JSON.parse(localStorage.getItem('userInfo')).name;
      const to_id = streamerId;
      const to_name = document.querySelector('.streamerName').innerText
      const message = document.getElementById('stripeMsg').value;

      const data = {
        from_id: from_id,
        from_name: from_name,
        to_id: to_id,
        to_name: to_name,
        amount: amount,
        message: message,
      }

      console.log('DATA: ',data)

      fetch('/payment/updatePay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         body: JSON.stringify(data),
        })

      alert('贊助成功! 已贊助實況主 NTD. ' + (paymentIntent.amount/100));  
    }
  });
};

const showError = function(errorMsgText) {
  // changeLoadingState(false);
  // const errorMsg = document.querySelector('.sr-field-error');
  // errorMsg.textContent = errorMsgText;
  alert(errorMsgText);
  // setTimeout(function() {
  //   errorMsg.textContent = '';
  // }, 4000);
};

// // Show a spinner on payment submission
// const changeLoadingState = function(isLoading) {
//   if (isLoading) {
//     document.querySelector('button').disabled = true;
//     document.querySelector('#spinner').classList.remove('hidden');
//     document.querySelector('#button-text').classList.add('hidden');
//   } else {
//     document.querySelector('button').disabled = false;
//     document.querySelector('#spinner').classList.add('hidden');
//     document.querySelector('#button-text').classList.remove('hidden');
//   }
// };


