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
          const div = createStreamDIV(keys[i], keyObj[keys[i]+'1'], keyObj[keys[i]+'2'], keyObj[keys[i]+'3'], keyObj[keys[i]+'4'], keyObj[keys[i]+'5']);
          liveChannels.appendChild(div);
        }
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
    type = type.toLowerCase();
    streams.setAttribute('class', 'streams '+type);
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

  const streamTitleName = document.createElement('div');
  streamTitleName.setAttribute('class', 'streamTitleName');

  const streamTitle = document.createElement('div');
  streamTitle.setAttribute('class', 'streamTitle');
  streamTitle.innerText = title || 'Welcome to ' + name + `'s world`;

  const streamName = document.createElement('div');
  streamName.setAttribute('class', 'streamName');
  streamName.innerText = name;

  // const streamType = document.createElement('div');
  // streamType.setAttribute('class', 'streamType');
  // streamType.innerText = 'Musical';

  streamThumbnail.appendChild(img);
  streamThumbnail.appendChild(spanLive);
  streamThumbnail.appendChild(spanCount);
  url.appendChild(streamThumbnail);
  streams.appendChild(url);
  streamDesc.appendChild(streamImg);
  streamTitleName.appendChild(streamTitle);
  streamTitleName.appendChild(streamName);
  streamDesc.appendChild(streamTitleName);
  streams.appendChild(streamDesc);
  // streams.appendChild(streamType);
  return streams;
};





