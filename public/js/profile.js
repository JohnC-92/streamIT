const profileImgBtn = document.querySelector('.profileImg-Btn');
const profileImgInputBtn = document.getElementById('profileImg-InputBtn');
const profileImgSubmitBtn = document.getElementById('profileImg-SubmitBtn');
const profileForm = document.querySelector('.profileForm');
const profileUpdateBtn = document.querySelector('.profileInfo-Btn');
const deleteAccountBtn = document.querySelector('.deleteAccount');

const profileInfoTab = document.querySelector('.profileInfo');
const profileVideoTab = document.querySelector('.profileVideo');
const profileFollowerTab = document.querySelector('.profileFollower');
const profileStripeTab = document.querySelector('.profileStripe');

const profileInfoDiv = document.querySelector('.profileInfoTab');
const profileVideoDiv = document.querySelector('.profileVODTab');
const profileFollowerDiv = document.querySelector('.profileFollowerTab');
const profileStripeDiv = document.querySelector('.profileStripeTab');

// profileInfoDiv.style.display = 'none';
profileVideoDiv.style.display = 'none';
profileFollowerDiv.style.display = 'none';
profileStripeDiv.style.display = 'none';

// Profile info tabs
profileInfoTab.addEventListener('click', () => {
  profileInfoTab.setAttribute('class', 'profileInfo profileActive');
  profileVideoTab.setAttribute('class', 'profileVideo');
  profileFollowerTab.setAttribute('class', 'profileFollower');
  profileStripeTab.setAttribute('class', 'profileStripe');

  profileInfoDiv.style.display = 'block';
  profileVideoDiv.style.display = 'none';
  profileFollowerDiv.style.display = 'none';
  profileStripeDiv.style.display = 'none';
});

profileImgBtn.addEventListener('click', () => {
  profileImgInputBtn.click();
});

profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  updateProfileImage();
});
 
profileImgInputBtn.addEventListener('change', () => {
  const fileExt = profileImgInputBtn.value.split('.').pop();
  if ((fileExt === 'png') || (fileExt === 'jpg') || (fileExt === 'jpeg')) {
    profileImgSubmitBtn.click();
  } else {
    alert('File chosen is not JPEG or PNG');
  }
});

profileUpdateBtn.addEventListener('click', () => {
  updateProfile();
});

deleteAccountBtn.addEventListener('click', () => {
  deleteAccount();
});

// Profile VODS tabs
profileVideoTab.addEventListener('click', () => {
  profileInfoTab.setAttribute('class', 'profileInfo');
  profileVideoTab.setAttribute('class', 'profileVideo profileActive');
  profileFollowerTab.setAttribute('class', 'profileFollower');
  profileStripeTab.setAttribute('class', 'profileStripe');

  profileInfoDiv.style.display = 'none';
  profileVideoDiv.style.display = 'block';
  profileFollowerDiv.style.display = 'none';
  profileStripeDiv.style.display = 'none';
});

// Profile Followers tabs
profileFollowerTab.addEventListener('click', () => {
  profileInfoTab.setAttribute('class', 'profileInfo');
  profileVideoTab.setAttribute('class', 'profileVideo');
  profileFollowerTab.setAttribute('class', 'profileFollower profileActive');
  profileStripeTab.setAttribute('class', 'profileStripe');

  profileInfoDiv.style.display = 'none';
  profileVideoDiv.style.display = 'none';
  profileFollowerDiv.style.display = 'block';
  profileStripeDiv.style.display = 'none';
});

// Profile Stripe tabs
profileStripeTab.addEventListener('click', () => {
  profileInfoTab.setAttribute('class', 'profileInfo');
  profileVideoTab.setAttribute('class', 'profileVideo');
  profileFollowerTab.setAttribute('class', 'profileFollower');
  profileStripeTab.setAttribute('class', 'profileStripe profileActive');

  profileInfoDiv.style.display = 'none';
  profileVideoDiv.style.display = 'none';
  profileFollowerDiv.style.display = 'none';
  profileStripeDiv.style.display = 'block';
});

// profile page rendering
const streamerId = window.location.href.split('streamerId=')[1];
if (token) {
  if (streamerId !== undefined) {
    if (JSON.parse(localStorage.getItem('userInfo')).id === parseInt(streamerId)) {
      getProfile(token);
    } else {
      getProfileStreamer(streamerId);
    }
  } else {
    getProfile(token);
  }
} else if (streamerId !== undefined) {
  getProfileStreamer(streamerId);
} else {
  window.location.replace('/error404');
}

/**
 * Function to check if token cookie exist and get user profile
 * @param {*} token access token given by server
 */
