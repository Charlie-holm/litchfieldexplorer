import { View, ScrollView, Linking, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';

export default function HelpScreen() {
    const { theme } = useThemeContext();
    const colorScheme = Colors[theme];

    const openEmail = () => {
        Linking.openURL('mailto:admin@litchfieldapp.com.au');
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="title" style={{ marginBottom: 10 }}>
                    Help & Support
                </ThemedText>

                <ThemedText style={styles.paragraph}>
                    Welcome to the Help section! If you’re experiencing any issues or have questions, check the sections below or reach out to us.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    📱 How to Use the App
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    • Browse the attractions in the Home page screen. You can see we have a tons of places.{'\n'}
                    • Tap on an item to view details on the places.{'\n'}
                    • You can also shop some products by categories on the Shop screen.{'\n'}
                    • Use the navigation bar to switch screens.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    ❓ Frequently Asked Questions
                </ThemedText>
                <ThemedText style={styles.paragraph}>
                    <ThemedText style={styles.bold}>Q:</ThemedText> Why can't I see product details?{'\n'}
                    <ThemedText style={styles.bold}>A:</ThemedText> Please make sure you’re connected to the internet. Also, ensure that the ProductDetail screen is correctly linked in your navigation routes.
                </ThemedText>

                <ThemedText type="subtitle" style={styles.sectionTitle}>
                    📧 Contact Support
                </ThemedText>
                <ThemedText 
                    style={[styles.paragraph, { color: colorScheme.tint }]} 
                    onPress= {openEmail}
                >
                    admin@litchfieldapp.com.au
                </ThemedText>

                <ThemedText style={styles.footerText}>
                    We're here to help! Reach out anytime and we’ll respond as soon as possible.
                </ThemedText>
            </ScrollView>
        </ThemedView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    content: {
        paddingBottom: 30,
    },
    sectionTitle: {
        marginTop: 20,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 12,
    },
    bold: {
        fontWeight: 'bold',
    },
    footerText: {
        marginTop: 30,
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
    },
});

