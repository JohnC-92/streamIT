const profileImgBtn = document.querySelector('.profileImg-Btn');
const profileImgInputBtn = document.getElementById('profileImg-InputBtn');
const profileImgSubmitBtn = document.getElementById('profileImg-SubmitBtn');
const profileForm = document.querySelector('.profileForm');
const profileUpdateBtn = document.querySelector('.profileInfo-Btn');
const deleteAccountBtn = document.querySelector('.deleteAccount');

// const profileStripeTab = document.querySelector('.profileStripe');

// Get all profile tabs and profile divs
const profileTabs = document.querySelectorAll('.profileTab');
const profileDivs = document.querySelectorAll('.profileDivs');

// Get payment select HTML div
const paymentSelect = document.querySelector('.paymentSelect');

// Add show payments logic to select HTML
paymentSelect.addEventListener('change', (e) => {
  const receivedDivs = document.querySelectorAll('.received');
  const paidDivs = document.querySelectorAll('.paid');

  // Case received payments from others
  if (e.target.selectedIndex === 0) {
    for (let i = 0; i < receivedDivs.length; i++) {
      receivedDivs[i].classList.remove('hide');
    }
    for (let i = 0; i < paidDivs.length; i++) {
      paidDivs[i].classList.add('hide');
    }
  } else if (e.target.selectedIndex === 1) {
  // Case paid payments to others
    for (let i = 0; i < receivedDivs.length; i++) {
      receivedDivs[i].classList.add('hide');
    }
    for (let i = 0; i < paidDivs.length; i++) {
      paidDivs[i].classList.remove('hide');
    }
  }
});

// Add profile tabs logic to highlight color and show tab div
for (let i = 0; i < profileTabs.length; i++) {
  profileTabs[i].addEventListener('click', () => {
    // Add and remove profile highlighting for tabs
    for (let j = 0; j < profileTabs.length; j++) {
      if (i !== j) {
        profileTabs[j].classList.remove('profileActive');
      } else {
        profileTabs[j].classList.add('profileActive');
      }
    }

    // Show and hide profile tab's div
    for (let j = 0; j < profileDivs.length; j++) {
      if (i !== j) {
        profileDivs[j].classList.add('hide');
      } else {
        profileDivs[j].classList.remove('hide');
      }
    }
  });
}

// Update profile image related button
profileImgBtn.addEventListener('click', () => {
  profileImgInputBtn.click();
});

// Prevent original form from submitting
profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  updateProfileImage();
});

// Update profile image logic
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

// Profile page rendering logic //
const streamerId = window.location.href.split('streamerId=')[1];

// Show profile tabs without payment tab
for (let i = 0; i < 3; i++) {
  profileTabs[i].classList.remove('hide');
}

// Rendering with token
if (token) {
  // Visitor view of streamer profile
  if (streamerId !== undefined) {
    if (JSON.parse(localStorage.getItem('userInfo')).id === parseInt(streamerId)) {
      profileTabs[3].classList.remove('hide');
      getProfile(token);
    } else {
      getStreamerProfile(streamerId);
    }
  } else {
  // Streamer's view of own profile
    profileTabs[3].classList.remove('hide');
    getProfile(token);
  }
} else if (streamerId !== undefined) {
// Rendering without token
  profileTabs[3].classList.remove('hide');
  getStreamerProfile(streamerId);
} else {
// Page undefined error
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
      // console.log('ProfileInfo: ', res);
      if (!res.error) {
        // Fill in all the profile info
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
        profileStreamTitle.value = res.data.streamTitle || `Welcome to ${res.data.name}'s stream`;
        profileStreamType.value = res.data.streamType || `Gaming`;

        // Fetch VODS and add VODS divs
        fetchVODs(res.data.id, res.data.name, res.data.streamKey, res.data.picture);

        // Add followers/followed div
        createFollowDIV(res.data.followers, res.data.followersTime, res.data.followed, res.data.followedTime);

        // Add payment div
        getPayment(res.data.id);
      } else {
        alert('Token Expired/Invalid, Please sign in again');
        signOut();
        window.location.replace('/');
      }
    });
  } catch (err) {
    // console.log(err);
  }
};

/**
 * Function to get streamer profile info
 * @param {*} streamerId streamerId is provided when landing on profile page
 */
