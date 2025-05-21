import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { Overlay } from "./Overlay";
import { auth, isFirebaseReady } from '@/firebaseConfig';
import { downloadAndCacheData } from '@/context/dataCache';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
    const qrLock = useRef(false);
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [firstScan, setFirstScan] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');
    const [firebaseAvailable, setFirebaseAvailable] = useState(false);
    const isLoggedIn = auth.currentUser !== null;

    useEffect(() => {
        const checkFirstScan = async () => {
            const value = await AsyncStorage.getItem('firstScanDone');
            if (value === 'true') {
                setFirstScan(false);
            }
        };
        checkFirstScan();

        let retryCount = 0;
        let cancelled = false;
        const maxRetries = 5;
        const retryDelay = 2000;

        const checkFirebase = async () => {
            const ready = await isFirebaseReady();
            console.log(`Firebase readiness attempt #${retryCount + 1}: ${ready ? 'READY' : 'NOT READY'}`);
            if (ready) {
                if (!cancelled) setFirebaseAvailable(true);
            } else if (retryCount < maxRetries) {
                retryCount++;
                setTimeout(checkFirebase, retryDelay);
            }
        };
        checkFirebase();
        return () => { cancelled = true; };
    }, []);

    const handleScannedData = async (data) => {
        if (!data || qrLock.current) return;

        qrLock.current = true;

        if (data === 'Litchfield') {
            if (firstScan) {
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
                                if (!firebaseAvailable) {
                                    Alert.alert("Connection Error", " Please try again later.");
                                    qrLock.current = false;
                                    return;
                                }
                                setLoading(true);
                                setLoadingText('Downloading...');
                                await downloadAndCacheData();
                                setLoadingText('Download complete!');
                                await AsyncStorage.setItem('firstScanDone', 'true');
                                setFirstScan(false);
                                setTimeout(() => {
                                    setLoading(false);
                                    router.replace('/(auth)');
                                }, 1000);
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
                <Button onPress={requestPermission} title="grant permission" />
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
                    AsyncStorage.removeItem('firstScanDone');
                    setFirstScan(true);
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
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});
