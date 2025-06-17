import { getDoc, getDocs, collection, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { db } from '@/firebaseConfig';

/**
 * Fetches user data from Firestore or from AsyncStorage if offline.
 */
export const getUserData = async (userId) => {
    if (!userId) return null;
    try {
        const isConnected = (await NetInfo.fetch()).isConnected;
        if (isConnected) {
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = { id: userDocSnap.id, ...userDocSnap.data() };
                await AsyncStorage.setItem('userProfileData', JSON.stringify(userData));
                return userData;
            }
        }
        const cached = await AsyncStorage.getItem('userProfileData');
        return cached ? JSON.parse(cached) : null;
    } catch {
        const cached = await AsyncStorage.getItem('userProfileData');
        return cached ? JSON.parse(cached) : null;
    }
};

/**
 * Runs only once if online to prime data.
 */
export const fetchInitialData = async () => {
    const isConnected = (await NetInfo.fetch()).isConnected;
    const firstLaunch = await AsyncStorage.getItem('hasLaunched');
    if (!firstLaunch && isConnected) {
        await downloadAndCacheData();
        await AsyncStorage.setItem('hasLaunched', 'true');
    }
};

/**
 * Downloads all collections and images, then saves the lastUpdate.
 */
export const downloadAndCacheData = async () => {
    const cacheCollection = async (collectionName, folder = '') => {
        try {
            const snapshot = await getDocs(collection(db, collectionName));
            const data = [];
            console.log(`Caching collection: ${collectionName}`);

            for (const docSnap of snapshot.docs) {
                const item = docSnap.data();
                let imagePath = null;
                if (item.imageUrl) {
                    imagePath = await downloadImage(item.imageUrl, `${folder}_${docSnap.id}`);
                }
                data.push({ id: docSnap.id, ...item, imagePath });
            }

            await AsyncStorage.setItem(`${collectionName}Data`, JSON.stringify(data));
            console.log(`✅ Cached ${collectionName}`);
            return true;
        } catch (e) {
            console.error(`❌ Error caching ${collectionName}:`, e);
            return false; // safe fallback
        }
    };

    // Cache these collections in parallel
    const tasks = [
        cacheCollection('attractions', 'attractions'),
        cacheCollection('keywords'),
        cacheCollection('products', 'products'),
        cacheCollection('quickInfo'),
        cacheCollection('rewards'),
        cacheCollection('users', 'profile_pics'),
    ];

    // Use Promise.allSettled to avoid hanging
    await Promise.allSettled(tasks);

    // ✅ AFTER caching, fetch and store lastUpdate
    const configSnap = await getDoc(doc(db, 'config', 'global'));
    if (configSnap.exists()) {
        const lastUpdateTimestamp = configSnap.data().lastUpdate;
        if (lastUpdateTimestamp) {
            const lastUpdateISO = lastUpdateTimestamp.toDate().toISOString();
            await AsyncStorage.setItem('lastUpdate', lastUpdateISO);
            console.log('Updated local lastUpdate:', lastUpdateISO);
        }
    }
};

/**
 * Loads cached attractions.
 */
export const getCachedAttractions = async () => {
    const json = await AsyncStorage.getItem('attractionsData');
    return json ? JSON.parse(json) : [];
};

export const getCachedProducts = async () => {
    const json = await AsyncStorage.getItem('productsData');
    return json ? JSON.parse(json) : [];
};

export const getCachedQuickInfo = async () => {
    const json = await AsyncStorage.getItem('quickInfoData');
    return json ? JSON.parse(json) : [];
};

export const getCachedRewards = async () => {
    const json = await AsyncStorage.getItem('rewardsData');
    return json ? JSON.parse(json) : [];
};

export const getCachedKeywords = async () => {
    const json = await AsyncStorage.getItem('keywordsData');
    return json ? JSON.parse(json) : [];
};

export const getCachedUsers = async () => {
    const json = await AsyncStorage.getItem('usersData');
    return json ? JSON.parse(json) : [];
};

/**
 * Downloads and saves an image locally.
 */
const downloadImage = async (uri, name) => {
    const fileUri = `${FileSystem.documentDirectory}${name}.jpg`;
    try {
        const download = FileSystem.downloadAsync(uri, fileUri);
        const result = await Promise.race([
            download,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Download timeout')), 10000)
            ),
        ]);
        return result.uri;
    } catch (e) {
        console.warn(`Image download failed or timed out: ${uri}`);
        return uri; // fallback to original URL
    }
};

/**
 * Debug helper to log what’s cached.
 */
export const logCachedData = async () => {
    const keys = [
        'attractionsData',
        'quickInfoData',
        'usersData',
        'productsData',
        'keywordsData',
        'rewardsData',
        'lastUpdate'
    ];
    for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`${key}: ${value ? '✅' : '❌'}`);
    }
};