import 'firebase/auth'

import firebase from './init'

const button = document.querySelector('button')
const profile = document.querySelector('figure')
const profilePic = document.querySelector('img')
const profileTitle = document.querySelector('figcaption')

const signIn = () => window.open(
  'https://slack.com/oauth/authorize?scope=identity.basic,identity.avatar&client_id=14747090598.270361633905&redirect_uri=http%3A%2F%2Flocalhost%3A5000%2Flogin',
  'Login with Slack',
  'height=500,width=400'
)

const signOut = () => firebase.auth().signOut()

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    button.removeEventListener('click', signIn)
    button.addEventListener('click', signOut)
    button.textContent = 'Logout'
    profileTitle.innerText = user.displayName
    profilePic.src = user.photoURL
    profile.style.display = 'block'
  }
  else {
    button.removeEventListener('click', signOut)
    button.addEventListener('click', signIn)
    button.textContent = 'Login with Slack'
    profile.style.display = 'none'
  }
})
