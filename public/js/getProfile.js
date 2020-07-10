// set global token, get token cookie from browser
let token = '';
if (document.cookie) {
  token = decodeURIComponent(document.cookie).split('=')[1];
  getProfile(token);
}

// set global user
let user = {};

/**
 *
 * @param {*} res AJAX respond from server
 */
function getUser(res) {
  user = {};
  user.name = res.name;
  user.email = res.email;
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
      console.log(res);
      if (!res.expiredAt) {
        getUser(res.data);

        // get show profile divs
        const loginformContent = document.getElementById('loginformContent');
        const profile = document.getElementById('profileformContent');
        const welcome = document.getElementById('welcome');
        const image = document.getElementById('image');
        const name = document.getElementById('name');
        const email = document.getElementById('email');

        loginformContent.setAttribute('class', 'hide');
        profile.setAttribute('class', '');
        welcome.textContent = `Welcome to Stylish`;
        image.src = res.data.picture;
        name.textContent = `Name: ${res.data.name}`;
        email.textContent = `Email: ${res.data.email}`;
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
      }
      return res.json();
    }).then((res) => {
      console.log(res);
      getUser(res.data.user);
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
      if (res.status === 403) {
        alert('Email already exist!');
      }
      return res.json();
    }).then((res) => {
      console.log(res);
      getUser(res.data.user);
      alert(`Signed up Successful`);
      window.location.reload();
    });
  } catch (err) {
    alert('Sign Up Failed!');
  }
};

/**
 * Function to sign out
 * Clear cookie and reload page
 */
function signOut() {
  // document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  deleteAllCookies();
  window.location.reload();
};

/**
 * Function to delete all cookies
 */
function deleteAllCookies() {
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
};
