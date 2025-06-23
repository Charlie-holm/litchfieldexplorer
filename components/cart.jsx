import React, { useRef, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Animated, Dimensions, PanResponder, ScrollView, TouchableOpacity, View, Image, StyleSheet, TouchableWithoutFeedback, Text, Alert } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { auth } from '@/firebaseConfig';

const { height: screenHeight } = Dimensions.get('window');

const Cart = ({ cartVisible, setCartVisible, /* other props */ }) => {
    const router = useRouter();
    const [internalVisible, setInternalVisible] = useState(false);
    const panY = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(screenHeight)).current;
    const translateYOffset = useRef(screenHeight);
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const { theme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const user = auth.currentUser;
    const [cartItems, setCartItems] = useState([]);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = totalPrice * 0.05;
    const points = Math.round(totalPrice * 5);

    const fetchCartItems = async () => {
        const res = await fetch(`http://192.168.202.66:3000/api/cart?userId=${user.uid}`);
        const data = await res.json();
        setCartItems(data.items || []);
    };

    const removeItem = async (id) => {
        const updated = cartItems.filter(i => i.cartItemId !== id);
        setCartItems(updated);
        await fetch('http://192.168.202.66:3000/api/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid, cartItemId: id })
        });
    };

    const updateItemQuantity = async (cartItemId, quantity) => {
        const updated = cartItems.map(i => i.cartItemId === cartItemId ? { ...i, quantity } : i);
        setCartItems(updated);
        await fetch('http://192.168.202.66:3000/api/cart/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.uid, cartItemId, quantity })
        });
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
                    {cartItems.length === 0 ? (
                        <ThemedText type="defaultSemiBold" style={{ color: Colors[theme].tri, textAlign: 'center', marginTop: 20 }}>
                            Nothing in cart yet
                        </ThemedText>
                    ) : (
                        cartItems.map((item) => (
                            <Swipeable
                                key={item.cartItemId}
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
                                                            onPress: () => removeItem(item.cartItemId),
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
                                <View style={[globalStyles.buttonCard, { backgroundColor: Colors[theme].tri }]}>
                                    <View style={[globalStyles.buttonLeft, { maxWidth: '60%' }]}>
                                        <Image
                                            source={{ uri: item.image }}
                                            style={{ width: 70, height: 70, borderRadius: 20 }}
                                        />
                                        <View style={{ flexShrink: 1 }}>
                                            <ThemedText
                                                type="defaultSemiBold"
                                                numberOfLines={0}
                                                style={{ flexWrap: 'wrap', color: '#f8f8f8' }}
                                            >
                                                {item.name}
                                            </ThemedText>
                                            <ThemedText
                                                type="small"
                                                numberOfLines={0}
                                                style={{ flexWrap: 'wrap', color: '#f8f8f8' }}
                                            >
                                                Size: {item.size}
                                            </ThemedText>
                                            <ThemedText
                                                type="small"
                                                numberOfLines={0}
                                                style={{ flexWrap: 'wrap', color: '#f8f8f8' }}
                                            >
                                                Color: {item.color}
                                            </ThemedText>
                                            <ThemedText
                                                type="defaultSemiBold"
                                                numberOfLines={0}
                                                style={{ flexWrap: 'wrap', color: '#f8f8f8' }}
                                            >
                                                ${item?.price ? item.price.toFixed(2) : '0.00'}
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
                                                            onPress: () => removeItem(item.cartItemId),
                                                        },
                                                    ]
                                                );
                                            } else {
                                                updateItemQuantity(item.cartItemId, item.quantity - 1);
                                            }
                                        }} style={globalStyles.smallButton}>
                                            <ThemedText type={'defaultSemiBold'} style={{ color: '#f8f8f8' }}>−</ThemedText>
                                        </TouchableOpacity>

                                        <ThemedText type={'defaultSemiBold'} style={{ color: '#f8f8f8' }}>{item.quantity}</ThemedText>

                                        <TouchableOpacity onPress={() => {
                                            updateItemQuantity(item.cartItemId, item.quantity + 1);
                                        }} style={globalStyles.smallButton}>
                                            <ThemedText type={'defaultSemiBold'} style={{ color: '#f8f8f8' }}>+</ThemedText>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Swipeable>
                        ))
                    )}
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
                        style={[
                            globalStyles.pillButton,
                            {
                                marginTop: 30,
                                backgroundColor: cartItems.length === 0 ? Colors[theme].tri : Colors[theme].sec,
                                opacity: cartItems.length === 0 ? 0.5 : 1,
                            },
                        ]}
                        disabled={cartItems.length === 0}
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