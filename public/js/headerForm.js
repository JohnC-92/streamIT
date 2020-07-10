/* -----Element selection and definition------- */

// form related and buttons
const loginForm = document.querySelector('.loginForm');
const loginCloseBtn = document.querySelector('.loginCloseBtn');
const signinTab = document.getElementById('signIn');
const signupTab = document.getElementById('signUp');
const signinForm = document.getElementById('signinForm');
const signupForm = document.getElementById('signupForm');
const showPass = document.querySelectorAll('.showPass');

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

/* -----Elements function logic------- */

/**
 * Function to swap signin and signup tab class
 * @param {*} tab1
 * @param {*} tab2
 * @param {*} form1
 * @param {*} form2
 */
function active(tab1, tab2, form1, form2) {
  if (tab1.classList[0] !== 'active') {
    tab1.setAttribute('class', 'active');
    tab2.setAttribute('class', 'inactive underlineHover');
    form1.setAttribute('class', '');
    form2.setAttribute('class', 'hide');
  }
}
