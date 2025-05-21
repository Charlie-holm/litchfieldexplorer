import { getDoc, getDocs, collection, doc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';
import { db } from '@/firebaseConfig';
/**
 * Fetches user data from Firestore or from AsyncStorage if offline.
 * @param {string} userId The user's Firestore document ID.
 * @returns {Promise<object|null>} The user data object or null if not found.
 */
export const getUserData = async (userId) => {
    if (!userId) return null;
    try {
        const isConnected = (await NetInfo.fetch()).isConnected;
        if (isConnected) {
            // Try to fetch from Firestore
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = { id: userDocSnap.id, ...userDocSnap.data() };
                // Save to cache for offline use
                await AsyncStorage.setItem('userProfileData', JSON.stringify(userData));
                return userData;
            }
        }
        // If offline or Firestore fetch fails, try cache
        const cached = await AsyncStorage.getItem('userProfileData');
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        // On any error, fallback to cache
        const cached = await AsyncStorage.getItem('userProfileData');
        return cached ? JSON.parse(cached) : null;
    }
};


export const fetchInitialData = async () => {
    const isConnected = (await NetInfo.fetch()).isConnected;

    const firstLaunch = await AsyncStorage.getItem('hasLaunched');
    if (!firstLaunch && isConnected) {
        await downloadAndCacheData();
        await AsyncStorage.setItem('hasLaunched', 'true');
    }
};

export const downloadAndCacheData = async () => {
    const cacheCollection = async (collectionName, folder = '') => {
        try {
            const snapshot = await getDocs(collection(db, collectionName));
            const data = [];

            console.log(`Starting to cache collection: ${collectionName}`);
            const existingCache = await AsyncStorage.getItem(`${collectionName}Data`);
            console.log(`Existing cache for ${collectionName}:`, existingCache ? JSON.parse(existingCache) : null);

            for (const doc of snapshot.docs) {
                const item = doc.data();
                console.log(`Processing item with id ${doc.id} in collection ${collectionName}`, item);
                let imagePath = null;

                if (item.imageUrl) {
                    console.log(`Downloading image for item ${doc.id} from URL: ${item.imageUrl}`);
                    imagePath = await downloadImage(item.imageUrl, `${folder}_${doc.id}`);
                    if (imagePath === item.imageUrl) {
                        console.log(`Image download failed or fallback used for item ${doc.id}, using original URL.`);
                    } else {
                        console.log(`Image downloaded and cached at ${imagePath} for item ${doc.id}`);
                    }
                }

                data.push({ id: doc.id, ...item, imagePath });
            }

            await AsyncStorage.setItem(`${collectionName}Data`, JSON.stringify(data));
            console.log(`Finished caching collection: ${collectionName}. Cached ${data.length} items.`);
            return true;
        } catch {
            return null;
        }
    };

    const cachePromises = [
        cacheCollection('attractions', 'attractions'),
        cacheCollection('quickInfo'),
        cacheCollection('users', 'profile_pics'),
    ].filter(Boolean);

    await Promise.all(cachePromises);
};

export const getCachedAttractions = async () => {
    const json = await AsyncStorage.getItem('attractionsData');
    return json ? JSON.parse(json) : [];
};

const downloadImage = async (uri, name) => {
    const fileUri = `${FileSystem.documentDirectory}${name}.jpg`;
    try {
        await FileSystem.downloadAsync(uri, fileUri);
        return fileUri;
    } catch {
        return uri;
    }
};

export const logCachedData = async () => {
    const keys = [
        'attractionsData',
        'quickInfoData',
        'usersData',
    ];
    for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`Cache for ${key}:`, value ? JSON.parse(value) : null);
    }
};