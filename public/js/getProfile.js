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
        const profileImgName = document.getElementById('profileImg-Username');
        const email = document.querySelector('.profileEmail');
        const streamKey = document.querySelector('.profileKey');
        const profileStreamTitle = document.querySelector('.profileStreamTitle');

        image.src = res.data.picture;
        name.value = res.data.name;
        profileImgName.value = res.data.name;
        email.value = res.data.email;
        streamKey.value = res.data.streamKey;
        profileStreamTitle.value = res.data.streamTitle || `Welcome to ${res.data.name}'s world`;
      } else {
        alert('Token Invalid, Please sign in again');
        signOut();
      }
    });
  } catch (err) {
    console.log(err);
  }
};


/**
 * Function to sign In
 */
async function signIn() {
  try {
    data = {
      provider: 'native',
      name: document.getElementById('nameIn').value,
      password: document.getElementById('passwordIn').value,
    };

    await fetch('/user/signin', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      if (res.status === 403) {
        alert('Invalid User/Password!');
        throw err;
      }
      return res.json();
    }).then((res) => {
      console.log(res);
      alert(`Signed in Successful`);
      window.location.reload();
    });
  } catch (err) {
    alert('Sign In Failed!');
  }
};

/**
 * Function to sign Up
 */
async function signUp() {
  try {
    if (document.getElementById('passwordUp').value !== document.getElementById('passwordUp2').value) {
      alert('Password does not match, please check again');
      return false;
    }

    data = {
      name: document.getElementById('nameUp').value,
      email: document.getElementById('emailUp').value,
      password: document.getElementById('passwordUp').value,
    };

    await fetch('/user/signup', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      return res.json();
    }).then((res) => {
      console.log(res)
      if (res.error) {
        alert(res.error);
        return;
      }
      alert(`Signed up Successful`);
      window.location.reload();
    });
  } catch (err) {
    console.log(err)
    alert('Sign Up Failed!');
  }
};

/**
 * Function to update profile
 */
async function updateProfile() {
  try {
    data = {
      name: document.querySelector('.profileName').value,
      streamTitle: document.querySelector('.profileStreamTitle').value,
    };

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
      alert(`Update Successful`);
      window.location.reload();
    });
  } catch (err) {
    console.log(err)
    alert('Update Failed!');
  }
};

