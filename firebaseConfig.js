// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyD2q5IkfWKU5-5k6tAU_RV5_ab5IHI2IzI",
    authDomain: "litchfield-explorer.firebaseapp.com",
    projectId: "litchfield-explorer",
    storageBucket: "litchfield-explorer.appspot.com",
    messagingSenderId: "63508462162",
    appId: "1:63508462162:web:e6562f692ef9475ceefd8b",
    measurementId: "G-QVMEDFWTPS"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log('Firestore loaded successfully');

let auth;
try {
    auth = getAuth(app);
} catch (e) {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
}

export { auth, db, app };