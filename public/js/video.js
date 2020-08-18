let streamerId;
if (window.location.href.split('streamerId=')[1]) {
  streamerId = parseInt(window.location.href.split('streamerId=')[1].split('&')[0]);
} else {
  streamerId = 1;
}
let streamerKey;

const donateForm = document.querySelector('.donateForm');
const donateBtn = document.querySelector('.donateBtn');
const donateCloseBtn = document.querySelector('.donateCloseBtn');
const followBtn = document.querySelector('.followBtn');
const chatX = document.querySelector('.chatX');
const chatUsers = document.querySelector('.chat-users');
const chatUsersList = document.querySelector('.chat-usersList');
chatUsersList.style.display = 'none';
const receiver = document.getElementById('receiver');

const viewers = document.querySelector('.streamerViewers');
viewers.innerText = '觀看人數： 1';

if (localStorage.getItem('userInfo')) {
  const followArr = JSON.parse(localStorage.getItem('userInfo')).followed;
  if (followArr.length !== 0) {
    followArr.map((f) => {
      if (f.id === streamerId) {
        followBtn.innerText = '取消追蹤';
      }
    });
  }
}

donateBtn.addEventListener('click', () => {
  if (token) {
    if (JSON.parse(localStorage.getItem('userInfo')).id === streamerId) {
      alert(`無法贊助自己`);
      return;
    }
  }

  const giver = document.getElementById('giver');

  if (localStorage.length !== 0) {
    giver.value = JSON.parse(localStorage.getItem('userInfo')).name;
    giver.readOnly = true;
  }
 
  donateForm.style.display = 'block';
});

donateCloseBtn.addEventListener('click', () => {
  donateForm.style.display = 'none';
});

followBtn.addEventListener('click', () => {
  if (!token) {
    alert('登入以追蹤實況主');
    return;
  }

  if (token) {
    if (JSON.parse(localStorage.getItem('userInfo')).id === streamerId) {
      alert(`無法追蹤自己`);
      return;
    }
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

const followStreamer = async () => {
  let follow;
  if (followBtn.innerText === '追蹤') {
    follow = true;
  } else {
    follow = false;
  }
  data = {
    follow: follow,
    fromId: JSON.parse(localStorage.getItem('userInfo')).id,
    toId: streamerId,
  };
  await fetch('/user/followers', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((res) => {
    if (res.status === 200) {
      if (followBtn.innerText === '追蹤') {
        followBtn.innerText = '取消追蹤';
      } else {
        followBtn.innerText = '追蹤';
      }
    }
    return res.json();
  });
};

const getVideo = async () => {
  if (window.location.href.indexOf('id=') !== -1) {
    const video = document.getElementById('video');
    const id = window.location.href.split('id=')[1];
    await fetch('/vod/'+id, {
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
        url: 'http://127.0.0.1:8888/live/'+streamerKey+'.flv',
        // url: 'https://streamit.website:8888/live/'+streamerKey+'.flv',
        // url: 'https://dinay18pwoqyb.cloudfront.net/live/'+streamerKey+'.flv',
        // url: 'https://d6r73c53ses2h.cloudfront.net/live/'+streamerKey+'.flv',
      });
      flvPlayer.attachMediaElement(video);
      flvPlayer.load();
      flvPlayer.play();
    };
  }
};

/**
 * Function to get streamer profile in video page
 */
function getStreamerProfileandGetVideo() {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
      const response =JSON.parse(request.response).data;
      // console.log(response)
      // console.log(response[0])
      streamerKey = response.streamKey;

      const streamerProfile = document.querySelector('.streamerProfile');
      streamerProfile.setAttribute('href', '/profile?streamerId='+streamerId)

      const streamerImg = document.querySelector('.streamerImg');
      streamerImg.setAttribute('src', response.picture);

      const streamerTitle = document.querySelector('.streamerTitle');
      streamerTitle.innerText = response.streamTitle || 'Welcome to ' + response.name + `'s stream`;
      // streamerTitle.innerText = response.streamTitle || 'Welcome to ' + response.name + `'s stream`;

      const streamerName = document.querySelector('.streamerName');
      streamerName.innerText = response.name;

      // if (room !== response.name) {
      //   window.location.replace('/error404');
      // }

      receiver.value = response.name;
      receiver.readOnly = true;

      console.log('heheehe')

      const streamerViewers = document.querySelector('.streamerViewers');
      if (users[response.streamKey]) {
        if (users[response.streamKey] === undefined) {
          streamerViewers.innerText = '觀看人數： 1';
        } else {
          streamerViewers.innerText = '觀看人數： ' + users[response.streamKey];
        }
      }
      getVideo();
    }
  };
  request.open('GET', '/user/keys/'+streamerId);
  request.send();
}