async function getStreamerProfile(streamerId) {
  try {
    await fetch('/user/keys/'+streamerId, {
      method: 'GET',
    }).then((res) => {
      // console.log('GetStreamerProfile: ', res);
      return res.json();
    }).then((res) => {
      const data = res.data;
      if (!res.error) {
        // Fill in the profile info and leave out some sensitive info
        const image = document.querySelector('.profileImg-Img');
        const name = document.querySelector('.profileName');
        const email = document.querySelector('.profileEmail');
        const streamKey = document.querySelector('.profileKey');
        const profileStreamTitle = document.querySelector('.profileStreamTitle');
        const profileStreamType = document.querySelector('.profileStreamType');

        image.src = data.picture;
        name.value = data.name;
        email.value = 'Not viewable';
        streamKey.value = 'Not viewable';
        profileStreamTitle.value = data.streamTitle || `Welcome to ${data.name}'s stream`;
        profileStreamType.value = data.streamType || `Gaming`;

        // // Hide payment tab
        // profileStripeTab.style.display = 'none';

        // Hide buttons
        const profileImgDesc = document.querySelector('.profileImg-Desc');
        const profileNote = document.querySelector('.profileNote');
        profileImgDesc.style.display = 'none';
        profileNote.style.display = 'none';
        profileUpdateBtn.style.display = 'none';

        // Hide delete account div
        const profileDeleteAcc = document.querySelector('.profileDeleteAcc');
        const profileDeleteAccDiv = document.querySelector('.profileDeleteAccDiv');
        profileDeleteAcc.style.display = 'none';
        profileDeleteAccDiv.style.display = 'none';

        // Make profile infos read only
        document.querySelector('.profileName').readOnly = true;
        document.querySelector('.profileStreamTitle').readOnly = true;
        document.querySelector('.profileStreamType').readOnly = true;

        // Fetch VODS and add VODs div
        fetchVODs(data.id, data.name, data.streamKey, data.picture);

        // Add followers/followed div
        createFollowDIV(data.followers, data.followersTime, data.followed, data.followedTime);
      } else {
        alert('Token Expired/Invalid, Please sign in again');
        signOut();
        window.location.replace('/');
      }
    });
  } catch (err) {
    // console.log(err);
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

    // Must fill in stream type when updating for the first time
    if (data.streamType === '') {
      alert('Please choose a stream type');
      return;
    }

    // Post updated data to server
    await fetch('/user/profile', {
      method: 'PUT',
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
    // console.log(err);
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
  XHR.open('PUT', '/user/img');

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

    // Ask user to confirm account deletion to prevent misdeletion
    if (confirm('Are you sure you want to delete your account?')) {
      await fetch('/user/profile', {
        method: 'DELETE',
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
        window.location.replace('/');
      });
    }
  } catch (err) {
    // console.log(err);
    alert('Delete Profile Failed!');
  }
}

/**
 * Function to get all VODs
 * @param {*} streamerId
 * @param {*} streamerName
 * @param {*} streamerKey
 * @param {*} streamerPicture
 */
function fetchVODs(streamerId, streamerName, streamerKey, streamerPicture) {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
      const profileVideoContainer = document.querySelector('.profileVideoRow');
      const VODs = JSON.parse(request.response);
      // console.log('VODS: ', VODs);

      // Remind users when there are no VODs
      if (VODs.length === 0) {
        const noProfileVod = document.createElement('div');
        noProfileVod.setAttribute('class', 'noProfileVod');
        noProfileVod.innerText = '尚未有任何歷史影片記錄';
        profileVideoContainer.appendChild(noProfileVod);
      } else {
      // Render VODs div when there are VODs
        for (let i = 0; i < VODs.length; i++) {
          const div = createVodDIV(streamerId, streamerName, streamerKey, VODs[i], streamerPicture);
          profileVideoContainer.appendChild(div);
        }
      }
    }
  };
  request.open('GET', '/vods/'+streamerKey);
  request.send();
}

/**
 * Function to create VODs DIV
 * @param {*} streamerId
 * @param {*} name
 * @param {*} key
 * @param {*} vod
 * @param {*} picture
 * @return {*} return VODs DIV
 */
