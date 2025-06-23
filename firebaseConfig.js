import NetInfo from '@react-native-community/netinfo';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyD2q5IkfWKU5-5k6tAU_RV5_ab5IHI2IzI",
    authDomain: "litchfield-explorer.firebaseapp.com",
    projectId: "litchfield-explorer",
    storageBucket: "litchfield-explorer.appspot.com",
    messagingSenderId: "63508462162",
    appId: "1:63508462162:web:e6562f692ef9475ceefd8b",
    measurementId: "G-QVMEDFWTPS"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

console.log('Firebase app initialized:', app.name);

const auth = getAuth(app);

const db = getFirestore(app);

async function isFirebaseReady() {
    try {
        const state = await NetInfo.fetch();
        console.log('Network state:', state);
        if (!state.isConnected) {
            console.log('No network connection.');
            return false;
        }
        const quickInfoCol = collection(db, 'quickInfo');
        const snapshot = await getDocs(quickInfoCol);
        console.log('Snapshot empty:', snapshot.empty);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking Firebase readiness:', error);
        return false;
    }
}

export { app, auth, db, isFirebaseReady };