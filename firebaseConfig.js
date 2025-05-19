import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
    getAuth,
    initializeAuth,
    getReactNativePersistence,
} from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyD2q5IkfWKU5-5k6tAU_RV5_ab5IHI2IzI",
    authDomain: "litchfield-explorer.firebaseapp.com",
    projectId: "litchfield-explorer",
    storageBucket: "litchfield-explorer.appspot.com",
    messagingSenderId: "63508462162",
    appId: "1:63508462162:web:e6562f692ef9475ceefd8b",
    measurementId: "G-QVMEDFWTPS"
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };