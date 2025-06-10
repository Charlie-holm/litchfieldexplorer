import { View, Pressable, Image } from 'react-native';
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

export default function ThemeScreen() {
    const systemScheme = useColorScheme();
    const globalStyles = useGlobalStyles();
    const [orders, setOrders] = useState([]);

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
            <ThemedView style={globalStyles.itemContainer}>
                {orders.map(order => (
                    <Pressable key={order.id} style={[globalStyles.buttonCard, { marginBottom: 16, flexDirection: 'row', alignItems: 'center', padding: 12 }]}>
                        <View style={{ flex: 1, paddingHorizontal: 12 }}>
                            <ThemedText type="subtitle">Order #: {order.orderNumber} </ThemedText>
                            <ThemedText>Total: ${order.total?.toFixed(2)}</ThemedText>
                            <ThemedText>Points: {order.pointsEarned}</ThemedText>
                            <ThemedText>Items: {order.items?.length || 0}</ThemedText>
                            <ThemedText>Status: {order.status || 'Pending'}</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={24} color="#000" />
                    </Pressable>
                ))}
            </ThemedView>
        </ThemedView>
    );
}