function createVodDIV(streamerId, name, key, vod, picture) {
  const profileVod = document.createElement('div');
  profileVod.setAttribute('class', 'profileVod');

  const streamThumbnail = document.createElement('div');
  streamThumbnail.setAttribute('class', 'streamThumbnail');

  const url = document.createElement('a');
  url.setAttribute('href', '/video?room='+name+'&streamerId='+streamerId+'&id='+vod.id);

  const img = document.createElement('img');
  img.setAttribute('class', 'thumbnails');
  img.setAttribute('src', vod.img_url);

  const spanTime = document.createElement('span');
  spanTime.setAttribute('class', 'streamTime');
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
  streamTitle.innerText = vod.stream_title || 'Welcome to ' + name + `'s stream`;

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

  // Server will return error when there are no followers or no one followed
  // If there are followers, count followers
  if (followers.length > 0) {
    followersNum.innerText = parseInt(followers.length).toString() + ' 位追蹤者';
  } else {
    // If there no followers, show 0 and remind users there no followers
    followersNum.innerText = '0 位追蹤者';

    const noProfileFollower = document.createElement('div');
    noProfileFollower.setAttribute('class', 'noProfileFollower');
    noProfileFollower.innerHTML = '尚未有任何人追蹤你';
    followerDiv.appendChild(noProfileFollower);
  }

  // If there are followed streamers, count followed streamers
  if (followed.length > 0) {
    followedNum.innerText = parseInt(followed.length).toString() + ' 位已追蹤';
  } else {
    // If there no followed streamers, show 0 and remind users there no followed
    followedNum.innerText = '0 位已追蹤';

    const noProfileFollowed = document.createElement('div');
    noProfileFollowed.setAttribute('class', 'noProfileFollowed');
    noProfileFollowed.innerHTML = '尚未追蹤任何人';
    followedDiv.appendChild(noProfileFollowed);
  };

  // Create followers DIV
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

    userDesc.appendChild(userName);
    userDesc.appendChild(userfollowTime);

    userDiv.appendChild(userImg);
    userDiv.appendChild(userDesc);

    url.appendChild(userDiv);
    followerDiv.appendChild(url);
  }

  // Create followed DIV
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

    userDesc.appendChild(userName);
    userDesc.appendChild(userfollowTime);

    userDiv.appendChild(userImg);
    userDiv.appendChild(userDesc);

    url.appendChild(userDiv);
    followedDiv.appendChild(url);
  }
};

// Function to convert seconds to days, hours, minutes and seconds
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
  return dDisplay + hDisplay + mDisplay + sDisplay;
  // return dDisplay + hDisplay + mDisplay;
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
      // console.log('Payments: ', payments);

      // Remind users if there are no payments record
      if (payments.paid.length+payments.received.length === 0) {
        const noProfilePayment = document.createElement('div');
        noProfilePayment.setAttribute('class', 'noProfilePayment');
        noProfilePayment.innerText = '尚未有任何交易記錄';
        profileStripeRow.appendChild(noProfilePayment);
      }

      // Create payments made DIVs
      for (let i = 0; i < payments.paid.length; i++) {
        const div = createPaymentDiv(payments.paid[i].time_created, payments.paid[i].from_name, payments.paid[i].to_name, payments.paid[i].amount, payments.paid[i].message, false);
        profileStripeRow.appendChild(div);
      }

      // Create payments received DIVs
      for (let i = 0; i < payments.received.length; i++) {
        const div = createPaymentDiv(payments.received[i].time_created, payments.received[i].from_name, payments.received[i].to_name, payments.received[i].amount, payments.received[i].message, true);
        profileStripeRow.appendChild(div);
      }
    }
  };
  request.open('GET', '/payment/records?id='+id);
  request.send();
};

/**
 * Function to create Payments DIV
 * @param {*} time
 * @param {*} from
 * @param {*} to
 * @param {*} amount
 * @param {*} message
 * @param {*} received
 * @return {*} return Payments DIV
 */
function createPaymentDiv(time, from, to, amount, message, received) {
  const paymentDiv = document.createElement('div');
  if (received === true) {
    paymentDiv.setAttribute('class', 'payment received');
  } else {
    paymentDiv.setAttribute('class', 'payment paid hide');
  }

  const paymentTime = document.createElement('div');
  paymentTime.setAttribute('class', 'paymentTime');

  const timeEdit = time.substr(0, 10) + '\n' + time.substr(11, 12).substr(0,8);
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
