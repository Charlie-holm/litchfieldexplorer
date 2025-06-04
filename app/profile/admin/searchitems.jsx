import React, { useEffect, useState, useRef } from 'react';
import { DeviceEventEmitter, Animated } from 'react-native';
import { View, FlatList, StyleSheet, TextInput, Text, Pressable, Button, Alert, Platform, TouchableOpacity } from 'react-native';
import { tabs } from '@/context/allItems';
import { getDocs, collection, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { useGlobalStyles } from '@/constants/globalStyles';
import FormModal from './FormModal';
import { IconSymbol } from '@/components/ui/IconSymbol';



export default function SearchItemsAdminScreen() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();

    const [modalVisible, setModalVisible] = useState(false);
    const [editingInfo, setEditingInfo] = useState(null);
    const [form, setForm] = useState({});

    const [items, setItems] = useState([]);
    // Animation values for list items
    const animatedValues = useRef([]).current;
    const [filteredCategory, setFilteredCategory] = useState('all');
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
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

            const combined = [
                ...dbAttractions,
                ...dbProducts,
                ...tabs,
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

        fetchItems();
    }, []);

    const handleSaveToAllItems = async () => {
        try {
            for (const item of items) {
                await setDoc(doc(db, 'keywords', item.id), item);
            }
            Alert.alert("Success", "Items saved to Firestore 'keywords'");
        } catch (e) {
            console.error("Save failed:", e);
            Alert.alert("Save failed", e.message);
        }
    };

    const updateItem = (id, key, value) => {
        setItems(prev =>
            prev.map(item => item.id === id ? { ...item, [key]: value } : item)
        );
    };

    const handleSave = async () => {
        if (!form.id || !form.name) return;
        try {
            await setDoc(doc(db, 'keywords', form.id), form);
            setItems(prev =>
                prev.map(item => item.id === form.id ? form : item)
            );
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
        if (!animatedValues[index]) return null;
        return (
            <Animated.View style={{
                opacity: animatedValues[index],
                transform: [{
                    translateY: animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                    }),
                }]
            }}>
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
            </Animated.View>
        );
    };

    const uniqueTypes = [...new Set(items.map(i => i.type))];
    const categories = ['all', ...uniqueTypes];

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
                            onPress={() => setFilteredCategory(cat)}
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
            />
        </View>
    );
}