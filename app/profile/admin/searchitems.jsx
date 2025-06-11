import React, { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DeviceEventEmitter, Animated } from 'react-native';
import { View, FlatList, StyleSheet, TextInput, Text, Pressable, Button, Alert, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getDocs, collection, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { useGlobalStyles } from '@/constants/globalStyles';
import FormModal from './FormModal';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Swipeable } from 'react-native-gesture-handler';



export default function SearchItemsAdminScreen() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingInfo, setEditingInfo] = useState(null);
    const [form, setForm] = useState({});

    const [showCategoryPicker, setShowCategoryPicker] = useState(null);

    const [items, setItems] = useState([]);
    // Animation values for list items
    const animatedValues = useRef([]).current;
    const [filteredCategory, setFilteredCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [savingAll, setSavingAll] = useState(false);

    useEffect(() => {
        const listener = DeviceEventEmitter.addListener('triggerAddOverlay', (page) => {
            if (page === 'searchitems') {
                setForm({});
                setEditingInfo(null);
                setModalVisible(true);
            }
        });
        return () => listener.remove();
    }, []);

    const fetchItems = async () => {
        setLoading(true);
        const snapAttractions = await getDocs(collection(db, 'attractions'));
        const dbAttractions = snapAttractions.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description || '',
            type: 'attraction',
            route: `/attractiondetail/${doc.id}`,
        }));

        const snapProducts = await getDocs(collection(db, 'products'));
        const dbProducts = snapProducts.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description || '',
            type: 'product',
            route: `/productdetail/${doc.id}`,
        }));
        const snapKeywords = await getDocs(collection(db, 'keywords'));
        const dbKeywords = snapKeywords.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(item => item.type !== 'attraction' && item.type !== 'product');

        const combined = [
            ...dbAttractions,
            ...dbProducts,
            ...dbKeywords,
        ];
        setItems(combined);
        // Animation initialization after items are set
        animatedValues.length = combined.length;
        for (let i = 0; i < combined.length; i++) {
            animatedValues[i] = new Animated.Value(0);
        }
        const animations = combined.map((_, index) =>
            Animated.timing(animatedValues[index], {
                toValue: 1,
                duration: 400,
                delay: index * 80,
                useNativeDriver: true,
            })
        );
        Animated.stagger(80, animations).start();
        setLoading(false);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleSaveToAllItems = async () => {
        try {
            setSavingAll(true);
            for (const item of items) {
                await setDoc(doc(db, 'keywords', item.id), item);
            }
            Alert.alert("Success", "Items saved to Firestore 'keywords'");
        } catch (e) {
            console.error("Save failed:", e);
            Alert.alert("Save failed", e.message);
        } finally {
            setSavingAll(false);
        }
    };

    const updateItem = (id, key, value) => {
        setItems(prev =>
            prev.map(item => item.id === id ? { ...item, [key]: value } : item)
        );
    };

    const handleSave = async () => {
        if (!form.name) return;

        const newId = form.type === 'tab' ? form.name : (form.id || uuidv4());
        const itemToSave = { ...form, id: newId };

        try {
            await setDoc(doc(db, 'keywords', newId), itemToSave);
            await fetchItems(); // ensure fresh fetch after save
            setModalVisible(false);
            setEditingInfo(null);
        } catch (e) {
            console.error("Save failed:", e);
            Alert.alert("Save failed", e.message);
        }
    };

    const handleDelete = async () => {
        if (!editingInfo?.id) return;
        try {
            await deleteDoc(doc(db, 'keywords', editingInfo.id));
            setItems(prev => prev.filter(item => item.id !== editingInfo.id));
            setModalVisible(false);
            setEditingInfo(null);
        } catch (e) {
            console.error("Delete failed:", e);
            Alert.alert("Delete failed", e.message);
        }
    };

    const renderItem = ({ item, index }) => {
        if (filteredCategory && filteredCategory !== 'all' && item.type !== filteredCategory) return null;
        const animation = animatedValues[index] || new Animated.Value(1);

        const renderRightActions = () => (
            <View style={globalStyles.buttonRemove}>
                <Pressable
                    onPress={() => {
                        Alert.alert(
                            'Delete Attraction',
                            'Are you sure you want to delete this attraction?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: async () => {
                                        await deleteDoc(doc(db, "attractions", item.id));
                                        const snap = await getDocs(collection(db, "attractions"));
                                        setAttractions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
        );

        return (
            <Animated.View style={{
                opacity: animation,
                transform: [{
                    translateY: animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                    }),
                }]
            }}>
                {item.type === 'tab' ? (
                    <Swipeable renderRightActions={renderRightActions}>
                        <Pressable onPress={() => {
                            setForm(item);
                            setEditingInfo(item);
                            setModalVisible(true);
                        }}>
                            <ThemedView style={globalStyles.buttonCard}>
                                <View style={[globalStyles.buttonLeft, { maxWidth: '60%' }]}>
                                    <View style={{ flex: 1 }}>
                                        <ThemedText type="subtitle">{item.name}</ThemedText>
                                        <ThemedText type="default">{item.route || '(No route)'}</ThemedText>
                                        <ThemedText type="small">{item.type}</ThemedText>
                                    </View>
                                </View>
                                <IconSymbol name="chevron.right" size={28} />
                            </ThemedView>
                        </Pressable>
                    </Swipeable>
                ) : (
                    <Pressable onPress={() => {
                        setForm(item);
                        setEditingInfo(item);
                        setModalVisible(true);
                    }}>
                        <ThemedView style={globalStyles.buttonCard}>
                            <View style={[globalStyles.buttonLeft, { maxWidth: '60%' }]}>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="subtitle">{item.name}</ThemedText>
                                    <ThemedText type="default">{item.route || '(No route)'}</ThemedText>
                                    <ThemedText type="small">{item.type}</ThemedText>
                                </View>
                            </View>
                            <IconSymbol name="chevron.right" size={28} />
                        </ThemedView>
                    </Pressable>
                )}
            </Animated.View>
        );
    };

    const categories = ['all', 'attraction', 'product', 'tab'];

    return (
        <View style={{ flex: 1 }}>
            <ThemedView style={globalStyles.container}>
                <View style={globalStyles.categoryContainer}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[
                                globalStyles.categoryButton,
                                filteredCategory === cat && globalStyles.categoryButtonSelected,
                            ]}
                            onPress={() => {
                                Animated.stagger(0, animatedValues.map(anim =>
                                    Animated.timing(anim, {
                                        toValue: 1,
                                        duration: 0,
                                        useNativeDriver: true,
                                    })
                                )).start(() => setFilteredCategory(cat));
                            }}
                        >
                            <ThemedText
                                style={{
                                    color:
                                        filteredCategory === cat
                                            ? Colors[colorScheme].pri
                                            : Colors[colorScheme].highlight,
                                }}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </View>
                {loading ? (
                    <ThemedText style={{ textAlign: 'center', marginTop: 20 }}>Loading...</ThemedText>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={item => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    />
                )}
            </ThemedView>
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors[colorScheme].background }}>
                <View style={{ paddingHorizontal: 20 }}>
                    <Pressable style={globalStyles.pillButton} onPress={handleSaveToAllItems}>
                        <ThemedText type="subtitle" style={{ color: Colors[colorScheme].pri }}>Save all to firebase</ThemedText>
                    </Pressable>
                </View>
            </View>
            <FormModal
                mode="searchitems"
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingInfo(null);
                }}
                editingItem={editingInfo}
                onSave={handleSave}
                onDelete={handleDelete}
                form={form}
                setForm={setForm}
                showCategoryPicker={showCategoryPicker}
                setShowCategoryPicker={setShowCategoryPicker}
            />
            {savingAll && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000099', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={{ color: 'white', marginTop: 10, fontSize: 18 }}>Saving...</Text>
                </View>
            )}
        </View>
    );
}