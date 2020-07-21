const socket = io();
let users = {};

// Get room and users
socket.on('usersCount', ({usersCount}) => {
  users = usersCount;
  console.log(usersCount);

  if (Object.keys(users).length > 0) {
    getViewers(users);
  };
});

/**
 * Function to input viewers
 * @param {*} users
 */
function getViewers(users) {
  Object.keys(users).forEach((key) => {
    const viewers = users[key];

    const className = '.stream'+key;
    const viewCount = document.querySelector(className);

    const sideclassName = '.side'+key;
    const sideViewCount = document.querySelector(sideclassName);

    console.log('className: ', className)
    console.log('span: ', viewCount)

    if (viewCount !== null) {
      viewCount.innerText = '觀看人數: ' + viewers;
    }

    if (sideViewCount !== null) {
      sideViewCount.innerText = viewers;
    }
 });
}
