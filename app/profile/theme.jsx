import { View, Pressable, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';

export default function ThemeScreen() {
    const { theme, setTheme } = useThemeContext();
    const systemTheme = useColorScheme();
    const activeTheme = theme === 'auto'? systemTheme: theme;

    return (
        <ThemedView style={{ flex: 1, padding: 20 }}>
            <ThemedText type="title">Choose Theme</ThemedText>

            <Pressable
                style={{
                    marginTop: 20,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: theme === 'light' ? Colors.light.tint : Colors[activeTheme].background,
                }}
                onPress={() => setTheme('light')}
            >
                <ThemedText
                    type="subtitle"
                    lightColor={theme === 'light' ? Colors.dark.text : Colors.light.text}
                    darkColor={theme === 'light' ? Colors.dark.text : Colors.dark.text}
                >
                    Light Mode
                </ThemedText>
            </Pressable>

            <Pressable
                style={{
                    marginTop: 12,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: theme === 'dark' ? Colors.dark.tint : Colors[activeTheme].background,
                }}
                onPress={() => setTheme('dark')}
            >
                <ThemedText
                    type="subtitle"
                    lightColor={theme === 'dark' ? Colors.light.text : Colors.light.text}
                    darkColor={theme === 'dark' ? Colors.light.text : Colors.dark.text}
                >
                    Dark Mode
                </ThemedText>
            </Pressable>

            <Pressable
                style={{
                    marginTop: 12,
                    padding: 16,
                    borderRadius: 12,
                    backgroundColor: theme === 'auto' ? Colors.light.tint : Colors[activeTheme].background,
                }}
                onPress={() => setTheme('auto')}
            >
                <ThemedText
                    type="subtitle"
                    lightColor={theme === 'auto' ? Colors.dark.text : Colors.light.text}
                    darkColor={theme === 'auto' ? Colors.dark.text : Colors.dark.text}
                >
                    Auto Mode
                </ThemedText>
            </Pressable>
        </ThemedView>
    );
}
