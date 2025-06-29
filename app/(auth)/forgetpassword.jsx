import React, { useState } from 'react';
import { TextInput, Pressable, TouchableOpacity, View, Alert } from 'react-native';
import { useGlobalStyles } from '@/constants/globalStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';

// ✅ Import Firebase Auth methods
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebaseConfig';

export default function ForgetPassword() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [email, setEmail] = useState('');
    const router = useRouter();

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert('Please enter your email.');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            Alert.alert(
                'Password Reset',
                `A reset link has been sent to ${email}`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/(auth)') // ✅ Go back to (auth)
                    }
                ]
            );
        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.message);
        }
    };

    return (
        <ThemedView style={globalStyles.container}>
            <ThemedView style={globalStyles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol
                        name="chevron.left"
                        size={24}
                    />
                </TouchableOpacity>
            </ThemedView>
            <ThemedView style={{ flex: 1, justifyContent: 'space-between' }}>
                <ThemedView style={[globalStyles.itemContainer, { alignItems: 'flex-start' }]}>
                    <ThemedText type="title" style={{ marginBottom: 10 }}>Forgot password</ThemedText>
                    <ThemedText type="default" style={{ marginBottom: 30 }}>
                        Please enter your email to reset the password
                    </ThemedText>

                    <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Your Email</ThemedText>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="********@*******.com"
                        placeholderTextColor={Colors[colorScheme].thi}
                        style={globalStyles.inputTextBox}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </ThemedView>
                <ThemedView style={{ padding: 20 }}>
                    <Pressable
                        style={globalStyles.pillButton}
                        onPress={handleResetPassword}
                    >
                        <ThemedText type="subtitle" style={{ color: Colors[colorScheme].pri }}>
                            Reset Password
                        </ThemedText>
                    </Pressable>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
}