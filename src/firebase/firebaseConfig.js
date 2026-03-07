import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const requiredFirebaseKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]

const missingKeys = requiredFirebaseKeys.filter((key) => !firebaseConfig[key])
const isFirebaseConfigured = missingKeys.length === 0

let app = null
let auth = null
let provider = null
let db = null
let firebaseInitError = null

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    provider = new GoogleAuthProvider()
    db = getFirestore(app)
  } catch (error) {
    firebaseInitError = error
    app = null
    auth = null
    provider = null
    db = null
    console.error('Firebase failed to initialize. Verify .env values and Firebase project settings.', error)
  }
} else {
  console.warn(
    `Firebase configuration is incomplete. Missing: ${missingKeys.join(', ')}. ` +
      'Set VITE_FIREBASE_* variables in root .env file.'
  )
}

export { auth, provider, db, isFirebaseConfigured, firebaseInitError }
