import { View, Pressable, Image, Dimensions, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useGlobalStyles } from '@/constants/globalStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';

export default function ThemeScreen() {
    const systemScheme = useColorScheme();
    const globalStyles = useGlobalStyles();
    const [orders, setOrders] = useState([]);
    const router = useRouter();

    const screenWidth = Dimensions.get('window').width;
    const statusColorMap = {
        packing: '#4C9BFF',
        'ready for pick up': '#4CAF50',
        'picked up': '#4CAF50',
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const user = getAuth().currentUser;
                if (!user) return;
                const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
                const snapshot = await getDocs(q);
                const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(result);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
        fetchOrders();
    }, []);

    return (
        <ThemedView style={globalStyles.container}>
            <ScrollView contentContainerStyle={globalStyles.itemContainer}>
                {orders.map(order => (
                    <Pressable
                        key={order.id}
                        onPress={() => router.push(`/profile/order/${order.id}`)}
                        style={[globalStyles.buttonCard, { marginBottom: 16, flexDirection: 'row', alignItems: 'center', padding: 12 }]}
                    >
                        <View style={{ flex: 1, paddingHorizontal: 12 }}>
                            <ThemedText type="subtitle">Order #: {order.orderNumber} </ThemedText>
                            <ThemedText>Total: ${order.total?.toFixed(2)}</ThemedText>
                            <ThemedText>Points: {order.pointsEarned}</ThemedText>
                            <ThemedText>Items: {order.items?.length || 0}</ThemedText>
                            <View style={[globalStyles.smallPillButton, {
                                backgroundColor: statusColorMap[order.status?.toLowerCase()] || '#FF4C4C', marginTop: 8, width: '55%'
                            }]}>
                                <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
                                    {order.status || 'Pending'}
                                </ThemedText>
                            </View>
                        </View>
                        <IconSymbol name="chevron.right" />
                    </Pressable>
                ))}
            </ScrollView>
        </ThemedView>
    );
}
