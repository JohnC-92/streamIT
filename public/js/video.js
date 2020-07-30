const donateBtn = document.querySelector('.donateBtn');
const followBtn = document.querySelector('.followBtn');
const chatX = document.querySelector('.chatX');
const chatUsers = document.querySelector('.chat-users');
const chatUsersList = document.querySelector('.chat-usersList');
chatUsersList.style.display = 'none';

donateBtn.addEventListener('click', () => {
  window.location.replace('web/donate.html');
});

followBtn.addEventListener('click', () => {
  if (!token) {
    alert('登入以追蹤實況主');
    return;
  }
  followStreamer();
});

chatX.addEventListener('click', () => {
  chatUsersList.style.display = 'none';
});

chatUsers.addEventListener('click', () => {
  if (chatUsersList.style.display === 'none') {
    chatUsersList.style.display = 'block';
  } else if (chatUsersList.style.display === 'block') {
    chatUsersList.style.display = 'none';
  }
});

const followStreamer = async() => {
  data = {
    follow: true,
    
  };
  await fetch('/user/updateFollowers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((res) => {
    console.log(res);
    return res.json();
  }).then((res) => {
    console.log(res);
  });
};

const getVideo = async() => {
  if (window.location.href.indexOf('id=') !== -1) {
    const video = document.getElementById('video');
    const id = window.location.href.split('id=')[1];
    await fetch('/vodOne/'+id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      return res.json();
    }).then((res) => {
      const source = document.createElement('source');
      source.src = res[0].video_url;
      source.type = 'video/mp4';
      video.appendChild(source);
    });
  } else {
    if (flvjs.isSupported()) {
      const video = document.getElementById('video');
      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: 'http://127.0.0.1:8888/live/'+window.location.href.split('=')[1].split('&')[0]+'.flv',
        // url: 'https://streamit.website:8888/live/'+window.location.href.split('=')[1].split('&')[0]+'.flv',
      });
      flvPlayer.attachMediaElement(video);
      flvPlayer.load();
      flvPlayer.play();
    };
  }
};

let streamerId;
/**
 * Function to get streamer profile in video page
 */
function getSingleUserKey() {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
      const response =JSON.parse(request.response)[0];

      streamerId = response.id;

      const streamerImg = document.querySelector('.streamerImg');
      streamerImg.setAttribute('src', response.picture);

      const streamerTitle = document.querySelector('.streamerTitle');
      streamerTitle.innerText = response.stream_title;

      const streamerName = document.querySelector('.streamerName');
      streamerName.innerText = response.name;

      const streamerViewers = document.querySelector('.streamerViewers');
      if (users[response.key]) {
        streamerViewers.innerText = '觀看人數： ' + users[response.key];
      } else {
        streamerViewers.innerText = '觀看人數： 1';
      }
    }
  };
  request.open('GET', '/user/keys/'+streamerKey);
  request.send();
}
