import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { View, Text, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useGlobalStyles } from '@/constants/globalStyles';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import { useCart } from '@/context/CartContext';

export default function CheckoutScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme];
    const globalStyles = useGlobalStyles();
    const { getCart } = useCart();
    const [items, setItems] = useState([]);
    const [pickupExpanded, setPickupExpanded] = useState(false);
    const [pickupHeight] = useState(new Animated.Value(0));
    const [selectedPickup, setSelectedPickup] = useState(null);
    // Animate the pickup location expand/collapse
    const togglePickup = () => {
        if (pickupExpanded) {
            Animated.timing(pickupHeight, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start(() => setPickupExpanded(false));
        } else {
            setPickupExpanded(true);
            Animated.timing(pickupHeight, {
                toValue: 120,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
    };

    useEffect(() => {
        const fetchCartItems = async () => {
            const data = await getCart();
            setItems(data || []);
        };
        fetchCartItems();
    }, []);


    // Calculate summary values
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = subtotal * 0.05;
    const discount = 0;
    const total = subtotal + gst - discount;
    const pointsEarned = items.reduce((sum, item) => sum + Math.round(item.price * 5) * item.quantity, 0);

    return (
        <>
            <View style={globalStyles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" />
                </TouchableOpacity>
                <ThemedText type="title" >Checkout</ThemedText>
                <View style={{ width: 32 }} />
            </View>
            <ThemedView style={[globalStyles.container, { flex: 1 }]}>
                <View style={{ flex: 1 }}>
                    <ScrollView
                        contentContainerStyle={{ marginTop: 20, flex: 1, paddingHorizontal: 20 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {items.map((item) => {
                            const itemPoints = Math.round(item.price * 10);
                            return (
                                <View
                                    key={item.id}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: 20,
                                        backgroundColor: themeColors.pri,
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
                                            <View style={{ backgroundColor: themeColors.pri, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
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
                    </ScrollView>
                    <View style={globalStyles.cartOverlay}>
                        <TouchableOpacity
                            onPress={togglePickup}
                            style={[globalStyles.buttonCard, { backgroundColor: themeColors.tri }]}
                        >
                            <IconSymbol name="shippingbox" color='#f8f8f8' style={{ marginRight: 12 }} />
                            <View style={{ flex: 1 }}>
                                <ThemedText type="subtitle" style={{ marginBottom: 2, color: '#f8f8f8' }}>Pick Up Information</ThemedText>
                                <ThemedText type="default" style={{ color: '#f8f8f8' }}>
                                    {selectedPickup ? selectedPickup : 'Select a location'}
                                </ThemedText>
                            </View>
                            <IconSymbol name={pickupExpanded ? "chevron.up" : "chevron.down"} color='#f8f8f8' style={{ marginRight: 12 }} />
                        </TouchableOpacity>

                        {pickupExpanded && (
                            <Animated.View
                                style={[
                                    globalStyles.buttonCardExpanded,
                                    {
                                        backgroundColor: themeColors.background,
                                        height: pickupHeight,
                                        overflow: 'hidden',
                                    }
                                ]}
                            >
                                <ScrollView>
                                    {['Entrance', 'Customer Service Desk', 'Carpark Resception'].map((location) => (
                                        <TouchableOpacity
                                            key={location}
                                            style={{ paddingVertical: 8 }}
                                            onPress={() => {
                                                setSelectedPickup(location);
                                                togglePickup();
                                            }}
                                        >
                                            <ThemedText type="default">{location}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </Animated.View>
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                            <ThemedText type="default">GST (5%)</ThemedText>
                            <ThemedText type="default">${gst.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <ThemedText type="default">Discount</ThemedText>
                            <ThemedText type="default">-${discount.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <ThemedText type="default">Subtotal</ThemedText>
                            <ThemedText type="default">${subtotal.toFixed(2)}</ThemedText>
                        </View>
                        <View style={[globalStyles.divider, { marginVertical: 10 }]} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <ThemedText type="subtitle">Total ({totalItems} items)</ThemedText>
                            <ThemedText type="subtitle">${total.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <ThemedText type="default">Points Earned</ThemedText>
                            <ThemedText type="default">{pointsEarned} pts</ThemedText>
                        </View>

                        <TouchableOpacity
                            style={[globalStyles.pillButton, { marginTop: 30, backgroundColor: themeColors.sec }]}
                            onPress={async () => {
                                if (!selectedPickup) {
                                    alert('Please select a pickup location.');
                                    return;
                                }
                                triggerApplePay({ items, total, subtotal, gst, discount, selectedPickup, pointsEarned, getCart });
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <IconSymbol name="applelogo" size={18} color="#f8f8f8" style={{ marginRight: 6 }} />
                                <ThemedText type="subtitle" style={{ color: '#f8f8f8' }}>
                                    Pay with Apple Pay | ${total.toFixed(2)}
                                </ThemedText>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedView>
        </>
    );
}
// Placeholder Apple Pay trigger function
async function triggerApplePay({ items, total, subtotal, gst, discount, selectedPickup, pointsEarned, getCart }) {
    alert('Apple Pay payment successful.');

    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const orderRef = collection(getFirestore(), 'orders');
            const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase();
            await addDoc(orderRef, {
                userId: user.uid,
                items,
                total: parseFloat(total.toFixed(2)),
                subtotal: parseFloat(subtotal.toFixed(2)),
                gst: parseFloat(gst.toFixed(2)),
                discount: parseFloat(discount.toFixed(2)),
                pickupLocation: selectedPickup || null,
                pointsEarned,
                paymentMethod: 'Apple Pay',
                orderNumber,
                createdAt: serverTimestamp()
            });
            await getCart(true); // Clear the cart
            router.push('/checkout/confirmation');
        } else {
            console.log('User not authenticated');
        }
    } catch (err) {
        console.error('Failed to submit order:', err);
    }
}