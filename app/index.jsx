import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Overlay } from "./Overlay";
import { auth } from '@/firebaseConfig';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
    const qrLock = useRef(false);
    const [facing, setFacing] = useState('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [firstScan, setFirstScan] = useState(true);
    const isLoggedIn = auth.currentUser !== null;

    useEffect(() => {
        const checkFirstScan = async () => {
            const value = await AsyncStorage.getItem('firstScanDone');
            if (value === 'true') {
                setFirstScan(false);
            }
        };
        checkFirstScan();
    }, []);

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
                onBarcodeScanned={({ data }) => {
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
                                            Alert.alert("Downloaded");
                                            await AsyncStorage.setItem('firstScanDone', 'true');
                                            setFirstScan(false);
                                            router.replace('/(auth)');
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
                }}
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
                    if (isLoggedIn) {
                        router.replace('/(tabs)');
                    } else {
                        router.replace('/(auth)');
                    }
                }}
            >
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Skip</Text>
            </TouchableOpacity>
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
