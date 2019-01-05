const FirebaseAdmin = require('firebase-admin')
const FirebaseFunctions = require('firebase-functions')

const serviceAccount = require('./service-account.json')

const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG)
adminConfig.credential = FirebaseAdmin.credential.cert(serviceAccount)

FirebaseAdmin.initializeApp(adminConfig)

function slackOAuth2Client() {
  const credentials = {
    client: {
      id: FirebaseFunctions.config().slack.client.id,
      secret: FirebaseFunctions.config().slack.client.secret
    },
    auth: {
      tokenHost: 'https://slack.com',
      tokenPath: '/api/oauth.access'
    }
  }

  return require('simple-oauth2').create(credentials)
}

async function upsertFirebaseAccount(accessToken, slackUserID, userName, profilePic) {
  const uid = `slack:${slackUserID}`
  
  const databaseTask = FirebaseAdmin.database().ref(`/slackAccessToken/${uid}`).set(accessToken)
  
  const userCreationTask = FirebaseAdmin.auth().updateUser(uid, {
    displayName: userName,
    photoURL: profilePic
  }).catch((error) => {
    if (error.code === 'auth/user-not-found') {
      return FirebaseAdmin.auth().createUser({
        uid: uid,
        displayName: userName,
        photoURL: profilePic
      })
    }
    throw error
  })

  await Promise.all([userCreationTask, databaseTask])
  return await FirebaseAdmin.auth().createCustomToken(uid)
}

exports.login = FirebaseFunctions.https.onRequest(async (request, reply) => {
  const results = await slackOAuth2Client().authorizationCode.getToken({
    code: request.query.code,
    redirect_uri: 'http://localhost:5000/login'
  })

  const firebaseToken = await upsertFirebaseAccount(results.access_token, results.user.id, results.user.name, results.user.image_512)

  reply.send(`
    <script src="/__/firebase/5.5.5/firebase-app.js"></script>
    <script src="/__/firebase/5.5.5/firebase-auth.js"></script>
    <script src="/__/firebase/init.js"></script>
    <script>
      firebase.auth().signInWithCustomToken('${firebaseToken}').then(function() {
        window.close()
      })
    </script>
  `)
})
