/**
 * Function to render profile page
 */
function renderStreams() {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
      const liveChannels = document.querySelector('.liveChannels');
      const keys = Object.keys(JSON.parse(request.response).live);

      let keyObj;
      await fetch('/user/keys', {
        method: 'GET',
      }).then((res) => {
        return res.json();
      }).then((res) => {
        keyObj = res;
      });
      for (let i = 0; i < keys.length; i++) {
        const div = createStreamDIV(keys[i], keyObj[keys[i]]);
        liveChannels.appendChild(div);
      }
    }
  };
  request.open('GET', 'http://127.0.0.1:8888/api/streams');
  request.send();
}

/**
 * Function to create Stream DIV
 * @param {*} key
 * @param {*} name
 * @return {*} return stream DIV
 */
function createStreamDIV(key, name) {
  const streams = document.createElement('div');
  streams.setAttribute('class', 'streams');

  const streamThumbnail = document.createElement('div');
  streamThumbnail.setAttribute('class', 'streamThumbnail');

  const url = document.createElement('a');
  url.setAttribute('href', '/video?key='+key+'&room='+name);

  const img = document.createElement('img');
  img.setAttribute('class', 'thumbnails');
  img.setAttribute('src', '/thumbnails/'+key+'.png');

  const spanLive = document.createElement('span');
  spanLive.setAttribute('class', 'streamliveLabel');
  spanLive.innerText = 'live';

  const spanCount = document.createElement('span');
  spanCount.setAttribute('class', 'streamcountLabel');
  spanCount.innerText = '觀看人數:123';

  const streamTitle = document.createElement('div');
  streamTitle.setAttribute('class', 'streamTitle');
  streamTitle.innerText = 'Welcome to ' + name + `'s world`;

  const streamName = document.createElement('div');
  streamName.setAttribute('class', 'streamName');
  streamName.innerText = name;

  const streamType = document.createElement('div');
  streamType.setAttribute('class', 'streamType');
  streamType.innerText = 'Musical';

  url.appendChild(img);
  streamThumbnail.appendChild(url);
  streamThumbnail.appendChild(spanLive);
  streamThumbnail.appendChild(spanCount);
  streams.appendChild(streamThumbnail);
  streams.appendChild(streamTitle);
  streams.appendChild(streamName);
  streams.appendChild(streamType);
  return streams;
}