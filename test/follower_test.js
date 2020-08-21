const {assert, requester} = require('./set_up');

describe('followers', async () => {
  it('get followers with specific id', async () => {
    const id = 7;
    const from = 'false';
    const res = await requester.get(`/user/followers?id=${id}&from=${from}`);
    const followers = res.body;

    const followers2Expect = [
      {from_id: 5, followed_at: '2020-08-07T16:00:04.000Z'},
      {from_id: 1, followed_at: '2020-08-07T16:00:04.000Z'},
    ];

    assert.deepEqual(followers, followers2Expect);
  });

  it('get followed with specific id', async () => {
    const id = 1;
    const from = 'true';
    const res = await requester.get(`/user/followers?id=${id}&from=${from}`);
    const followed = res.body;

    const followed2Expect = [
      {
        to_id: 2,
        followed_at: '2020-08-07T16:00:04.000Z',
      },
      {
        to_id: 4,
        followed_at: '2020-08-07T16:00:04.000Z',
      },
      {
        to_id: 7,
        followed_at: '2020-08-07T16:00:04.000Z',
      },
    ];

    assert.deepEqual(followed, followed2Expect);
  });
});

