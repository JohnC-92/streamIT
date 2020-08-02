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

donateBtn.addEventListener('click', () => {
  if (token) {
    if (JSON.parse(localStorage.getItem('userInfo')).id === streamerId) {
      alert(`無法贊助自己`);
      return;
    }
  }
  // window.location.replace('web/donate.html');
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
  await fetch('/user/updateFollowers', {
    method: 'POST',
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
  // if (window.location.href.indexOf('id=') !== -1) {
  //   const video = document.getElementById('video');
  //   const id = window.location.href.split('id=')[1];
  //   await fetch('/vodOne/'+id, {
  //     method: 'GET',
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   }).then((res) => {
  //     return res.json();
  //   }).then((res) => {
  //     const source = document.createElement('source');
  //     source.src = res[0].video_url;
  //     source.type = 'video/mp4';
  //     video.appendChild(source);
  //   });
  // } else {
  //   if (flvjs.isSupported()) {
  //     const video = document.getElementById('video');
  //     const flvPlayer = flvjs.createPlayer({
  //       type: 'flv',
  //       url: 'http://127.0.0.1:8888/live/'+streamerKey+'.flv',
  //       // url: 'https://streamit.website:8888/live/'+streamerKey+'.flv',
  //     });
  //     flvPlayer.attachMediaElement(video);
  //     flvPlayer.load();
  //     flvPlayer.play();
  //   };
  // }

  if (window.location.href.indexOf('id=') !== -1) {
    console.log('HEY1')
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
  } else if (window.location.href.split('video')[1]==='') {
    console.log('HEY2')
    let videoDiv = document.querySelector('.videoDiv');
    videoDiv.innerHTML = `<iframe width="1080" height="765" src="https://www.youtube.com/embed/qeX4_MEnLLo?start=27&autoplay=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    console.log('HEY3')
    if (flvjs.isSupported()) {
      const video = document.getElementById('video');
      const flvPlayer = flvjs.createPlayer({
        type: 'flv',
        url: 'http://127.0.0.1:8888/live/'+streamerKey+'.flv',
        // url: 'https://streamit.website:8888/live/'+streamerKey+'.flv',
        // url: 'https://dinay18pwoqyb.cloudfront.net/live/'+streamerKey+'.flv',
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
      streamerKey = response.stream_key;

      const streamerImg = document.querySelector('.streamerImg');
      streamerImg.setAttribute('src', response.picture);

      const streamerTitle = document.querySelector('.streamerTitle');
      streamerTitle.innerText = response.stream_title || 'Welcome to ' + response.name + `'s world`;

      const streamerName = document.querySelector('.streamerName');
      streamerName.innerText = response.name;

      const streamerViewers = document.querySelector('.streamerViewers');
      if (users[response.key]) {
        streamerViewers.innerText = '觀看人數： ' + users[response.key];
      } else {
        streamerViewers.innerText = '觀看人數： 1';
      }
      getVideo();
    }
  };
  request.open('GET', '/user/keys/'+streamerId);
  request.send();
}
