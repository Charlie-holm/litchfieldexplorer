import { View, Pressable, Alert, Image, FlatList } from 'react-native';
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

    const panels = [
        { title: 'Users Panel', route: '/profile/admin/users' },
        { title: 'Attractions Panel', route: '/profile/admin/attractions' },
        { title: 'Products Panel', route: '/profile/admin/products' },
        { title: 'Quick Info Panel', route: '/profile/admin/quickinfo' },
    ];

    return (
        <ThemedView style={globalStyles.subPageContainer}>
            <ThemedView style={globalStyles.itemContainer}>
                <FlatList
                    data={panels}
                    keyExtractor={(item) => item.route}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => router.push(item.route)}>
                            <ThemedView style={globalStyles.buttonCard}>
                                <ThemedView style={globalStyles.buttonLeft}>
                                    <IconSymbol name="gear" color={Colors[colorScheme].text} />
                                    <ThemedText type="subtitle">{item.title}</ThemedText>
                                </ThemedView>
                                <IconSymbol name="chevron.right" size={28} color={Colors[colorScheme].text} />
                            </ThemedView>
                        </Pressable>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </ThemedView >
        </ThemedView >
    );
}