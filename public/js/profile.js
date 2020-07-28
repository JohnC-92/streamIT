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
        // authorization: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiYSIsImlhdCI6MTU5NDYwOTM5MCwiZXhwIjoxNTk0NjEyOTkwfQ.m7nXwDjo4qqkJ02eJ6kj4bPbYTCv9MWevIAyJm_74bg',
      },
    }).then((res) => {
      return res.json();
    }).then((res) => {
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
        profileStreamType.value = res.data.streamType;

        // fetch VODS
        fetchVODs(res.data.name, res.data.streamKey, res.data.picture);
      } else {
        alert('Token Invalid, Please sign in again');
        signOut();
        window.location.replace('/index');
      }
    });
  } catch (err) {
    console.log(err);
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
    console.log(err)
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
      console.log(VODs);

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
  url.setAttribute('href', '/video?key='+key+'&room='+name+'&id='+vod.id);

  const img = document.createElement('img');
  img.setAttribute('class', 'thumbnails');
  img.setAttribute('src', vod.img_url);

  const spanTime = document.createElement('span');
  spanTime.setAttribute('class', 'streamTime');
  spanTime.innerText = '5分鐘前';

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
