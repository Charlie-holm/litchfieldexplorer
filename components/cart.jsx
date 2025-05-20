import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Pressable,
    Modal,
    Animated,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    Image
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';

const screenWidth = Dimensions.get('window').width;

const Cart = ({
    cartVisible,
    setCartVisible,
    cartItems,
    incrementQuantity,
    decrementQuantity,
    totalPrice,
    gst,
    points,
    onCheckout
}) => {
    const { theme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const translateX = useRef(new Animated.Value(screenWidth)).current;
    const [internalVisible, setInternalVisible] = useState(false);

    useEffect(() => {
        if (cartVisible) {
            setInternalVisible(true);
            Animated.timing(translateX, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(translateX, {
                toValue: screenWidth,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setInternalVisible(false));
        }
    }, [cartVisible]);

    return (
        <Modal visible={internalVisible} transparent animationType="none">
            <Animated.View style={[globalStyles.overlay, { transform: [{ translateX }], height: '100%', alignItems: 'flex-end' }]}>
                <Pressable
                    onPress={() => setCartVisible(false)}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <View style={[globalStyles.cartOverlay, { width: '85%', padding: 20 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 50 }}>
                        <ThemedText type="title">Cart</ThemedText>
                        <View style={{ width: 40, height: 40, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
                            <IconSymbol
                                name="circle.fill"
                                size={40}
                                color={Colors[theme].highlight}
                                style={{ position: 'absolute' }}
                            />
                            <TouchableOpacity onPress={() => setCartVisible(false)}>
                                <IconSymbol name="xmark.circle.fill" size={40} color={Colors[theme].sec} />
                            </TouchableOpacity>
                        </View>
                    </View>


                    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                        {cartItems.map((item) => (
                            <ThemedView key={item.id} style={{ flexDirection: 'row', marginBottom: 15 }}>
                                <Image
                                    source={{ uri: item.image }}
                                    style={{ width: 60, height: 60, borderRadius: 6, marginRight: 15 }}
                                />
                                <ThemedView style={{ flex: 1 }}>
                                    <ThemedText style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</ThemedText>
                                    <ThemedText style={{ fontSize: 12, color: Colors[theme].secondaryText }}>{item.category}</ThemedText>
                                    <ThemedText style={{ fontWeight: 'bold', fontSize: 14, marginTop: 4 }}>
                                        ${item.price.toFixed(2)}
                                    </ThemedText>
                                </ThemedView>
                                <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        onPress={() => decrementQuantity(item.id)}
                                        style={[globalStyles.smallButton, { paddingHorizontal: 10, paddingVertical: 4 }]}
                                    >
                                        <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>−</ThemedText>
                                    </TouchableOpacity>
                                    <ThemedText style={{ marginHorizontal: 10, fontSize: 16, fontWeight: 'bold' }}>
                                        {item.quantity}
                                    </ThemedText>
                                    <TouchableOpacity
                                        onPress={() => incrementQuantity(item.id)}
                                        style={[globalStyles.smallButton, { paddingHorizontal: 10, paddingVertical: 4 }]}
                                    >
                                        <ThemedText style={{ fontSize: 18, fontWeight: 'bold' }}>+</ThemedText>
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
                            onPress={onCheckout}
                        >
                            <ThemedText type="subtitle">Pay</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </Modal >
    );
};

export default Cart;
