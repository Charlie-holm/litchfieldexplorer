import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { View, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useGlobalStyles } from '@/constants/globalStyles';
import { router } from 'expo-router';
import ENV from '@/env';


export default function CheckoutIndex() {
    const { theme: colorScheme } = useThemeContext();
    const themeColors = Colors[colorScheme];
    const globalStyles = useGlobalStyles();
    const [items, setItems] = useState([]);
    const [pickupExpanded, setPickupExpanded] = useState(false);
    const [pickupHeight] = useState(new Animated.Value(0));
    const [selectedPickup, setSelectedPickup] = useState(null);
    // Rewards selection state
    const [selectedReward, setSelectedReward] = useState(null);
    const [rewardsOverlayVisible, setRewardsOverlayVisible] = useState(false);
    // Redeemed rewards state
    const [redeemedRewards, setRedeemedRewards] = useState([]);
    // Discount value state
    const [discountValue, setDiscountValue] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    // Apply reward to cart (accepts voucherId)
    async function applyReward(voucherId) {
        console.log('Applying voucherId:', voucherId);
        console.log('Current cart items:', items);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;
            let headers = { 'Content-Type': 'application/json' };
            if (user.getIdToken) {
                const token = await user.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(`http://${ENV.API_BASE_URL}:3000/api/rewards/apply`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    cartItems: items,
                    voucherId,
                }),
            });
            if (!res.ok) {
                console.error('API response not ok');
                return;
            }
            const data = await res.json();
            console.log('API response data:', data);
            setItems(data.updatedCartItems || []);
            console.log('Updated cart items:', data.updatedCartItems || []);
            setDiscountValue(data.discountValue || 0);
        } catch (err) {
            console.error('Failed to apply reward:', err);
        }
    }
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
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) return;
                const res = await fetch(`http://${ENV.API_BASE_URL}:3000/api/cart?userId=${user.uid}`);
                const data = await res.json();
                setItems(data.items || []);
            } catch (err) {
                setItems([]);
            }
        };
        fetchCartItems();
        fetchRedeemedRewards();
    }, []);

    // Fetch redeemed rewards via API
    async function fetchRedeemedRewards() {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                setRedeemedRewards([]);
                return;
            }
            // Get JWT token if needed for authentication
            let headers = {};
            if (user.getIdToken) {
                const token = await user.getIdToken();
                headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(`http://${ENV.API_BASE_URL}:3000/api/rewards/valid`, {
                headers,
            });
            if (!res.ok) {
                setRedeemedRewards([]);
                return;
            }
            const data = await res.json();
            setRedeemedRewards(data.redeemedRewards || []);
            // Print the entire reward objects with voucherId and expiryDate
            console.log('Redeemed rewards loaded:', data.redeemedRewards);
        } catch (err) {
            setRedeemedRewards([]);
        }
    }


    // Calculate summary values
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = subtotal * 0.05;
    const discount = discountValue;
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
                        contentContainerStyle={{ marginTop: 20, flex: 1, paddingHorizontal: 20, }}
                        showsVerticalScrollIndicator={false}
                    >
                        {items.map((item, index) => {
                            const itemPoints = Math.round(item.price * 5);
                            return (
                                <View
                                    key={`${item.id}-${index}`}
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
                                        {(item.size || item.color) && (
                                            <ThemedText type="small" style={{ marginBottom: 4 }}>
                                                {item.size ? `Size: ${item.size}` : ''}
                                                {item.size && item.color ? ' | ' : ''}
                                                {item.color ? `Color: ${item.color}` : ''}
                                            </ThemedText>
                                        )}
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
                        <TouchableOpacity
                            onPress={() => setRewardsOverlayVisible(true)}
                            style={[globalStyles.buttonCard, { backgroundColor: themeColors.tri, flexDirection: 'row', alignItems: 'center' }]}
                        >
                            <IconSymbol name="gift" color="#f8f8f8" style={{ marginRight: 12 }} />
                            <View style={{ flex: 1 }}>
                                <ThemedText type="subtitle" style={{ marginBottom: 2, color: '#f8f8f8' }}>Choose Rewards</ThemedText>
                                <ThemedText type="default" style={{ color: '#f8f8f8' }}>
                                    {selectedReward ? selectedReward.rewardName : 'Select a rewards option'}
                                </ThemedText>
                            </View>
                            <IconSymbol name="chevron.right" color="#f8f8f8" style={{ marginRight: 12 }} />
                        </TouchableOpacity>

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
                                setIsProcessing(true);
                                try {
                                    await placeOrder({
                                        items,
                                        selectedPickup,
                                        voucherId: selectedReward?.voucherId || null,
                                    });
                                } finally {
                                    setIsProcessing(false);
                                }
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
            {/* Rewards Overlay Modal */}
            {rewardsOverlayVisible && (
                <View style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                    zIndex: 1000,
                }}>
                    <View style={{ backgroundColor: themeColors.background, borderRadius: 12, padding: 20, width: '100%' }}>
                        <ScrollView style={{ paddingBottom: 20 }}>
                            {redeemedRewards.length === 0 ? (
                                <ThemedText type="default" style={{ textAlign: 'center' }}>
                                    No rewards available
                                </ThemedText>
                            ) : (
                                redeemedRewards.map((reward) => (
                                    <TouchableOpacity
                                        key={reward.voucherId}
                                        style={[
                                            globalStyles.buttonCard,
                                            { marginBottom: 12, flexDirection: 'row', alignItems: 'center' }
                                        ]}
                                        onPress={() => {
                                            setSelectedReward(reward);
                                            applyReward(reward.voucherId);
                                            setRewardsOverlayVisible(false);
                                        }}
                                    >
                                        {reward.image && (
                                            <Image
                                                source={{ uri: reward.image }}
                                                style={{ width: 80, height: 80, borderRadius: 8, marginRight: 12 }}
                                            />
                                        )}
                                        <View style={{ flex: 1, }}>
                                            <ThemedText type="subtitle">🎁 {reward.rewardName}</ThemedText>
                                            <ThemedText type="small" style={{ marginTop: 4 }}>
                                                Voucher: {reward.voucherId}
                                            </ThemedText>
                                            <ThemedText type="small" style={{ marginTop: 2 }}>
                                                Expires: {reward.expiryDate ? new Date(reward.expiryDate).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                }) : 'N/A'}
                                            </ThemedText>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            style={[globalStyles.pillButton, { backgroundColor: themeColors.sec, marginTop: 10, marginBottom: -30 }]}
                            onPress={() => setRewardsOverlayVisible(false)}
                        >
                            <ThemedText type="subtitle" style={{ color: '#f8f8f8' }}>Close</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {isProcessing && (
                <View style={{
                    ...StyleSheet.absoluteFillObject,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <ThemedText type="subtitle" style={{ marginTop: 12, color: '#fff' }}>
                        Processing your order...
                    </ThemedText>
                </View>
            )}
        </>
    );
}
async function placeOrder({ items, selectedPickup, voucherId = null }) {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        alert('You must be logged in to place an order.');
        return;
    }
    try {
        const response = await fetch(`http://${ENV.API_BASE_URL}:3000/api/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.uid,
                items,
                pickup: selectedPickup,
                voucherId, // send voucherId here
            }),
        });
        const result = await response.json();
        if (response.ok && result.success) {
            // Clear the cart via backend
            const clearRes = await fetch(`http://${ENV.API_BASE_URL}:3000/api/cart/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid }),
            });
            if (clearRes.ok) {
                router.push('/checkout/confirmation');
            } else {
                alert('Order placed, but failed to clear cart.');
            }
        } else {
            alert(`Order failed: ${result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Order submission error:', error);
        alert('An error occurred while submitting your order. Please try again later.');
    }
}