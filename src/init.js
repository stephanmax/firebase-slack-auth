import firebase from 'firebase/app'

const config = {
  apiKey: 'AIzaSyBtwjPlXIU2xPRkHn6_6tVCjRVu1XdvP0Y',
  authDomain: 'nbgapp-2a44e.firebaseapp.com',
  databaseURL: 'https://nbgapp-2a44e.firebaseio.com',
  projectId: 'nbgapp-2a44e',
  storageBucket: 'nbgapp-2a44e.appspot.com',
  messagingSenderId: '1084553532334'
}

firebase.initializeApp(config)

export default firebase
