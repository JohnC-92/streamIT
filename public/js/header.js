/* -----Element selection and definition------- */

// set global token, get token cookie from browser
let token = '';
if (document.cookie) {
  const cookie = decodeURIComponent(document.cookie).split('access_token=')[1];
  if (cookie !== undefined) {
    token = cookie.split(';')[0];
    const signinText = document.querySelector('.signinText');
    signinText.innerText = '登出';
  };
}

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
    signOut();
    alert('成功登出')
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

