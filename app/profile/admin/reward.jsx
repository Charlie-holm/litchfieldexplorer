import React, { useEffect, useState, useRef } from 'react';
import { FlatList, Pressable, Alert, View, Text, Animated, DeviceEventEmitter } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { collection, addDoc, onSnapshot, query, orderBy, setDoc, doc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import FormModal from './FormModal';

async function logLastUpdate(collectionName) {
    const userId = auth.currentUser?.uid || "unknown";
    await setDoc(doc(db, "lastupdate", collectionName), {
        updatedAt: serverTimestamp(),
        by: userId,
    });
}

export default function RewardPanel() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [rewards, setRewards] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingReward, setEditingReward] = useState(null);
    const [form, setForm] = useState({ name: '', type: 'free', cost: 0, productId: '' });
    const [showProductPicker, setShowProductPicker] = useState(false);
    const [products, setProducts] = useState([]);
    const animatedValues = useRef([]).current;

    useEffect(() => {
        const q = query(collection(db, 'rewards'), orderBy('name'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            animatedValues.length = 0;
            items.forEach((_, i) => {
                animatedValues[i] = new Animated.Value(0);
            });
            setRewards(items);

            const animations = items.map((_, i) =>
                Animated.timing(animatedValues[i], {
                    toValue: 1,
                    duration: 400,
                    delay: i * 80,
                    useNativeDriver: true,
                })
            );
            Animated.stagger(80, animations).start();
        });
        return unsubscribe;
    }, []);
    useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(items);
    });
    return unsubscribe;
  }, []);
    useEffect(() => {
        const listener = DeviceEventEmitter.addListener('triggerAddOverlay', () => {
            setForm({ name: '', type: 'free', cost: 0, productId: '' });
            setEditingReward(null);
            setModalVisible(true);
        });
        return () => listener.remove();
    }, []);

    useEffect(() => {
        const refreshListener = DeviceEventEmitter.addListener('triggerRefreshRewardList', () => {
            // No-op listener to allow real-time updates to handle refresh naturally
        });
        return () => refreshListener.remove();
    }, []);
    const openProductPicker = () => {
        setShowProductPicker(true);
    };
    const handleSave = async () => {
        const payload = {
            name: form.name.trim(),
            type: form.type,
        };

        if (!payload.name) {
            console.log("Aborting save: Missing name", payload);
            Alert.alert("Error", "Reward Name is required.");
            return;
        }

        // Validate and assign cost if it's not empty
        if (form.cost !== '' && !isNaN(Number(form.cost))) {
            payload.cost = Number(form.cost);
        } else {
            payload.cost = 0;
        }

        // Include productId or discount if applicable
        if (form.type === 'free' && form.productId) {
            payload.productId = form.productId.trim();
        } else if (form.type === 'discount' && form.discount !== undefined && !isNaN(Number(form.discount))) {
            payload.discount = Number(form.discount);
        }

        console.log("Final payload to save:", payload);
        try {
            if (editingReward) {
                await updateDoc(doc(db, "rewards", editingReward.id), payload);
            } else {
                await addDoc(collection(db, "rewards"), payload);
            }
            await logLastUpdate("lastupdate");
            setModalVisible(false);
            setEditingReward(null);
            setForm({ name: '', type: 'free', cost: '', productId: '' });
            DeviceEventEmitter.emit('triggerRefreshRewardList');
        } catch (error) {
            console.error("Failed to save reward:", error);
            Alert.alert("Error", "Failed to save reward. Check console for details.");
        }
    };

    const handleDelete = () => {
        Alert.alert('Confirm Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    if (!editingReward) return;
                    try {
                        await deleteDoc(doc(db, "rewards", editingReward.id));
                        await logLastUpdate("lastupdate");
                        setModalVisible(false);
                        setEditingReward(null);
                        DeviceEventEmitter.emit('triggerRefreshRewardList');
                    } catch (error) {
                        console.error("Failed to delete reward:", error);
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item, index }) => (
        <Swipeable
            renderRightActions={() => (
                <View style={globalStyles.buttonRemove}>
                    <Pressable
                        onPress={() => {
                            Alert.alert(
                                'Delete Reward',
                                'Are you sure you want to delete this reward?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                await deleteDoc(doc(db, "rewards", item.id));
                                            } catch (error) {
                                                console.error("Failed to delete reward:", error);
                                            }
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
                        <Text style={{ color: 'white', fontSize: 28 }}>×</Text>
                    </Pressable>
                </View>
            )}
        >
            <Animated.View style={{
                opacity: animatedValues[index] || 0,
                transform: [{
                    translateY: (animatedValues[index] || new Animated.Value(0)).interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                    })
                }]
            }}>
                <Pressable onPress={() => {
                    setForm({
                        name: item.name || '',
                        type: item.type || 'free',
                        cost: item.cost !== undefined ? item.cost.toString() : '',
                        discount: item.discount !== undefined ? item.discount.toString() : '',
                        productId: item.productId || '',
                    });
                    setEditingReward(item);
                    setModalVisible(true);
                }}>
                    <ThemedView style={globalStyles.buttonCard}>
                        <View style={globalStyles.buttonLeft}>
                            <ThemedText type="subtitle">{item.name || '(No name)'}</ThemedText>
                            <ThemedText type="small">{`(${item.cost || 0} pts)`}</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={28} />
                    </ThemedView>
                </Pressable>
            </Animated.View>
        </Swipeable>
    );

    return (
        <ThemedView style={globalStyles.container}>
            <FormModal
                mode="reward"
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingReward(null);
                }}
                editingItem={editingReward}
                onSave={handleSave}
                onDelete={handleDelete}
                form={form}
                setForm={setForm}
                products={products}
            />

      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ marginVertical: 10, paddingHorizontal: 20 }}
      />
    </ThemedView>
    );
}