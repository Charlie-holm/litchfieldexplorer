import { View, Image, StyleSheet, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useRoute } from '@react-navigation/native';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';

export default function ProductDetailScreen() {
    const route = useRoute();
    const item = route.params?.item;
    const { theme } = useThemeContext();
    const activeTheme = theme === 'auto' ? 'light' : (theme || 'light');

    // If no item is passed, show fallback message
    if (!item) {
        return (
            <ThemedView style={styles.container}>
                <ThemedText type="title" style={styles.title}>
                    No product data available.
                </ThemedText>
            </ThemedView>
        );
    }

    // Determine image source (remote URL or local require)
    const imageSource = typeof item.image === 'string'
        ? { uri: item.image }
        : item.image;

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Image
                    source={imageSource}
                    style={styles.image}
                    resizeMode="contain"
                />

                <ThemedText type="title" style={styles.title}>
                    {item.title}
                </ThemedText>

                <ThemedText style={styles.category}>
                    Category: {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                </ThemedText>

                <ThemedText style={[styles.price, { color: Colors[activeTheme]?.tint || '#000' }]}>
                    {item.price}
                </ThemedText>

                <ThemedText style={styles.description}>
                    This is a beautifully crafted NT-themed product perfect for locals and tourists.
                    High-quality material, durable, and stylish.
                </ThemedText>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    scrollContent: {
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    category: {
        fontSize: 16,
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    description: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
});
