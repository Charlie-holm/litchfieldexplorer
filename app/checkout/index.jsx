import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { View, Text, ScrollView, TouchableOpacity, Image, Animated } from 'react-native';
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
    const [pickupExpanded, setPickupExpanded] = useState(false);
    const [pickupHeight] = useState(new Animated.Value(0));
    const [selectedPickup, setSelectedPickup] = useState(null);
    const [cardExpanded, setCardExpanded] = useState(false);
    const [cardHeight] = useState(new Animated.Value(0));
    const [cards, setCards] = useState([]);
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
    const toggleCard = () => {
        if (cardExpanded) {
            Animated.timing(cardHeight, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start(() => setCardExpanded(false));
        } else {
            setCardExpanded(true);
            Animated.timing(cardHeight, {
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

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const auth = getAuth();
                const user = auth.currentUser;
                if (!user) return;

                const docRef = doc(getFirestore(), 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.cards && Array.isArray(data.cards)) {
                        setCards(data.cards.map((card, i) => ({
                            ...card,
                            id: `card-${i}`,
                            last4: card.cardNumber?.replace(/\s/g, '').slice(-4) || '0000',
                            expanded: false,
                            editing: false
                        })));
                    }
                }
            } catch (error) {
                console.error('Error fetching cards:', error);
            }
        };

        fetchCards();
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
                    <View style={globalStyles.cartOverlay}>
                        <TouchableOpacity
                            onPress={togglePickup}
                            style={[globalStyles.buttonCard, { backgroundColor: Colors[theme].tri }]}
                        >
                            <IconSymbol name="shippingbox" style={{ marginRight: 12 }} />
                            <View style={{ flex: 1 }}>
                                <ThemedText type="subtitle" style={{ marginBottom: 2 }}>Pick Up Information</ThemedText>
                                <ThemedText type="default">
                                    {selectedPickup ? selectedPickup : 'Select a location'}
                                </ThemedText>
                            </View>
                            <IconSymbol name={pickupExpanded ? "chevron.up" : "chevron.down"} style={{ marginRight: 12 }} />
                        </TouchableOpacity>

                        {pickupExpanded && (
                            <Animated.View
                                style={[
                                    globalStyles.buttonCardExpanded,
                                    {
                                        backgroundColor: Colors[theme].background,
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
                            onPress={toggleCard}
                            style={[globalStyles.buttonCard, { backgroundColor: Colors[theme].tri }]}
                        >
                            <IconSymbol name="creditcard" style={{ marginRight: 12 }} />
                            <View style={{ flex: 1 }}>
                                <ThemedText type="subtitle" style={{ marginBottom: 2 }}>Credit Card</ThemedText>
                                <ThemedText type="default">{cards[0]?.last4 ? `•••• ${cards[0].last4}` : 'Select a card'}</ThemedText>
                            </View>
                            <IconSymbol name={cardExpanded ? "chevron.up" : "chevron.down"} style={{ marginRight: 12 }} />
                        </TouchableOpacity>

                        {cardExpanded && (
                            <Animated.View
                                style={[
                                    globalStyles.buttonCardExpanded,
                                    {
                                        backgroundColor: Colors[theme].background,
                                        height: cardHeight,
                                        overflow: 'hidden',
                                    }
                                ]}
                            >
                                <ScrollView>
                                    {cards.map((card) => (
                                        <TouchableOpacity
                                            key={card.id}
                                            onPress={() => {
                                                toggleCard();
                                            }}
                                            style={{ paddingVertical: 8 }}
                                        >
                                            <ThemedText type="default">•••• {card.last4}</ThemedText>
                                        </TouchableOpacity>
                                    ))}
                                    {cards.length === 0 && (
                                        <TouchableOpacity
                                            onPress={() => router.push('/profile/payment')}
                                            style={{ paddingVertical: 8 }}
                                        >
                                            <ThemedText>Add Card</ThemedText>
                                        </TouchableOpacity>
                                    )}
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
                            style={[globalStyles.pillButton, { marginTop: 30, backgroundColor: Colors[theme].sec }]}
                            onPress={() => {
                                setCartVisible(false);
                                router.push('/checkout_confirmed');
                            }}
                        >
                            <ThemedText type="subtitle" style={{ color: '#f8f8f8' }}>
                                Pay | ${total.toFixed(2)}
                            </ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </ThemedView>
        </>
    );
}