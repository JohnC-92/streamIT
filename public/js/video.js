/**
 * Function to get streamer profile in video page
 */
function getSingleUserKey() {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
      const response =JSON.parse(request.response)[0];

      const playerImg = document.querySelector('.playerImg');
      playerImg.setAttribute('src', response.picture);

      const playerTitle = document.querySelector('.playerTitle');
      playerTitle.innerText = response.stream_title;

      const playerName = document.querySelector('.playerName');
      playerName.innerText = response.name;

      const playerViewers = document.querySelector('.playerViewers');
      if (users[response.key]) {
        playerViewers.innerText = '觀看人數： ' + users[response.key];
      } else {
        playerViewers.innerText = '觀看人數： 1';
      }
    }
  };
  request.open('GET', '/user/keys/'+streamerKey);
  // request.open('GET', 'https://15.165.218.32:8888/api/streams');
  request.send();
}