async function getProfile(token) {
  try {
    await fetch('/user/profile', {
      method: 'GET',
      headers: {
        authorization: token,
      },
    }).then((res) => {
      return res.json();
    }).then((res) => {
      console.log('ProfileInfo: ', res);
      if (!res.error) {
        // get show profile divs
        const image = document.querySelector('.profileImg-Img');
        const name = document.querySelector('.profileName');
        const profileImgEmail = document.getElementById('profileImg-Email');
        const email = document.querySelector('.profileEmail');
        const streamKey = document.querySelector('.profileKey');
        const profileStreamTitle = document.querySelector('.profileStreamTitle');
        const profileStreamType = document.querySelector('.profileStreamType');

        image.src = res.data.picture;
        name.value = res.data.name;
        profileImgEmail.value = res.data.email;
        email.value = res.data.email;
        streamKey.value = res.data.streamKey;
        profileStreamTitle.value = res.data.streamTitle || `Welcome to ${res.data.name}'s world`;
        profileStreamType.value = res.data.streamType || `Gaming`;

        // fetch VODS
        fetchVODs(res.data.name, res.data.streamKey, res.data.picture);

        // add followers/followed div
        createFollowDIV(res.data.followers, res.data.followersTime, res.data.followed, res.data.followedTime);

        // add payment div
        getPayment(res.data.id);
      } else {
        alert('Token Expired/Invalid, Please sign in again');
        signOut();
        window.location.replace('/');
      }
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * Function to get streamer profile info
 * @param {*} streamerId streamerId provided when landing on profile page
 */
async function getProfileStreamer(streamerId) {
  try {
    await fetch('/user/keys/'+streamerId, {
      method: 'GET',
    }).then((res) => {
      console.log(res);
      return res.json();
    }).then((res) => {
      const data = res.data;
      if (!res.error) {
        // get show profile divs
        const image = document.querySelector('.profileImg-Img');
        const name = document.querySelector('.profileName');
        const profileStreamTitle = document.querySelector('.profileStreamTitle');
        const profileStreamType = document.querySelector('.profileStreamType');

        image.src = data.picture;
        name.value = data.name;
        profileStreamTitle.value = data.streamTitle || `Welcome to ${data.name}'s world`;
        profileStreamType.value = data.streamType || `Gaming`;

        // hide other tabs
        profileStripeTab.style.display = 'none';

        // hide buttons
        const profileImgDesc = document.querySelector('.profileImg-Desc');
        const profileNote = document.querySelector('.profileNote');
        profileImgDesc.style.display = 'none';
        profileNote.style.display = 'none';
        profileUpdateBtn.style.display = 'none';

        // make read only
        document.querySelector('.profileName').readOnly = true;
        document.querySelector('.profileStreamTitle').readOnly = true;
        document.querySelector('.profileStreamType').readOnly = true;

        // fetch VODS
        fetchVODs(data.name, data.streamKey, data.picture);

        // add followers/followed div
        createFollowDIV(data.followers, data.followersTime, data.followed, data.followedTime);
      } else {
        alert('Token Expired/Invalid, Please sign in again');
        signOut();
        window.location.replace('/');
      }
    });
  } catch (err) {
    console.log(err);
    window.location.replace('/error404');
  }
};

/**
 * Function to update profile
 */
async function updateProfile() {
  try {
    data = {
      name: document.querySelector('.profileName').value,
      email: document.querySelector('.profileEmail').value,
      streamTitle: document.querySelector('.profileStreamTitle').value,
      streamType: document.querySelector('.profileStreamType').value,
    };

    if (data.streamType === '') {
      alert('Please choose a stream type');
      return;
    }

    await fetch('/user/updateProfile', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      return res.json();
    }).then((res) => {
      if (res.error) {
        alert(res.error);
        return;
      }
      alert('Update Profile Successful');
      window.location.reload();
    });
  } catch (err) {
    console.log(err);
    alert('Update Profile Failed!');
  }
};

/**
 * Function to update profile image
 */
async function updateProfileImage() {
  const XHR = new XMLHttpRequest();

  // bind profile form to form data object
  const data = new FormData(profileForm);

  // Define what happens on successful data submission
  XHR.addEventListener('load', function() {
    alert('Update Profile Image Successful');
    window.location.reload();
  });

  // Define what happens in case of error
  XHR.addEventListener('error', function() {
    alert('Update Profile Image Failed!');
  });

  // Set up our request
  XHR.open('POST', '/user/updateImg');

  // The data sent is what the user provided in the form
  XHR.send(data);
};

/**
 * Function to delete account
 */
async function deleteAccount() {
  try {
    data = {
      email: document.querySelector('.profileEmail').value,
    };

    if (confirm('Are you sure you want to delete your account?')) {
      await fetch('/user/deleteProfile', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        return res.json();
      }).then((res) => {
        if (res.error) {
          alert(res.error);
          return;
        }
        alert('Delete Profile Successful');
        signOut();
        window.location.replace('index');
      });
    }
  } catch (err) {
    console.log(err);
    alert('Delete Profile Failed!');
  }
}

/**
 * Function to get all VODs
 * @param {*} streamerName
 * @param {*} streamerKey
 * @param {*} streamerPicture
 */
function fetchVODs(streamerName, streamerKey, streamerPicture) {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
      const profileVideoContainer = document.querySelector('.profileVideoRow');
      const VODs = JSON.parse(request.response);
      console.log('VODS: ', VODs);

      for (let i = 0; i < VODs.length; i++) {
        const div = createVodDIV(streamerName, streamerKey, VODs[i], streamerPicture);
        profileVideoContainer.appendChild(div);
      }
    }
  };
  request.open('GET', '/vod/'+streamerKey);
  request.send();
}

