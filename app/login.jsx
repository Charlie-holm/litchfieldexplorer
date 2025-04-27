import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useGlobalStyles } from '@/constants/globalStyles';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useFonts } from 'expo-font';
import { ThemedText } from '@/components/ThemedText';

export default function LoginScreen() {
    const { theme: colorScheme } = useThemeContext();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const globalStyles = useGlobalStyles();

    const [fontsLoaded] = useFonts({
        'Lobster-Regular': require('@/assets/fonts/Lobster-Regular.ttf'),
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace('/(tabs)/home');
            }
        });
        return unsubscribe;
    }, []);

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Logged in!');
            router.replace('/');
        } catch (error) {
            Alert.alert('Login Failed', error.message);
        }
    };

    return (
        <View
            style={[
                globalStyles.container,
                {
                    padding: 20,
                    gap: 20,
                },
            ]}
        >
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
            <TextInput
                style={globalStyles.inputTextBox}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={globalStyles.inputTextBox}
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <View style={{ alignItems: 'flex-end', width: '100%', marginBottom: 20 }}>
                <Pressable onPress={() => Alert.alert('Forgot Password')}>
                    <ThemedText type="default" style={{ textAlign: 'right' }}>
                        Forgot Password?
                    </ThemedText>
                </Pressable>
            </View>

            <View style={{ alignItems: 'flex-end', width: '100%' }}>
                <Pressable style={globalStyles.smallPillButton} onPress={handleLogin}>
                    <ThemedText type="subtitle" style={{ color: Colors[colorScheme].pillButtonText }}>Login</ThemedText>
                </Pressable>
            </View>

            <View style={{ alignItems: 'flex-end', width: '100%' }}>
                <Pressable
                    style={[
                        globalStyles.smallPillButton,
                        {
                            backgroundColor: 'transparent',
                            borderWidth: 1,
                            borderColor: Colors[colorScheme].nav,
                        },
                    ]}
                    onPress={() => router.push('/signup')}>
                    <ThemedText type="subtitle" style={{ color: Colors[colorScheme].text }}>Sign up</ThemedText>
                </Pressable>
            </View>
        </View>
    );
}
