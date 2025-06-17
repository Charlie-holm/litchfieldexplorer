import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Overlay } from "./Overlay";
import { auth, isFirebaseReady, db } from '@/firebaseConfig';
import { downloadAndCacheData } from '@/context/dataCache';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

export default function App() {
    const qrLock = useRef(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [needsDownload, setNeedsDownload] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [firebaseAvailable, setFirebaseAvailable] = useState(false);
    const isLoggedIn = auth.currentUser !== null;

    // 🔑 Fetch lastUpdate from Firestore 'lastupdate/lastupdate'
    const getServerLastUpdate = async () => {
        const snapshot = await getDoc(doc(db, 'lastupdate', 'lastupdate'));
        return snapshot.exists() ? snapshot.data().updatedAt : null;
    };

    useEffect(() => {
        let retryCount = 0;
        let cancelled = false;
        const maxRetries = 5;
        const retryDelay = 2000;

        const checkFirebase = async () => {
            const ready = await isFirebaseReady();
            console.log(`Firebase readiness: ${ready}`);
            if (ready) {
                if (!cancelled) setFirebaseAvailable(true);
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(checkFirebase, retryDelay);
            }
        };

        const checkLastUpdate = async () => {
            const localLastUpdate = await AsyncStorage.getItem('lastUpdate');
            const serverLastUpdate = await getServerLastUpdate();
            console.log('Local lastUpdate:', localLastUpdate);
            console.log('Server lastUpdate:', serverLastUpdate);

            if (!serverLastUpdate) {
                console.warn('No server lastUpdate found.');
                setNeedsDownload(true); // safe fallback
                return;
            }

            if (!localLastUpdate || new Date(localLastUpdate) < new Date(serverLastUpdate)) {
                console.log('Local data missing or stale — needs download');
                setNeedsDownload(true);
            } else {
                console.log('Local data is up to date.');
                setNeedsDownload(false);
            }
        };

        checkFirebase();
        checkLastUpdate();

        return () => { cancelled = true; };
    }, []);

    const handleScannedData = async (data) => {
        if (!data || qrLock.current) return;
        qrLock.current = true;

        if (data === 'Litchfield') {
            if (needsDownload) {
                Alert.alert(
                    "Download Litchfield Explorer?",
                    "",
                    [
                        {
                            text: "No",
                            onPress: () => { qrLock.current = false; },
                            style: "cancel"
                        },
                        {
                            text: "Yes",
                            onPress: async () => {
                                try {
                                    if (!firebaseAvailable) {
                                        Alert.alert("Connection Error", "Please try again later.");
                                        qrLock.current = false;
                                        return;
                                    }
                                    setLoading(true);
                                    setLoadingText('Downloading...');
                                    await downloadAndCacheData();

                                    const serverLastUpdate = await getServerLastUpdate();
                                    if (serverLastUpdate) {
                                        let iso;
                                        try {
                                            iso = serverLastUpdate.toDate ? serverLastUpdate.toDate().toISOString() : serverLastUpdate;
                                        } catch (e) {
                                            console.error('Failed to convert lastUpdate timestamp:', e, serverLastUpdate);
                                            iso = new Date().toISOString();
                                        }
                                        await AsyncStorage.setItem('lastUpdate', iso);
                                        console.log('Saved lastUpdate locally:', iso);
                                    } else {
                                        console.warn('No server lastUpdate found.');
                                    }

                                    setLoadingText('Download complete!');
                                    setLoading(false);
                                    setNeedsDownload(false);
                                    qrLock.current = false;
                                    router.replace('/(auth)');
                                } catch (error) {
                                    setLoading(false);
                                    console.error('Download failed:', error);
                                    Alert.alert('Error', `Download failed: ${error.message || error}`);
                                    qrLock.current = false;
                                }
                            }
                        }
                    ]
                );
            } else {
                if (isLoggedIn) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/(auth)');
                }
            }
        } else {
            Alert.alert("Invalid QR Code", "Please try again.", [
                { text: "OK", onPress: () => { qrLock.current = false; } }
            ]);
        }
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={({ data }) => handleScannedData(data)}
            />
            <Overlay />

            <TouchableOpacity
                style={{
                    position: 'absolute',
                    bottom: 40,
                    alignSelf: 'center',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                }}
                onPress={() => {
                    AsyncStorage.removeItem('lastUpdate');
                    setNeedsDownload(true);
                    handleScannedData('Litchfield');
                }}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Skip</Text>
            </TouchableOpacity>

            {!firebaseAvailable && (
                <Text style={{ position: 'absolute', bottom: 10, alignSelf: 'center', color: 'gray' }}>
                    Offline mode
                </Text>
            )}

            {loading && (
                <View style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 10
                }}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={{ color: 'white', marginTop: 10 }}>{loadingText}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
});