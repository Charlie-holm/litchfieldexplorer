import { View, Pressable, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { useGlobalStyles } from '@/constants/globalStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';


export default function ThemeScreen() {
    const globalStyles = useGlobalStyles();
    const { theme, setTheme } = useThemeContext();
    const systemTheme = useColorScheme();
    const activeTheme = theme === 'auto' ? systemTheme : theme;

    return (
        <ThemedView style={globalStyles.container}>
            <ThemedView style={globalStyles.itemContainer}>
                <ThemedText type="subtitle" style={{ alignSelf: 'left', marginVertical: 10 }}>Choose Theme</ThemedText>
                <Pressable
                    style={globalStyles.buttonCard}
                    onPress={() => setTheme('light')}
                >
                    <ThemedText type="defaultBold">Light Mode</ThemedText>
                    {activeTheme === 'light' && (
                        <IconSymbol name="checkmark" size={24} />
                    )}
                </Pressable>
                <Pressable
                    style={globalStyles.buttonCard}
                    onPress={() => setTheme('dark')}
                >
                    <ThemedText type="defaultBold">Dark Mode</ThemedText>
                    {activeTheme === 'dark' && (
                        <IconSymbol name="checkmark" size={24} />
                    )}
                </Pressable>
                <Pressable
                    style={globalStyles.buttonCard}
                    onPress={() => setTheme('auto')}
                >
                    <ThemedText type="defaultBold">Auto Mode</ThemedText>
                    {activeTheme === 'auto' && (
                        <IconSymbol name="checkmark" size={24} />
                    )}
                </Pressable>
            </ThemedView>
        </ThemedView >
    );
}
