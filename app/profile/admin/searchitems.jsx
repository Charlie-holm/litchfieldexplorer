import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
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
    const [filteredCategory, setFilteredCategory] = useState(null);

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

    const renderItem = ({ item }) => {
        if (filteredCategory && filteredCategory !== 'all' && item.type !== filteredCategory) return null;

        return (
            <Pressable onPress={() => {
                setForm(item);
                setEditingInfo(item);
                setModalVisible(true);
            }} style={{ marginTop: 10 }}>
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
        );
    };

    const uniqueTypes = [...new Set(items.map(i => i.type))];
    const categories = ['all', ...uniqueTypes];

    return (
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
            <FlatList
                data={items}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16, }}
            />
            <View style={{ paddingHorizontal: 16, }}>
                <Pressable style={globalStyles.pillButton} onPress={handleSaveToAllItems}>
                    <ThemedText type="subtitle" style={{ color: Colors[colorScheme].pri }}>Save all to firebase</ThemedText>
                </Pressable>
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
        </ThemedView>
    );
}