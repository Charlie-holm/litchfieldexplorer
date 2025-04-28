import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View, AppState } from 'react-native';
import { useRouter } from 'expo-router';

export default function Scanner() {
    const [permission, requestPermission] = useCameraPermissions();
    const qrLock = useRef(false);
    const appState = useRef(AppState.currentState);
    const [facing, setFacing] = useState('back');
    const router = useRouter();

    // Placeholder for login status - replace with real auth check
    const isLoggedIn = false;

    useEffect(() => {
        const subscription = AppState.addEventListener("change", (nextAppState) => {
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === "active"
            ) {
                qrLock.current = false;
            }
            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, []);

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

    const handleBarCodeScanned = ({ type, data }) => {
        if (data && !qrLock.current) {
            qrLock.current = true;
            if (data === 'Litchfield') {
                if (isLoggedIn) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/login');
                }
            } else {
                Alert.alert('Unrecognized QR Code', `Scanned Data: ${data}`);
                qrLock.current = false;
            }
        }
    };

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={styles.camera}
                facing={facing}
                onBarCodeScanned={handleBarCodeScanned}
                barcodeScannerSettings={{
                    barCodeTypes: ['qr'],
                }}
            >
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                        <Text style={styles.text}>Flip Camera</Text>
                    </TouchableOpacity>
                </View>
            </CameraView>
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
