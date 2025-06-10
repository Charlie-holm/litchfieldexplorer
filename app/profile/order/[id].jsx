import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { View, ScrollView, ActivityIndicator, Image, Dimensions } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { Colors } from '@/constants/Colors';

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const globalStyles = useGlobalStyles();
    const { theme: colorScheme } = useThemeContext();
    const screenWidth = Dimensions.get('window').width;

    const statusColorMap = {
        packing: '#4C9BFF',
        'ready for pick up': '#4CAF50',
        'picked up': '#4CAF50',
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const docRef = doc(db, 'orders', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <View style={globalStyles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={globalStyles.centered}>
                <ThemedText>Order not found.</ThemedText>
            </View>
        );
    }

    return (
        <ThemedView style={globalStyles.container}>
            <ScrollView contentContainerStyle={globalStyles.itemContainer}>
                <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 12 }}>Order #{order.orderNumber || id}</ThemedText>
                <View style={globalStyles.buttonCard}>
                    <View style={{ flex: 1 }}>
                        <ThemedText>Date: {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</ThemedText>
                        <ThemedText>Pickup Location: {order.pickupLocation}</ThemedText>
                        <ThemedText>payment:  {order.paymentMethod}</ThemedText>
                        <ThemedText>Points Earned: {order.pointsEarned ?? 0} pts</ThemedText>
                        <ThemedText>GST: ${typeof order.gst === 'number' ? order.gst.toFixed(2) : '0.00'}</ThemedText>
                        <ThemedText>Discount: -${typeof order.discount === 'number' ? order.discount.toFixed(2) : '0.00'}</ThemedText>
                        <ThemedText>Total Amount: ${typeof order.total === 'number' ? order.total.toFixed(2) : '0.00'}</ThemedText>
                        <View style={[globalStyles.smallPillButton, {
                            backgroundColor: statusColorMap[order.status?.toLowerCase()] || '#FF4C4C', marginTop: 8, width: '50%'
                        }]}>
                            <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>
                                {order.status || 'Pending'}
                            </ThemedText>
                        </View>
                    </View>
                </View>
                <ThemedText type="subtitle" style={{ marginTop: 20, alignSelf: 'flex-start' }}>Items:</ThemedText>
                <ThemedView style={globalStyles.itemContainer}>
                    {order.items?.map((item, index) => {
                        const itemPoints = Math.round(item.price * 10);
                        return (
                            <View
                                key={index}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginBottom: 20,
                                    backgroundColor: Colors[colorScheme].pri,
                                    borderRadius: 12,
                                    padding: 12,
                                    shadowOpacity: 0.07,
                                    shadowRadius: 4,
                                    shadowOffset: { width: 0, height: 2 },
                                }}
                            >
                                <Image
                                    source={{ uri: item.image }}
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: 10,
                                        marginRight: 14,
                                    }}
                                />
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="subtitle" style={{ marginBottom: 4 }}>
                                        {item.name}
                                    </ThemedText>
                                    <ThemedText type="small" style={{ marginBottom: 4 }}>
                                        Size: {item.size} | Color: {item.color}
                                    </ThemedText>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <ThemedText type="defaultSemiBold" style={{ marginRight: 8 }}>
                                            ${item.price.toFixed(2)}
                                        </ThemedText>
                                        <View style={{ backgroundColor: Colors[colorScheme].pri, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                                            <ThemedText type="small" style={{ marginRight: 8 }}>{itemPoints} pts</ThemedText>
                                        </View>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                                    <ThemedText type="subtitle" style={{ marginRight: 8 }}>{item.quantity}</ThemedText>
                                </View>
                            </View>
                        );
                    })}
                </ThemedView>
            </ScrollView >
        </ThemedView >
    );
}
