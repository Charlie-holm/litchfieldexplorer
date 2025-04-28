import { View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { useGlobalStyles } from '@/constants/globalStyles';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';

export default function SignedUpScreen() {
    const router = useRouter();
    const globalStyles = useGlobalStyles();
    const { theme: colorScheme } = useThemeContext();

    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: Colors[colorScheme].background }}>
            <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 20, color: Colors[colorScheme].text }}>
                🎉 Account Created Successfully!
            </ThemedText>
            <ThemedText type="default" style={{ textAlign: 'center', marginBottom: 60, color: Colors[colorScheme].text }}>
                Welcome to Litchfield Explorer. You can now log in and start exploring!
            </ThemedText>
            <Pressable onPress={() => router.replace('/login')}>
                <ThemedView style={[globalStyles.pillButton, { backgroundColor: Colors[colorScheme].nav, width: 200 }]}>
                    <ThemedText type="subtitle" style={{ color: Colors[colorScheme].pillButtonText }}>
                        Go to Login
                    </ThemedText>
                </ThemedView>
            </Pressable>
        </ThemedView>
    );
}