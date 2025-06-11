const statusColorMap = {
    pending: '#FF4C4C',
    packing: '#4C9BFF',
    'ready for pick up': '#4CAF50',
    'picked up': '#4CAF50',
};

import React, { useEffect, useState, useRef } from "react";
import { FlatList, View, Pressable, Alert, Animated, ScrollView } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from '@/firebaseConfig';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function OrderList() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();

    const statuses = ['all', 'pending', 'packing', 'ready for pick up', 'picked up'];
    const [filteredStatus, setFilteredStatus] = useState('all');

    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const animatedValues = useRef([]).current;

    useEffect(() => {
        const fetchOrders = async () => {
            const orderSnap = await getDocs(collection(db, "orders"));
            const orders = orderSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            const userSnap = await getDocs(collection(db, "users"));
            const userMap = {};
            userSnap.docs.forEach((doc) => {
                userMap[doc.id] = doc.data();
            });

            const enrichedOrders = orders.map(order => ({
                ...order,
                firstName: userMap[order.userId]?.firstName || '',
                lastName: userMap[order.userId]?.lastName || ''
            }));

            enrichedOrders.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

            setOrders(enrichedOrders);

            animatedValues.length = 0;
            enrichedOrders.forEach(() => {
                animatedValues.push(new Animated.Value(0));
            });

            Animated.stagger(100, animatedValues.map(anim =>
                Animated.timing(anim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            )).start();
        };
        fetchOrders();
    }, []);

    const renderItem = ({ item, index }) => {
        const isExpanded = selectedOrder?.id === item.id;

        return (
            <Animated.View style={{ opacity: animatedValues[index] }}>
                <Swipeable
                    renderRightActions={() => (
                        <View style={globalStyles.buttonRemove}>
                            <Pressable
                                onPress={() => {
                                    Alert.alert(
                                        'Delete Order',
                                        'Are you sure you want to delete this order?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Delete',
                                                style: 'destructive',
                                                onPress: async () => {
                                                    await deleteDoc(doc(db, "orders", item.id));
                                                    setOrders(prev => prev.filter(order => order.id !== item.id));
                                                },
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
                                <ThemedText style={{ color: 'white', fontSize: 28 }}>×</ThemedText>
                            </Pressable>
                        </View>
                    )}
                >
                    <Pressable onPress={() => setSelectedOrder(isExpanded ? null : item)}>
                        <ThemedView style={[globalStyles.buttonCard, { flexDirection: 'column' }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <View>
                                    <ThemedText type="subtitle">{item.orderNumber}</ThemedText>
                                    <ThemedText type="small">
                                        ${item.total?.toFixed(2)} ({item.items?.length || 0} item{item.items?.length === 1 ? '' : 's'}) | {item.paymentMethod}
                                    </ThemedText>
                                    {!isExpanded && (
                                        <ThemedText type="small">
                                            {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleString() : ''}
                                        </ThemedText>
                                    )}
                                </View>
                                <IconSymbol
                                    name={isExpanded ? 'chevron.up' : 'chevron.down'}
                                    color={Colors[colorScheme].text}
                                    size={28}
                                />
                            </View>

                            {isExpanded && (
                                <View style={{ alignItems: 'flex-start', width: '100%' }}>
                                    <ThemedText type="small">Customer: {item.firstName} {item.lastName}</ThemedText>
                                    <ThemedText type="small">Pick up: {item.pickupLocation} </ThemedText>
                                    <ThemedText type="defaultSemiBold">Items:</ThemedText>
                                    {item.items?.map((product, index) => (
                                        <ThemedText key={index} type="small" style={{ marginTop: 4 }}>
                                            {product.name} | qty: {product.quantity} | color: {product.color || 'N/A'} | size: {product.size || 'N/A'}
                                        </ThemedText>
                                    ))}
                                    <Pressable
                                        onPress={async () => {
                                            const statuses = ["pending", "packing", "ready for pick up", "picked up"];
                                            const currentIndex = statuses.indexOf(item.status);
                                            const nextStatus = statuses[(currentIndex + 1) % statuses.length];

                                            setOrders(prevOrders =>
                                                prevOrders.map(order =>
                                                    order.id === item.id ? { ...order, status: nextStatus } : order
                                                )
                                            );

                                            await updateDoc(doc(db, "orders", item.id), { status: nextStatus });
                                        }}
                                        style={[
                                            globalStyles.smallPillButton,
                                            {
                                                backgroundColor: statusColorMap[item.status] || '#FF4C4C',
                                                marginTop: 8,
                                                width: '50%'
                                            }
                                        ]}
                                    >
                                        <ThemedText style={{ color: '#fff' }}>
                                            {item.status || 'pending'}
                                        </ThemedText>
                                    </Pressable>
                                </View>
                            )}
                        </ThemedView>
                    </Pressable>
                </Swipeable>
            </Animated.View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <ThemedView style={globalStyles.container}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={globalStyles.categoryContainer}
                >
                    {statuses.map(status => (
                        <Pressable
                            key={status}
                            style={[
                                globalStyles.categoryButton,
                                filteredStatus === status && globalStyles.categoryButtonSelected,
                            ]}
                            onPress={() => {
                                Animated.stagger(0, animatedValues.map(anim =>
                                    Animated.timing(anim, {
                                        toValue: 1,
                                        duration: 0,
                                        useNativeDriver: true,
                                    })
                                )).start(() => setFilteredStatus(status));
                            }}
                        >
                            <ThemedText
                                style={{
                                    color:
                                        filteredStatus === status
                                            ? Colors[colorScheme].pri
                                            : Colors[colorScheme].highlight,
                                }}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </ThemedText>
                        </Pressable>
                    ))}
                </ScrollView>
                <FlatList
                    data={filteredStatus === 'all' ? orders : orders.filter(o => (o.status || 'pending') === filteredStatus)}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingTop: 0, paddingHorizontal: 20, paddingBottom: 30, height: '100%' }}
                />
            </ThemedView>
        </View>
    );
}