import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useGlobalStyles } from '@/constants/globalStyles';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function ConfirmationScreen() {
    const router = useRouter();
    const globalStyles = useGlobalStyles();
    const theme = useColorScheme();
    const color = Colors[theme];
    const [latestOrder, setLatestOrder] = useState(null);

    useEffect(() => {
        const fetchLatestOrder = async () => {
            const db = getFirestore();
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(1));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const latestOrder = snapshot.docs[0].data();
                setLatestOrder(latestOrder);
            }
        };
        fetchLatestOrder();
    }, []);

    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: 12 }}>✅</Text>
            <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 12 }}>
                Thank you for your order!
            </ThemedText>
            <ThemedText type="default" style={{ textAlign: 'center', marginBottom: 24 }}>
                Your order has been successfully placed. You will receive a confirmation shortly.
            </ThemedText>

            <View style={globalStyles.overlayContent}>
                <ThemedText type="subtitle" style={{ paddingBottom: 10 }}>Order Summary:</ThemedText>
                <ThemedText type="defaultSemiBold">Order #: {latestOrder?.orderNumber || 'Loading...'}</ThemedText>
                <ThemedText type="defaultSemiBold">
                    Total: ${latestOrder?.total?.toFixed(2) ?? 'Loading...'} ({latestOrder?.items?.length || 0} {latestOrder?.items?.length === 1 ? 'item' : 'items'})
                </ThemedText>
                <ThemedText type="defaultSemiBold">Points Earned: {latestOrder?.pointsEarned ?? 'Loading...'}</ThemedText>
                <ThemedText type="defaultSemiBold">Pickup Location: {latestOrder?.pickupLocation ?? 'Loading...'}</ThemedText>
                <ThemedText type="defaultSemiBold">Payment: {latestOrder?.paymentMethod ?? 'Loading...'}</ThemedText>
            </View>

            <View style={{ position: 'absolute', bottom: 5, width: '100%', alignItems: 'center' }}>
                <TouchableOpacity
                    onPress={() => router.push('/(tabs)/')}
                    style={[globalStyles.pillButton, { backgroundColor: color.tri }]}
                >
                    <ThemedText type="subtitle" style={{ color: '#fff' }}>
                        Back to Home
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}