/**
 * Function to create VODs DIV
 * @param {*} name
 * @param {*} key
 * @param {*} vod
 * @param {*} picture
 * @return {*} return VODs DIV
 */
function createVodDIV(name, key, vod, picture) {
  const profileVod = document.createElement('div');
  profileVod.setAttribute('class', 'profileVod');

  const streamThumbnail = document.createElement('div');
  streamThumbnail.setAttribute('class', 'streamThumbnail');

  const url = document.createElement('a');
  url.setAttribute('href', '/video?room='+name+'&id='+vod.id);

  const img = document.createElement('img');
  img.setAttribute('class', 'thumbnails');
  img.setAttribute('src', vod.img_url);

  const spanTime = document.createElement('span');
  spanTime.setAttribute('class', 'streamTime');
  // spanTime.innerText = '5分鐘前';
  const currentTime = Date.parse((new Date()).toJSON()); 
  const videoTime = currentTime - Date.parse(vod.time_created);
  spanTime.innerText = secondsToDhms(videoTime/1000) + '前';

  const streamDesc = document.createElement('div');
  streamDesc.setAttribute('class', 'streamDesc');

  const streamImg = document.createElement('img');
  streamImg.setAttribute('class', 'streamImg');
  streamImg.setAttribute('src', picture);

  const streamTitleName = document.createElement('div');
  streamTitleName.setAttribute('class', 'streamTitleName');

  const streamTitle = document.createElement('div');
  streamTitle.setAttribute('class', 'streamTitle');
  streamTitle.innerText = 'Welcome to ' + name + `'s world`;

  const streamName = document.createElement('div');
  streamName.setAttribute('class', 'streamName');
  streamName.innerText = name;

  streamThumbnail.appendChild(img);
  streamThumbnail.appendChild(spanTime);
  url.appendChild(streamThumbnail);
  profileVod.appendChild(url);
  streamDesc.appendChild(streamImg);
  streamTitleName.appendChild(streamTitle);
  streamTitleName.appendChild(streamName);
  streamDesc.appendChild(streamTitleName);
  profileVod.appendChild(streamDesc);
  // streams.appendChild(streamType);
  return profileVod;
};

/**
 * Function to create followers/followed DIV
 * @param {*} followers
 * @param {*} followersTime
 * @param {*} followed 
 * @param {*} followedTime
 */
