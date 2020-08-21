const users = [
  {
    provider: 'native',
    email: 'test1@gmail.com',
    password: 'test1password',
    name: 'test1',
    picture: 'https://cdn.onlinewebfonts.com/svg/img_297675.png',
    access_token: 'test1accesstoken',
    access_expired: 3600,
    stream_key: '4wv8TWJ11',
    stream_title: 'test1 world',
    stream_type: 'Gaming',
    login_at: '2020-07-21 00:00:01',
  },
  {
    provider: 'facebook',
    email: 'test2@gmail.com',
    password: 'test2password',
    name: 'test2',
    picture: 'https://cdn.onlinewebfonts.com/svg/img_297675.png',
    access_token: 'test2accesstoken',
    access_expired: 3600,
    stream_key: '4wv8TWJ22',
    stream_title: 'test2 world',
    stream_type: 'Musical',
    login_at: '2020-07-21 00:00:02',
  },
  {
    provider: 'facebook',
    email: 'test3@gmail.com',
    password: 'test3password',
    name: 'test3',
    picture: 'https://cdn.onlinewebfonts.com/svg/img_297675.png',
    access_token: 'test3accesstoken',
    access_expired: 3600,
    stream_key: '4wv8TWJ33',
    stream_title: 'test3 world',
    stream_type: 'TalkShow',
    login_at: '2020-07-21 00:00:03',
  },
  {
    provider: 'native',
    email: 'test4@gmail.com',
    password: 'test4password',
    name: 'test4',
    picture: 'https://cdn.onlinewebfonts.com/svg/img_297675.png',
    access_token: 'test4accesstoken',
    access_expired: 3600,
    stream_key: '4wv8TWJ44',
    stream_title: 'test4 world',
    stream_type: 'Gaming',
    login_at: '2020-07-21 00:00:04',
  },
];

const followers = [
  {
    from_id: 1,
    to_id: 2,
    followed_at: '2020-08-08 00:00:04',
  },
  {
    from_id: 1,
    to_id: 4,
    followed_at: '2020-08-08 00:00:04',
  },
  {
    from_id: 5,
    to_id: 7,
    followed_at: '2020-08-08 00:00:04',
  },
  {
    from_id: 1,
    to_id: 7,
    followed_at: '2020-08-08 00:00:04',
  },
];

const payments = [
  {
    from_id: 1,
    from_name: 'john',
    to_id: 2,
    to_name: 'jessica',
    amount: '5200',
    message: 'love you',
    time_created: '2020-10-20 00:00:20',
  },
  {
    from_id: 1,
    from_name: 'john',
    to_id: 3,
    to_name: 'ben',
    amount: '1200',
    message: 'tax money',
    time_created: '2020-10-20 00:00:10',
  },
  {
    from_id: 3,
    from_name: 'ben',
    to_id: 4,
    to_name: 'paul',
    amount: '2000',
    message: 'entertainment money from mom',
    time_created: '2020-10-20 00:00:00',
  },
  {
    from_id: 4,
    from_name: 'paul',
    to_id: 1,
    to_name: 'john',
    amount: '8800',
    message: 'inherited from dad',
    time_created: '2020-10-20 00:00:35',
  },
];

const videos = [
  {
    stream_key: '11v8TWJGa',
    video_url: 'https://streamit-tw.com/video1.mp4',
    img_url: 'https://streamit-tw.com/image1.png',
    time_created: '2020-07-31 02:00:00',
    stream_title: 'testtitle1',
  },
  {
    stream_key: '11v8TWJGa',
    video_url: 'https://streamit-tw.com/video2.mp4',
    img_url: 'https://streamit-tw.com/image2.png',
    time_created: '2020-07-31 02:00:00',
    stream_title: 'testtitle2',
  },
  {
    stream_key: '33v8TWJGa',
    video_url: 'https://streamit-tw.com/video3.mp4',
    img_url: 'https://streamit-tw.com/image3.png',
    time_created: '2020-07-31 02:00:00',
    stream_title: 'testtitle3',
  },
  {
    stream_key: '44v8TWJGa',
    video_url: 'https://streamit-tw.com/video4.mp4',
    img_url: 'https://streamit-tw.com/image4.png',
    time_created: '2020-07-31 02:00:00',
    stream_title: 'testtitle4',
  },
];

module.exports = {
  users,
  followers,
  payments,
  videos,
};
