import { View, Pressable, Alert, Image } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/constants/globalStyles';
import { router } from "expo-router";
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';


export default function AdminDashboard() {
    const globalStyles = useGlobalStyles();
    const { theme: colorScheme } = useThemeContext();

    return (
        <ThemedView style={globalStyles.subPageContainer}>
            <ThemedView style={globalStyles.itemContainer}>
                <Pressable onPress={() => router.push('/profile/users')}>
                    <ThemedView style={globalStyles.buttonCard}>
                        <ThemedView style={globalStyles.buttonLeft}>
                            <IconSymbol name="gear" color={Colors[colorScheme].text} />
                            <ThemedText type="subtitle">Users Panel</ThemedText>
                        </ThemedView>
                        <IconSymbol name="chevron.right" size={28} color={Colors[colorScheme].text} />
                    </ThemedView>
                </Pressable>
                <Pressable onPress={() => router.push('/profile/attractions')}>
                    <ThemedView style={globalStyles.buttonCard}>
                        <ThemedView style={globalStyles.buttonLeft}>
                            <IconSymbol name="gear" color={Colors[colorScheme].text} />
                            <ThemedText type="subtitle">Attractions Panel</ThemedText>
                        </ThemedView>
                        <IconSymbol name="chevron.right" size={28} color={Colors[colorScheme].text} />
                    </ThemedView>
                </Pressable>
                <Pressable onPress={() => router.push('/profile/products')}>
                    <ThemedView style={globalStyles.buttonCard}>
                        <ThemedView style={globalStyles.buttonLeft}>
                            <IconSymbol name="gear" color={Colors[colorScheme].text} />
                            <ThemedText type="subtitle">Products Panel</ThemedText>
                        </ThemedView>
                        <IconSymbol name="chevron.right" size={28} color={Colors[colorScheme].text} />
                    </ThemedView>
                </Pressable>
            </ThemedView >
        </ThemedView >
    );
}