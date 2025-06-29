import { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useGlobalStyles } from '@/constants/globalStyles';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useFonts } from 'expo-font';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AuthIndex() {
    const { theme: colorScheme } = useThemeContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const globalStyles = useGlobalStyles();

    const [fontsLoaded] = useFonts({
        'Lobster-Regular': require('@/assets/fonts/Lobster-Regular.ttf'),
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace('/(tabs)');
            }
        });
        return unsubscribe;
    }, []);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            console.log('Logging in with:', email);
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Logged in!');
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ThemedView style={globalStyles.container}>
            <ThemedView
                style={{ padding: 20, gap: 20 }}>
                <ThemedText type="title" style={{ fontFamily: 'Lobster-Regular' }}>
                    Litchfield Explorer
                </ThemedText>
                <ThemedText
                    type="title"
                    style={{ fontWeight: '900' }}
                >
                    Hello,
                </ThemedText>
                <ThemedText
                    type="title"
                    style={{ fontWeight: '900' }}
                >
                    Explorer!
                </ThemedText>
            </ThemedView>
            <ThemedView style={globalStyles.itemContainer}>
                <TextInput
                    style={globalStyles.inputTextBox}
                    placeholder="Email"
                    placeholderTextColor={Colors[colorScheme].tri}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={globalStyles.inputTextBox}
                    placeholder="Password"
                    placeholderTextColor={Colors[colorScheme].tri}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                {errorMessage !== '' && (
                    <ThemedText type="default" style={{ alignSelf: 'flex-start', color: 'red', marginVertical: 10 }}>
                        {errorMessage}
                    </ThemedText>
                )}

                <View style={{ alignItems: 'flex-end', width: '100%', marginVertical: 10 }}>
                    <Pressable onPress={() => router.push('/forgetpassword')}>
                        <ThemedText type="default" style={{ textAlign: 'right' }}>
                            Forgot Password?
                        </ThemedText>
                    </Pressable>
                </View>

                <View style={{ alignItems: 'flex-end', width: '100%', marginVertical: 10 }}>
                    <Pressable style={globalStyles.smallPillButton} onPress={handleLogin}>
                        <ThemedText type="subtitle" style={{ color: Colors[colorScheme].pri }}>Login</ThemedText>
                    </Pressable>
                </View>

                <View style={{ alignItems: 'flex-end', width: '100%', marginVertical: 10 }}>
                    <Pressable
                        style={[
                            globalStyles.smallPillButton,
                            {
                                backgroundColor: 'transparent',
                                borderWidth: 1,
                                borderColor: Colors[colorScheme].highlight,
                            },
                        ]}
                        onPress={() => router.push('/signup')}>
                        <ThemedText type="subtitle">Sign up</ThemedText>
                    </Pressable>
                </View>
            </ThemedView>
            {isLoading && (
                <View style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                }}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
        </ThemedView>

    );
}
