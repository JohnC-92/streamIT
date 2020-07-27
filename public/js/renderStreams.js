/**
 * Function to render profile page
 */
function renderStreams() {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
      const liveChannels = document.querySelector('.liveChannels');
      const sideBar = document.querySelector('.sideBar');
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
        const div = createStreamDIV(keys[i], keyObj[keys[i]+'1'], keyObj[keys[i]+'2'], keyObj[keys[i]+'3']);
        liveChannels.appendChild(div);
        const sideBarDiv = createSidebarDIV(keys[i], keyObj[keys[i]+'1'], keyObj[keys[i]+'2'], keyObj[keys[i]+'3']);
        sideBar.appendChild(sideBarDiv);
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
 * @return {*} return stream DIV
 */
function createStreamDIV(key, name, title, picture) {
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


/**
 * Function to create Sidebar DIV
 * @param {*} key
 * @param {*} name
 * @param {*} title
 * @param {*} picture
 * @return {*} return sidebar DIV
 */
function createSidebarDIV(key, name, title, picture) {
  const url = document.createElement('a');
  url.setAttribute('href', '/video?key='+key+'&room='+name);

  const sideStream = document.createElement('sideStream');
  sideStream.setAttribute('class', 'sideStream');

  const div = document.createElement('div');

  const sideImg = document.createElement('img');
  sideImg.setAttribute('class', 'sideImg');
  sideImg.setAttribute('src', picture);

  const sideTitleName = document.createElement('div');
  sideTitleName.setAttribute('class', 'sideTitleName');

  const sideStreamTitle = document.createElement('div');
  sideStreamTitle.setAttribute('class', 'sideStreamTitle');
  sideStreamTitle.innerText = title || name + `'s world`;

  const sideName = document.createElement('div');
  sideName.setAttribute('class', 'sideName');
  sideName.innerText = name;

  const sideDot = document.createElement('div');
  sideDot.setAttribute('class', 'sideDot');

  const sideViewers = document.createElement('div');
  sideViewers.setAttribute('class', 'sideViewers side'+name);
  if (users[key] === undefined) {
    sideViewers.innerText = '0';
  } else {
    sideViewers.innerText = users[key];
  }

  div.appendChild(sideImg);
  sideTitleName.appendChild(sideStreamTitle);
  sideTitleName.appendChild(sideName);
  sideStream.appendChild(div);
  sideStream.appendChild(sideTitleName);
  sideStream.appendChild(sideDot);
  sideStream.appendChild(sideViewers);
  url.appendChild(sideStream);

  return url;
};
