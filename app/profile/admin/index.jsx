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
        { title: 'Search Keywords', route: '/profile/admin/searchitems' },
        { title: 'Orders Panel', route: '/profile/admin/order' },
    ];

    return (
        <ThemedView style={globalStyles.container}>
            <ThemedView style={globalStyles.itemContainer}>
                <FlatList
                    data={panels}
                    keyExtractor={(item) => item.route}
                    renderItem={({ item }) => (
                        <Pressable onPress={() => router.push(item.route)}>
                            <ThemedView style={globalStyles.buttonCard}>
                                <View style={globalStyles.buttonLeft}>
                                    <IconSymbol name="gear" />
                                    <ThemedText type="subtitle">{item.title}</ThemedText>
                                </View>
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