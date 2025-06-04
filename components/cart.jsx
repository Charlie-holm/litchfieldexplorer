import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, Dimensions, PanResponder, ScrollView, TouchableOpacity, View, Image, StyleSheet, TouchableWithoutFeedback, Text, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCart } from '@/context/CartContext';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';

const { height: screenHeight } = Dimensions.get('window');

const Cart = ({ cartVisible, setCartVisible, /* other props */ }) => {
    const router = useRouter();
    const [internalVisible, setInternalVisible] = useState(false);
    const panY = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(screenHeight)).current;
    const translateYOffset = useRef(screenHeight);
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const { getCart, updateCartItemQuantity, removeFromCart } = useCart();
    const [cartItems, setCartItems] = useState([]);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = totalPrice * 0.05;
    const points = Math.floor(totalPrice * 5);
    const { theme } = useThemeContext();
    const globalStyles = useGlobalStyles();

    const fetchCartItems = async () => {
        const items = await getCart();
        setCartItems(items || []);
    };

    const removeItem = async (id) => {
        const updated = cartItems.filter(i => i.id !== id);
        setCartItems(updated);
        await removeFromCart(id); // sync with database
    };

    const resetPosition = (toValue) => {
        translateYOffset.current = toValue;
        Animated.spring(translateY, {
            toValue,
            tension: 50,
            friction: 10,
            useNativeDriver: true,
        }).start();

        Animated.timing(overlayOpacity, {
            toValue: toValue === screenHeight ? 0 : 0.5,
            duration: 250,
            useNativeDriver: true,
        }).start();
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 10,
            onPanResponderMove: Animated.event(
                [null, { dy: panY }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                translateYOffset.current += gestureState.dy;
                if (gestureState.dy > 300) {
                    translateYOffset.current = screenHeight;
                    setCartVisible(false);
                } else if (gestureState.dy < -300) {
                    translateYOffset.current = screenHeight * 0.1;
                } else {
                    translateYOffset.current = screenHeight * 0.4;
                }

                panY.setValue(0);
                Animated.spring(translateY, {
                    toValue: translateYOffset.current,
                    tension: 50,
                    friction: 10,
                    useNativeDriver: true,
                }).start();
            },
        })
    ).current;

    useEffect(() => {
        if (cartVisible) {
            setInternalVisible(true);
            resetPosition(screenHeight * 0.4);
            fetchCartItems();
        } else {
            resetPosition(screenHeight);
            setTimeout(() => setInternalVisible(false), 300);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cartVisible]);

    if (!internalVisible) return null;

    return (
        <View style={[StyleSheet.absoluteFillObject, { zIndex: 999 }]}>
            <TouchableWithoutFeedback onPress={() => setCartVisible(false)}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFillObject,
                        {
                            backgroundColor: 'black',
                            opacity: overlayOpacity,
                            zIndex: 98,
                        },
                    ]}
                    pointerEvents={cartVisible ? 'auto' : 'none'}
                />
            </TouchableWithoutFeedback>
            <Animated.View
                style={[globalStyles.cartOverlay, {
                    height: screenHeight,
                    paddingBottom: 100,
                    transform: [{ translateY }],
                }]}
                {...panResponder.panHandlers}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 5 }}>
                    <ThemedText type="title">Cart</ThemedText>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {cartItems.map((item) => (
                        <Swipeable
                            key={item.id}
                            renderRightActions={() => (
                                <View style={globalStyles.buttonRemove}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                'Remove Item',
                                                'Do you want to remove this item from the cart?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Remove',
                                                        style: 'destructive',
                                                        onPress: () => removeItem(item.id),
                                                    },
                                                ]
                                            );
                                        }}
                                        style={{
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            height: '100%',
                                            width: '100%',
                                        }}
                                    >
                                        <Text style={{ color: 'white', fontSize: 32 }}>×</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        >
                            <View style={[globalStyles.buttonCard, { backgroundColor: Colors[theme].for }]}>
                                <View style={[globalStyles.buttonLeft, { maxWidth: '60%' }]}>
                                    <Image
                                        source={{ uri: item.image }}
                                        style={{ width: 70, height: 70, borderRadius: 20 }}
                                    />
                                    <View style={{ flexShrink: 1 }}>
                                        <ThemedText
                                            type="defaultSemiBold"
                                            numberOfLines={0}
                                            style={{ flexWrap: 'wrap' }}
                                        >
                                            {item.name}
                                        </ThemedText>
                                        <ThemedText
                                            type="small"
                                            numberOfLines={0}
                                            style={{ flexWrap: 'wrap' }}
                                        >
                                            Size: {item.size}
                                        </ThemedText>
                                        <ThemedText
                                            type="small"
                                            numberOfLines={0}
                                            style={{ flexWrap: 'wrap' }}
                                        >
                                            Color: {item.color}
                                        </ThemedText>
                                        <ThemedText
                                            type="defaultSemiBold"
                                            numberOfLines={0}
                                            style={{ flexWrap: 'wrap' }}
                                        >
                                            ${item.price.toFixed(2)}
                                        </ThemedText>
                                    </View>
                                </View>

                                <View style={globalStyles.quantityInline}>
                                    <TouchableOpacity onPress={() => {
                                        if (item.quantity === 1) {
                                            Alert.alert(
                                                'Remove Item',
                                                'Do you want to remove this item from the cart?',
                                                [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    {
                                                        text: 'Remove',
                                                        style: 'destructive',
                                                        onPress: () => removeItem(item.id),
                                                    },
                                                ]
                                            );
                                        } else {
                                            const updated = cartItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i);
                                            setCartItems(updated);
                                            updateCartItemQuantity(item.id, item.quantity - 1);
                                        }
                                    }} style={globalStyles.smallButton}>
                                        <ThemedText type={'defaultSemiBold'} style={{ color: '#f8f8f8' }}>−</ThemedText>
                                    </TouchableOpacity>

                                    <ThemedText type={'defaultSemiBold'}>{item.quantity}</ThemedText>

                                    <TouchableOpacity onPress={() => {
                                        const updated = cartItems.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
                                        setCartItems(updated);
                                        updateCartItemQuantity(item.id, item.quantity + 1);
                                    }} style={globalStyles.smallButton}>
                                        <ThemedText type={'defaultSemiBold'} style={{ color: '#f8f8f8' }}>+</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Swipeable>
                    ))}
                </ScrollView>

                <View style={{ borderTopWidth: 1, borderTopColor: Colors[theme].highlight, paddingTop: 15 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <ThemedText type="defaultSemiBold">Total Price</ThemedText>
                        <ThemedText type="defaultSemiBold">${totalPrice.toFixed(2)}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <ThemedText type="defaultSemiBold">GST</ThemedText>
                        <ThemedText type="defaultSemiBold">${gst.toFixed(2)}</ThemedText>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <ThemedText type="defaultSemiBold">Points</ThemedText>
                        <ThemedText type="defaultSemiBold">{points}</ThemedText>
                    </View>
                    <TouchableOpacity
                        style={[globalStyles.pillButton, { marginTop: 30, backgroundColor: Colors[theme].sec }]}
                        onPress={() => {
                            setCartVisible(false);
                            router.push('/checkout');
                        }}
                    >
                        <ThemedText type="subtitle" style={{ color: '#f8f8f8' }}>
                            Check Out
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
};

export default Cart;