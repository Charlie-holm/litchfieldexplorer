import React, { useState } from 'react';
import { TextInput, Pressable, TouchableOpacity, View } from 'react-native';
import { useGlobalStyles } from '@/constants/globalStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';

export default function ForgetPasswordScreen() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [email, setEmail] = useState('');
    const router = useRouter();

    return (
        <ThemedView style={globalStyles.subPageContainer}>
            <ThemedView
                style={{
                    paddingHorizontal: 20,
                    paddingTop: 80,
                    paddingBottom: 20,
                }}
            >
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol
                        name="chevron.left"
                        size={24}
                        color={Colors[colorScheme].text}
                    />
                </TouchableOpacity>
                <View style={{ width: 24 }} />
            </ThemedView>

            <ThemedView style={{ paddingHorizontal: 30, paddingTop: 60 }}>
                <ThemedText type="title" style={{ marginBottom: 10 }}>Forgot password</ThemedText>
                <ThemedText type="default" style={{ marginBottom: 30 }}>
                    Please enter your email to reset the password
                </ThemedText>

                <ThemedText type="subtitle" style={{ marginBottom: 8 }}>Your Email</ThemedText>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="********@*******.com"
                    placeholderTextColor={Colors[colorScheme].text + '99'}
                    style={[globalStyles.inputTextBox, { marginBottom: 30 }]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Pressable
                    onPress={() => {/* TODO: Reset password logic */ }}
                    style={[globalStyles.pillButton, { marginTop: 20, width: '100%', backgroundColor: Colors[colorScheme].text }]}
                >
                    <ThemedText type="defaultSemiBold" style={{ color: Colors[colorScheme].background }}>
                        Reset Password
                    </ThemedText>
                </Pressable>
            </ThemedView>
        </ThemedView>
    );
}
