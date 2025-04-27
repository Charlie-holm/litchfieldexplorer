import { View, Pressable } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useState } from 'react';

export default function ThemeScreen() {
    const systemScheme = useColorScheme();
    const [theme, setTheme] = useState(systemScheme);

    return (
        <ThemedView style={{ flex: 1, padding: 20 }}>
            <ThemedText type="title">Choose Theme</ThemedText>

            <Pressable
                style={{
                    marginTop: 20,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: theme === 'light' ? Colors.light.tint : '#ccc',
                }}
                onPress={() => setTheme('light')}
            >
                <ThemedText type="subtitle">Light Mode</ThemedText>
            </Pressable>

            <Pressable
                style={{
                    marginTop: 12,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: theme === 'dark' ? Colors.dark.tint : '#ccc',
                }}
                onPress={() => setTheme('dark')}
            >
                <ThemedText type="subtitle">Dark Mode</ThemedText>
            </Pressable>
        </ThemedView>
    );
}
