/**
 * Function to render sidebar
 */
function renderSidebar() {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
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
 * Function to create Sidebar DIV
 * @param {*} key
 * @param {*} name
 * @param {*} title
 * @param {*} picture
 * @param {*} type
 * @return {*} return sidebar DIV
 */
function createSidebarDIV(key, name, title, picture, type) {
  const sideStream = document.createElement('div');
  if (type) {
    type = type.toLowerCase();
    sideStream.setAttribute('class', 'sideStream '+type);
  } else {
    sideStream.setAttribute('class', 'sideStream gaming');
  }

  const url = document.createElement('a');
  url.setAttribute('href', '/video?key='+key+'&room='+name);

  const div = document.createElement('div');
  div.setAttribute('class', 'sideRow');

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

  sideTitleName.appendChild(sideStreamTitle);
  sideTitleName.appendChild(sideName);
  div.appendChild(sideImg);
  div.appendChild(sideTitleName);
  div.appendChild(sideDot);
  div.appendChild(sideViewers);
  url.appendChild(div);
  sideStream.appendChild(url);

  return sideStream;
};