// // firebaseConfig.js
// import { initializeApp, getApps } from 'firebase/app';
// import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// const firebaseConfig = {
//     apiKey: "AIzaSyArdfgl2qO0Er1mamQVi6zUvjBrctU3BO4",
//     authDomain: "horas-f784f.firebaseapp.com",
//     projectId: "horas-f784f",
//     storageBucket: "horas-f784f.firebasestorage.app",
//     messagingSenderId: "193530406578",
//     appId: "1:193530406578:web:569abd4c7aefed12c00bab"
//   };

//   let app;
// if (!getApps().length) {
//   app = initializeApp(firebaseConfig);
// } else {
//   app = getApps()[0];
// }

// const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });
// const firestore = getFirestore(app);

// export { auth, firestore };

// firebaseConfig.js
// import firebase from 'firebase/compat/app';
// import 'firebase/compat/auth';
// import 'firebase/compat/firestore';


// // Configuración de Firebase
// const firebaseConfig = {
//   apiKey: 'AIzaSyArdfgl2qO0Er1mamQVi6zUvjBrctU3BO4',
//   authDomain: 'horas-f784f.firebaseapp.com',
//   projectId: 'horas-f784f',
//   storageBucket: 'horas-f784f.firebasestorage.app',
//   messagingSenderId: '193530406578',
//   appId: '1:193530406578:web:569abd4c7aefed12c00bab',
// };

// // Inicializar app si no está ya inicializada
// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }

// const auth = firebase.auth();
// const firestore = firebase.firestore();

// export { firebase, auth, firestore };
// firebaseConfig.js
// firebaseConfig.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔥 Tu configuración
const firebaseConfig = {
  apiKey: "AIzaSyArdfgl2qO0Er1mamQVi6zUvjBrctU3BO4",
  authDomain: "horas-f784f.firebaseapp.com",
  projectId: "horas-f784f",
  storageBucket: "horas-f784f.firebasestorage.app",
  messagingSenderId: "193530406578",
  appId: "1:193530406578:web:569abd4c7aefed12c00bab",
};

// ✅ Evita reinicializar la app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Evita reinicializar Auth y asegura persistencia
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  auth = getAuth(app);
}

// Firestore
const firestore = getFirestore(app);

export { auth, firestore };
