const liveGaming = document.querySelector('.liveGaming');
const liveMusical = document.querySelector('.liveMusical');
const liveTalk = document.querySelector('.liveTalk');

liveGaming.addEventListener('click', () => {
  streamFilter('gaming');
});

liveMusical.addEventListener('click', () => {
  streamFilter('musical');
});

liveTalk.addEventListener('click', () => {
  streamFilter('talkshow');
});

// const gamingCategory = document.querySelector('.menu-2');
// const musicCategory = document.querySelector('.menu-3');
// const talkCategory = document.querySelector('.menu-4');

// gamingCategory.addEventListener('click', () => {
//   streamFilter('gaming');
// });
// musicCategory.addEventListener('click', () => {
//   streamFilter('musical');
// });
// talkCategory.addEventListener('click', () => {
//   streamFilter('talkshow');
// }); 

/**
 * Function to render profile page
 */
function renderStreams() {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
      const liveChannels = document.querySelector('.liveChannels');
      if (JSON.parse(request.response).live) {
        const keys = Object.keys(JSON.parse(request.response).live);
        // console.log(keys)
        let keyObj;
        await fetch('/user/keys', {
          method: 'GET',
        }).then((res) => {
          return res.json();
        }).then((res) => {
          keyObj = res;
        });
        for (let i = 0; i < keys.length; i++) {
          // function createStreamDIV(key, name, title, picture, type, id) {
          const div = createStreamDIV(keys[i], keyObj[keys[i]+'-name'], keyObj[keys[i]+'-title'], keyObj[keys[i]+'-picture'], keyObj[keys[i]+'-type'], keyObj[keys[i]+'-id']);
          liveChannels.appendChild(div);
        }

        // const streamTypes = document.querySelectorAll('.streamType');
        // for (i = 0; i < streamTypes.length; i++) {
        //   streamTypes[i].addEventListener('click', () => {
        //     streamFilter(streamTypes[i].innerText.toLowerCase());
        //   });
        // }
      }
      const streamTypes = document.querySelectorAll('.streamType');
      for (i = 0; i < streamTypes.length; i++) {
        streamTypes[i].addEventListener('click', (e) => {
          streamFilter(e.target.innerText.toLowerCase());
        });
      }
    }
  };
  request.open('GET', 'http://127.0.0.1:8888/api/streams');
  // request.open('GET', 'https://streamit.website:8888/api/streams');
  request.send();
}

/**
 * Function to create Stream DIV
 * @param {*} key
 * @param {*} name
 * @param {*} title
 * @param {*} picture
 * @param {*} type
 * @param {*} id
 * @return {*} return stream DIV
 */
function createStreamDIV(key, name, title, picture, type, id) {
  const streams = document.createElement('div');
  if (type) {
    const streamType = type.toLowerCase();
    streams.setAttribute('class', 'streams '+streamType);
  } else {
    streams.setAttribute('class', 'streams gaming');
  }

  const streamThumbnail = document.createElement('div');
  streamThumbnail.setAttribute('class', 'streamThumbnail');

  const url = document.createElement('a');
  url.setAttribute('href', '/video?streamerId='+id+'&room='+name);

  const img = document.createElement('img');
  img.setAttribute('class', 'thumbnails');
  img.setAttribute('src', '/thumbnails/'+key+'.png');

  const spanLive = document.createElement('span');
  spanLive.setAttribute('class', 'streamliveLabel');
  spanLive.innerText = 'LIVE';

  const spanCount = document.createElement('span');
  spanCount.setAttribute('class', 'streamcountLabel stream'+name);
  if (users[key] === undefined) {
    spanCount.innerText = '觀看人數: 0';
  } else {
    spanCount.innerText = `觀看人數: ${users[key]}`;
  }

  const streamDesc = document.createElement('div');
  streamDesc.setAttribute('class', 'streamDesc');

  const streamImg = document.createElement('img');
  streamImg.setAttribute('class', 'streamImg');
  streamImg.setAttribute('src', picture);

  const streamImgProfile = document.createElement('a');
  streamImgProfile.setAttribute('href', '/profile?streamerId=' + id);

  const streamTitleName = document.createElement('div');
  streamTitleName.setAttribute('class', 'streamTitleName');

  const streamTitle = document.createElement('div');
  streamTitle.setAttribute('class', 'streamTitle');
  streamTitle.innerText = title || 'Welcome to ' + name + `'s stream`;

  const streamProfile = document.createElement('a');
  streamProfile.setAttribute('href', '/profile?streamerId=' + id);

  const streamName = document.createElement('div');
  streamName.setAttribute('class', 'streamName');
  streamName.innerText = name;

  const streamType = document.createElement('div');
  streamType.setAttribute('class', 'streamType');
  streamType.innerText = type || 'Gaming';

  streamThumbnail.appendChild(img);
  streamThumbnail.appendChild(spanLive);
  streamThumbnail.appendChild(spanCount);
  url.appendChild(streamThumbnail);
  streams.appendChild(url);
  
  streamImgProfile.appendChild(streamImg)
  streamDesc.appendChild(streamImgProfile);
  streamTitleName.appendChild(streamTitle);
  streamProfile.appendChild(streamName);
  streamTitleName.appendChild(streamProfile);
  streamTitleName.appendChild(streamType);
  streamDesc.appendChild(streamTitleName);
  streams.appendChild(streamDesc);
  // streams.appendChild(streamType);
  return streams;
};

