import { View, Pressable, useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { useGlobalStyles } from '@/constants/globalStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';


export default function ThemeScreen() {
    const globalStyles = useGlobalStyles();
    const { setTheme, savedTheme } = useThemeContext();

    return (
        <ThemedView style={globalStyles.container}>
            <ThemedView style={globalStyles.itemContainer}>
                <ThemedText type="subtitle" style={{ alignSelf: 'left', marginVertical: 10 }}>Choose Theme</ThemedText>
                <Pressable
                    style={globalStyles.buttonCard}
                    onPress={() => setTheme('light')}
                >
                    <ThemedText type="defaultBold">Light Mode</ThemedText>
                    {savedTheme === 'light' && (
                        <IconSymbol name="checkmark" size={24} />
                    )}
                </Pressable>
                <Pressable
                    style={globalStyles.buttonCard}
                    onPress={() => setTheme('dark')}
                >
                    <ThemedText type="defaultBold">Dark Mode</ThemedText>
                    {savedTheme === 'dark' && (
                        <IconSymbol name="checkmark" size={24} />
                    )}
                </Pressable>
                <Pressable
                    style={globalStyles.buttonCard}
                    onPress={() => setTheme('auto')}
                >
                    <ThemedText type="defaultBold">Auto Mode</ThemedText>
                    {savedTheme === 'auto' && (
                        <IconSymbol name="checkmark" size={24} />
                    )}
                </Pressable>
            </ThemedView>
        </ThemedView >
    );
}
