// firebaseConfig.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyArdfgl2qO0Er1mamQVi6zUvjBrctU3BO4",
    authDomain: "horas-f784f.firebaseapp.com",
    projectId: "horas-f784f",
    storageBucket: "horas-f784f.firebasestorage.app",
    messagingSenderId: "193530406578",
    appId: "1:193530406578:web:569abd4c7aefed12c00bab"
  };

  let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const firestore = getFirestore(app);

export { auth, firestore };