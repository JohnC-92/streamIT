const {assert, requester} = require('./set_up');

describe('videos', async () => {
  it('select all videos with stream key', async () => {
    const res = await requester.get('/vods/11v8TWJGa');
    const videos = res.body;

    const video2Expect = [
      {
        id: 1,
        stream_key: '11v8TWJGa',
        video_url: 'https://streamit-tw.com/video1.mp4',
        img_url: 'https://streamit-tw.com/image1.png',
        time_created: '2020-07-30T18:00:00.000Z',
      },
      {
        id: 2,
        stream_key: '11v8TWJGa',
        video_url: 'https://streamit-tw.com/video2.mp4',
        img_url: 'https://streamit-tw.com/image2.png',
        time_created: '2020-07-30T18:00:00.000Z',
      },
    ];

    assert.deepEqual(videos, video2Expect);
  });

  it('select one video with specific video id 4', async () => {
    const res = await requester.get('/vod/4');

    const video = res.body;
    const video2Expect = [
      {
        id: 4,
        stream_key: '44v8TWJGa',
        video_url: 'https://streamit-tw.com/video4.mp4',
        img_url: 'https://streamit-tw.com/image4.png',
        time_created: '2020-07-30T18:00:00.000Z',
      },
    ];

    assert.deepEqual(video, video2Expect);
  });
});

