/* -----Element selection and definition------- */

// form related and buttons
const loginForm = document.querySelector('.loginForm');
const loginCloseBtn = document.querySelector('.loginCloseBtn');
const signinTab = document.getElementById('signIn');
const signupTab = document.getElementById('signUp');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const signinBtn = document.querySelector('.signinDiv');
const signupBtn = document.querySelector('.signupDiv');
const showPass = document.querySelectorAll('.showPass');
const titleCh = document.querySelector('.titleCh');
const member = document.querySelector('.memberImg');

// set global token, get token cookie from browser
let token = '';
if (document.cookie) {
  const cookie = decodeURIComponent(document.cookie).split('access_token=')[1];
  if (cookie !== undefined) {
    token = cookie.split(';')[0];
    const signinText = document.querySelector('.signinText');
    signinText.innerText = '登出';
    signupBtn.style.display = 'none';
  };
}

// form related events
loginCloseBtn.addEventListener('click', () => {
  loginForm.style.display = 'none';
});

// switch sign in sign up tabs event listeners
signinTab.addEventListener('click', () => {
  active(signinTab, signupTab, signinForm, signupForm);
});

signupTab.addEventListener('click', () => {
  active(signupTab, signinTab, signupForm, signinForm);
});

signinBtn.addEventListener('click', () => {
  if (!token) {
    loginForm.style.display = 'block';
    active(signinTab, signupTab, signinForm, signupForm);
  } else {
    alert('成功登出');
    localStorage.clear();
    signOut();
    window.location.replace('/index');
  }
});

signupBtn.addEventListener('click', () => {
  loginForm.style.display = 'block';
  active(signupTab, signinTab, signupForm, signinForm);
});

for (let i = 0; i < showPass.length; i++) {
  showPass[i].addEventListener('click', () => {
    const input = showPass[i].parentElement.children[0];
    if (input.type === 'password') {
      input.type = 'text';
    } else {
      input.type = 'password';
    }
  });
}

member.addEventListener('click', () => {
  if (!document.cookie) {
    alert('Please sign in');
    loginForm.style.display = 'block';
  } else {
    window.location.replace('/profile');
  }
});

/* -----Elements function logic------- */

/**
 * Function to swap signin and signup tab class
 * and swap title text
 * @param {*} tab1
 * @param {*} tab2
 * @param {*} form1
 * @param {*} form2
  */
function active(tab1, tab2, form1, form2) {
  if (tab1.classList[0] !== 'active') {
    tab1.setAttribute('class', 'active');
    tab2.setAttribute('class', 'inactive');
    form1.setAttribute('class', '');
    form2.setAttribute('class', 'hide');
  }
  if (signinTab.classList[0] === 'active') {
    titleCh.innerText = '登入 ';
  } else {
    titleCh.innerText = '立刻加入 ';
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

/**
 * Function to sign In
 */
async function signIn() {
  try {
    data = {
      provider: 'native',
      email: document.getElementById('emailIn').value,
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
        alert('Invalid Email/Password!');
        throw err;
      }
      return res.json();
    }).then((res) => {
      console.log(res);
      alert(`Signed in Successful!`);
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
      alert(`Signed up Successful! \r\nTo continue with streaming, get stream key \r\nand edit stream title in profile page`);
      window.location.reload();
    });
  } catch (err) {
    console.log(err)
    alert('Sign Up Failed!');
  }
};


/**
 * Function to check if token cookie exist and save profile info to localstorage
 * @param {*} token access token given by server
 */
async function saveProfiletoLocal(token) {
  try {
    await fetch('/user/profile', {
      method: 'GET',
      headers: {
        authorization: token,
      },
    }).then((res) => {
      return res.json();
    }).then((res) => {
      if (!res.error) {
        const user = {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          image: res.data.picture,
          streamKey: res.data.streamKey,
          streamTitle: res.data.streamTitle,
          streamType: res.data.streamType,
        };
        localStorage.setItem('userInfo', JSON.stringify(user));
      }
    });
  } catch (err) {
    console.log(err);
  }
};

/**
 * Function to render sidebar
 */
function renderSidebar() {
  const request = new XMLHttpRequest();
  request.onreadystatechange = async function() {
    if (request.readyState === 4) {
      const sideBar = document.querySelector('.sideBar');
      if (JSON.parse(request.response).live) {
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
          const sideBarDiv = createSidebarDIV(keys[i], keyObj[keys[i]+'1'], keyObj[keys[i]+'2'], keyObj[keys[i]+'3'], keyObj[keys[i]+'4'], keyObj[keys[i]+'5']);
          sideBar.appendChild(sideBarDiv);
        }
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
 * @param {*} id
 * @return {*} return sidebar DIV
 */
function createSidebarDIV(key, name, title, picture, type, id) {
  const sideStream = document.createElement('div');
  if (type) {
    type = type.toLowerCase();
    sideStream.setAttribute('class', 'sideStream '+type);
  } else {
    sideStream.setAttribute('class', 'sideStream gaming');
  }

  const url = document.createElement('a');
  url.setAttribute('href', '/video?streamerId='+id+'&room='+name);

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