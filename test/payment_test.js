const {assert, requester} = require('./set_up');
const {stripePK} = require('../utils/config');

describe('payments', async () => {
  it('getting stripe public key', async () => {
    const res = await requester.get('/payment/stripe-key');
    const key = res.body.publishableKey;

    assert.equal(stripePK, key);
  });

  it('getting payment history with specific id 1', async () => {
    const res = await requester.post('/payment/records/1');
    const data = res.body;

    const payment2Expect = {
      paid: [
        {
          id: 1,
          from_id: 1,
          from_name: 'john',
          to_id: 2,
          to_name: 'jessica',
          amount: '5200',
          message: 'love you',
          time_created: '2020-10-19T16:00:20.000Z',
        },
        {
          id: 2,
          from_id: 1,
          from_name: 'john',
          to_id: 3,
          to_name: 'ben',
          amount: '1200',
          message: 'tax money',
          time_created: '2020-10-19T16:00:10.000Z',
        },
      ],
      received: [
        {
          id: 4,
          from_id: 4,
          from_name: 'paul',
          to_id: 1,
          to_name: 'john',
          amount: '8800',
          message: 'inherited from dad',
          time_created: '2020-10-19T16:00:35.000Z',
        },
      ],
    };

    assert.deepEqual(data, payment2Expect);
  });
});
