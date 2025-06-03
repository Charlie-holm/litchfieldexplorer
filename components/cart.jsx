import React, { useRef, useEffect, useState } from 'react';
import { Animated, Dimensions, PanResponder, ScrollView, TouchableOpacity, View, Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCart } from '@/context/CartContext';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';

const { height: screenHeight } = Dimensions.get('window');

const Cart = ({ cartVisible, setCartVisible, /* other props */ }) => {
    const [internalVisible, setInternalVisible] = useState(false);
    const panY = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(screenHeight)).current;
    const translateYOffset = useRef(screenHeight);
    const overlayOpacity = useRef(new Animated.Value(0)).current;
    const { getCart } = useCart();
    const [cartItems, setCartItems] = useState([]);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = totalPrice * 0.1;
    const points = Math.floor(totalPrice / 10);
    const { theme } = useThemeContext();
    const globalStyles = useGlobalStyles();


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
        const fetchCartItems = async () => {
            const items = await getCart();
            setCartItems(items || []);
        };

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
                style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: screenHeight,
                    backgroundColor: 'white',
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    padding: 20,
                    paddingBottom: 100,
                    transform: [{ translateY }],
                    zIndex: 100,
                    elevation: 20,
                }}
                {...panResponder.panHandlers}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 5 }}>
                    <ThemedText type="title">Cart</ThemedText>
                </View>

                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {cartItems.map((item) => (
                        <ThemedView key={item.id} style={{ flexDirection: 'row', marginBottom: 15 }}>
                            <View style={{ justifyContent: 'center' }}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={{ width: 60, height: 60, borderRadius: 6, margin: 15 }}
                                />
                            </View>
                            <ThemedView style={{ flex: 1 }}>
                                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                <ThemedText type="small">Size: {item.size} | Color: {item.color}</ThemedText>
                                <ThemedText type="defaultSemiBold">
                                    ${item.price.toFixed(2)}
                                </ThemedText>
                            </ThemedView>
                            <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity
                                    onPress={() => decrementQuantity(item.id)}
                                    style={[globalStyles.smallButton, { paddingHorizontal: 10, paddingVertical: 4 }]}
                                >
                                    <ThemedText type={'defaultSemiBold'} style={{ color: '#f8f8f8' }}>−</ThemedText>
                                </TouchableOpacity>
                                <ThemedText style={{ marginHorizontal: 10, fontSize: 16, fontWeight: 'bold' }}>
                                    {item.quantity}
                                </ThemedText>
                                <TouchableOpacity
                                    onPress={() => incrementQuantity(item.id)}
                                    style={[globalStyles.smallButton, { paddingHorizontal: 10, paddingVertical: 4 }]}
                                >
                                    <ThemedText type={'defaultSemiBold'} style={{ color: '#f8f8f8' }}>+</ThemedText>
                                </TouchableOpacity>
                            </ThemedView>
                        </ThemedView>
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