async function createFollowDIV(followers, followersTime, followed, followedTime) {
  const followerDiv = document.querySelector('.follower');
  const followedDiv = document.querySelector('.followed');

  const followersNum = document.querySelector('.followersNum');
  const followedNum = document.querySelector('.followedNum');

  // followersNum.innerText = followers.length + ' 位追蹤者';
  // followedNum.innerText = followed.length + ' 位已追蹤';
  if (!followers.error) {
    followersNum.innerText = parseInt(followers.length+4).toString() + ' 位追蹤者';
  } else {
    followersNum.innerText = '0 位追蹤者';
  }
  if (!followed.error) {
    followedNum.innerText = parseInt(followed.length+4).toString() + ' 位已追蹤';
  } else {
    followedNum.innerText = '0 位已追蹤';
  }  

  for (let i = 0; i < followers.length; i++) {
    const url = document.createElement('a');
    url.setAttribute('href', '/profile?streamerId='+followers[i].id);

    const userDiv = document.createElement('div');
    userDiv.setAttribute('class', 'user');

    const userImg = document.createElement('img');
    userImg.setAttribute('class', 'userImg');
    userImg.setAttribute('src', followers[i].picture);

    const userDesc = document.createElement('div');
    userDesc.setAttribute('class', 'userDesc');

    const userName = document.createElement('div');
    userName.setAttribute('class', 'userName');
    userName.innerText = followers[i].name;

    const userfollowTime = document.createElement('div');
    userfollowTime.setAttribute('class', 'userfollowTime');

    const currentTime = Date.parse((new Date()).toJSON()); 
    const followTime = currentTime - Date.parse(followersTime[i]);
    userfollowTime.innerText = secondsToDhms(followTime/1000) + ' 前追蹤';
    // userfollowTime.innerText = followTime;

    userDesc.appendChild(userName);
    userDesc.appendChild(userfollowTime);

    userDiv.appendChild(userImg);
    userDiv.appendChild(userDesc);

    url.appendChild(userDiv);
    followerDiv.appendChild(url);
  }

  for (let i = 0; i < followed.length; i++) {
    const url = document.createElement('a');
    url.setAttribute('href', '/profile?streamerId='+followed[i].id);

    const userDiv = document.createElement('div');
    userDiv.setAttribute('class', 'user');

    const userImg = document.createElement('img');
    userImg.setAttribute('class', 'userImg');
    userImg.setAttribute('src', followed[i].picture);

    const userDesc = document.createElement('div');
    userDesc.setAttribute('class', 'userDesc');

    const userName = document.createElement('div');
    userName.setAttribute('class', 'userName');
    userName.innerText = followed[i].name;

    const userfollowTime = document.createElement('div');
    userfollowTime.setAttribute('class', 'userfollowTime');

    const currentTime = Date.parse((new Date()).toJSON()); 
    const followTime = currentTime - Date.parse(followedTime[i]);
    userfollowTime.innerText = secondsToDhms(followTime/1000) + ' 前追蹤';
    // userfollowTime.innerText = followTime;

    userDesc.appendChild(userName);
    userDesc.appendChild(userfollowTime);

    userDiv.appendChild(userImg);
    userDiv.appendChild(userDesc);

    url.appendChild(userDiv);
    followedDiv.appendChild(url);
  }
};

const secondsToDhms = (seconds) => {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600*24));
  const h = Math.floor(seconds % (3600*24) / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d == 1 ? ' 天, ' : ' 天, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' 小時, ' : ' 小時, ') : '';
  // const mDisplay = m > 0 ? m + (m == 1 ? ' minute, ' : ' minutes, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' 分鐘, ' : ' 分鐘 ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' 秒' : ' 秒') : '';
  // return dDisplay + hDisplay + mDisplay + sDisplay;
  return dDisplay + hDisplay + mDisplay;
};

/**
 * Function to get payment details
 * @param {*} id
 */
function getPayment(id) {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
      const profileStripeRow = document.querySelector('.profileStripeRow');
      const payments = JSON.parse(request.response);
      console.log('Payments: ', payments);

      for (let i = 0; i < payments.paid.length; i++) {
        const div = createPaymentDiv(payments.paid[i].time_created, payments.paid[i].from_name, payments.paid[i].to_name, payments.paid[i].amount, payments.paid[i].message);
        profileStripeRow.appendChild(div);
      }

      for (let i = 0; i < payments.received.length; i++) {
        const div = createPaymentDiv(payments.received[i].time_created, payments[i].received.from_name, payments.received[i].to_name, payments.received[i].amount, payments.received[i].message);
        profileStripeRow.appendChild(div);
      }
    }
  };
  request.open('POST', '/payment/records/'+id);
  request.send();
};

/**
 * Function to create Payments DIV
 * @param {*} time
 * @param {*} from
 * @param {*} to
 * @param {*} amount
 * @param {*} message
 * @return {*} return Payments DIV
 */
function createPaymentDiv(time, from, to, amount, message) {
  const paymentDiv = document.createElement('div');
  paymentDiv.setAttribute('class', 'payment');

  const paymentTime = document.createElement('div');
  paymentTime.setAttribute('class', 'paymentTime');

  const timeEdit = time.substr(0, 10) + ' ' + time.substr(11, 12).substr(0,8);
  paymentTime.innerText = timeEdit;

  const paymentAmount = document.createElement('div');
  paymentAmount.setAttribute('class', 'paymentAmount');
  paymentAmount.innerText = 'NTD. ' + amount;

  const paymentFrom = document.createElement('div');
  paymentFrom.setAttribute('class', 'paymentFrom');
  paymentFrom.innerText = from;

  const paymentTo = document.createElement('div');
  paymentTo.setAttribute('class', 'paymentTo');
  paymentTo.innerText = to;

  const paymentMsg = document.createElement('div');
  paymentMsg.setAttribute('class', 'paymentMsg');
  paymentMsg.innerText = message;

  paymentDiv.appendChild(paymentTime);
  paymentDiv.appendChild(paymentAmount);
  paymentDiv.appendChild(paymentFrom);
  paymentDiv.appendChild(paymentTo);
  paymentDiv.appendChild(paymentMsg);

  return paymentDiv;
}