import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useGlobalStyles } from '@/constants/globalStyles';
import { router } from 'expo-router';
import { useCart } from '@/context/CartContext';

export default function CheckoutScreen() {
    const { theme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const { getCart } = useCart();
    const [items, setItems] = useState([]);

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
    const pointsEarned = items.reduce((sum, item) => sum + Math.round(item.price * 10) * item.quantity, 0);

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
                                        backgroundColor: Colors[theme].pri,
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
                                            <View style={{ backgroundColor: Colors[theme].pri, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
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
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        backgroundColor: '#f8f8f8',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        padding: 20,
                        paddingBottom: 0,
                        zIndex: 100,
                        elevation: 20,
                    }}>
                        <View style={[globalStyles.buttonCard, { backgroundColor: Colors[theme].for }]}>
                            <IconSymbol name="map-pin" size={22} color={Colors[theme].highlight} style={{ marginRight: 12 }} />
                            <View style={{ flex: 1 }}>
                                <ThemedText type="subtitle" style={{ marginBottom: 2 }}>Pick Up Information</ThemedText>
                                <ThemedText type="default">Select a location</ThemedText>
                            </View>
                            <IconSymbol name="chevron-down" size={20} color={Colors[theme].highlight} />
                        </View>

                        <View style={[globalStyles.buttonCard, { backgroundColor: Colors[theme].for }]}>
                            <IconSymbol name="credit-card" size={22} color={Colors[theme].highlight} style={{ marginRight: 12 }} />
                            <View style={{ flex: 1 }}>
                                <ThemedText type="subtitle" style={{ marginBottom: 2 }}>Credit Card</ThemedText>
                                <ThemedText type="default" >•••• 1234</ThemedText>
                            </View>
                            <IconSymbol name="chevron-right" size={20} color={Colors[theme].highlight} />
                        </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                            <ThemedText type="default" style={{ color: Colors[theme].textSecondary }}>GST (5%)</ThemedText>
                            <ThemedText type="default">${gst.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <ThemedText type="default" style={{ color: Colors[theme].textSecondary }}>Discount</ThemedText>
                            <ThemedText type="default" style={{ color: Colors[theme].tint }}>-${discount.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <ThemedText type="default" style={{ color: Colors[theme].textSecondary }}>Subtotal</ThemedText>
                            <ThemedText type="default">${subtotal.toFixed(2)}</ThemedText>
                        </View>
                        <View style={[globalStyles.divider, { marginVertical: 10 }]} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <ThemedText type="subtitle">Total ({totalItems} items)</ThemedText>
                            <ThemedText type="subtitle">${total.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                            <ThemedText type="default" style={{ color: Colors[theme].tint }}>Points Earned</ThemedText>
                            <ThemedText type="default" style={{ color: Colors[theme].tint }}>{pointsEarned} pts</ThemedText>
                        </View>

                        {/* Pay Button */}
                        <TouchableOpacity
                            style={[globalStyles.pillButton, { marginTop: 30, backgroundColor: Colors[theme].sec }]}
                            onPress={() => {
                                setCartVisible(false);
                                router.push('/checkout_confirmed');
                            }}
                        >
                            <ThemedText type="subtitle" style={{ color: '#f8f8f8' }}>
                                Pay
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedView>
        </>
    );
}