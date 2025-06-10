import { View, ScrollView, Linking, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';


export default function HelpScreen() {
    const globalStyles = useGlobalStyles();
    const { theme } = useThemeContext();
    const colorScheme = Colors[theme];

    const openEmail = () => {
        Linking.openURL('mailto:admin@litchfieldapp.com.au');
    };

    return (
        <ThemedView style={globalStyles.container}>
            <ScrollView contentContainerStyle={globalStyles.itemContainer}>
                <ThemedText>
                    Welcome to the Help section! If you’re experiencing any issues or have questions, check the sections below or reach out to us.
                </ThemedText>

                <View style={[globalStyles.overlayContent, { width: '100%', marginVertical: 10 }]}>
                    <ThemedText type="subtitle">
                        📱 How to Use the App
                    </ThemedText>
                    <ThemedText>
                        • Browse the attractions in the Home page screen. You can see we have a tons of places.{'\n'}
                        • Tap on an item to view details on the places.{'\n'}
                        • You can also shop some products by categories on the Shop screen.{'\n'}
                        • Use the navigation bar to switch screens.
                    </ThemedText>
                </View>

                <View style={[globalStyles.overlayContent, { width: '100%', marginVertical: 10 }]}>
                    <ThemedText type="subtitle">
                        ❓ Frequently Asked Questions
                    </ThemedText>
                    <ThemedText>
                        <ThemedText type="defaultSemiBold">Q:</ThemedText> Why can't I see product details?{'\n'}
                        <ThemedText type="defaultSemiBold">A:</ThemedText> Please make sure you’re connected to the internet.
                    </ThemedText>
                </View>

                <View style={[globalStyles.overlayContent, { width: '100%', marginVertical: 10 }]}>
                    <ThemedText type="subtitle">
                        📧 Contact Support
                    </ThemedText>
                    <ThemedText
                        onPress={openEmail}
                    >
                        admin@litchfieldapp.com.au
                    </ThemedText>
                </View>

                <ThemedText type="small" paddingBottom={50}>
                    We're here to help! Reach out anytime and we’ll respond as soon as possible.
                </ThemedText>
            </ScrollView>
        </ThemedView>
    );
}
