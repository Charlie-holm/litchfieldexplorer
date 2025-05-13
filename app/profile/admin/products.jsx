import { View, Text, FlatList, Pressable, Image, Modal, TextInput, ScrollView } from "react-native";
import { DeviceEventEmitter } from "react-native";
import { useEffect, useState } from "react";
import { db } from '@/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { useGlobalStyles } from '@/constants/globalStyles';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

import FormModal from './FormModal';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const globalStyles = useGlobalStyles();
    const [modalVisible, setModalVisible] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        inventory: [],
        imageUrl: '',
    });
    const [editingProduct, setEditingProduct] = useState(null); // product object being edited, or null if adding
    const [uploading, setUploading] = useState(false);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Load products from Firestore
    const loadProducts = async () => {
        const snap = await getDocs(collection(db, "products"));
        setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('triggerAddOverlay', (detail) => {
            if (detail === 'products') {
                setNewProduct({
                    name: '',
                    category: '',
                    price: '',
                    description: '',
                    inventory: [],
                    color: '',
                    imageUrl: '',
                });
                setEditingProduct(null);
                setErrorMsg('');
                setModalVisible(true);
            }
        });
        return () => subscription.remove();
    }, []);

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            alert("Permission to access media library is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            const formData = new FormData();
            formData.append('file', {
                uri: imageUri,
                name: `product-${Date.now()}.jpg`,
                type: 'image/jpeg',
            });
            formData.append('upload_preset', 'products');
            formData.append('folder', 'products');

            try {
                setUploading(true);
                const response = await fetch("https://api.cloudinary.com/v1_1/djrzkaal4/image/upload", {
                    method: "POST",
                    body: formData,
                });
                const data = await response.json();
                if (data.secure_url) {
                    setNewProduct(prev => ({ ...prev, imageUrl: data.secure_url }));
                } else {
                    alert("Upload failed.");
                }
            } catch (err) {
                alert("Upload failed.");
            } finally {
                setUploading(false);
            }
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setNewProduct({
            name: product.name || '',
            category: product.category || '',
            price: product.price?.toString() || '',
            description: product.description || '',
            inventory: product.inventory || [],
            color: product.color || '',
            imageUrl: product.imageUrl || '',
        });
        setErrorMsg('');
        setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <Pressable onPress={() => handleEditProduct(item)}>
            <View style={globalStyles.buttonCard}>
                <View style={globalStyles.buttonCardIcon}>
                    <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ flex: 1 }}>
                    <ThemedText type="subtitle">{item.name}</ThemedText>
                    <ThemedText type="small">${item.price?.toFixed(2)}</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={28} color="#000" />
            </View>
        </Pressable>
    );

    // Save handler (Add or Update)
    const handleSaveProduct = async () => {
        setErrorMsg('');
        // Validate required fields
        if (!newProduct.name.trim()) {
            setErrorMsg("Product name is required.");
            return;
        }
        if (!newProduct.price || isNaN(Number(newProduct.price))) {
            setErrorMsg("Valid price is required.");
            return;
        }
        // Check for unique name (case-insensitive, ignore self if editing)
        const nameLC = newProduct.name.trim().toLowerCase();
        const duplicate = products.find(
            (p) =>
                p.name.trim().toLowerCase() === nameLC &&
                (!editingProduct || p.id !== editingProduct.id)
        );
        if (duplicate) {
            setErrorMsg("Product name already exists.");
            return;
        }
        // Prepare data
        const data = {
            ...newProduct,
            price: parseFloat(newProduct.price),
        };
        // Remove legacy sizeEntries if present
        if ('sizeEntries' in data) {
            delete data.sizeEntries;
        }
        // Remove flat size if present
        if ('size' in data) {
            delete data.size;
        }
        // Remove stockEntries if present
        if ('stockEntries' in data) {
            delete data.stockEntries;
        }
        try {
            if (editingProduct) {
                // Update
                await updateDoc(doc(db, "products", editingProduct.id), data);
            } else {
                // Add
                await addDoc(collection(db, "products"), data);
            }
            await loadProducts();
            setModalVisible(false);
            setEditingProduct(null);
        } catch (e) {
            setErrorMsg("Error saving product.");
        }
    };

    // Delete handler
    const handleDeleteProduct = async () => {
        if (!editingProduct) return;
        try {
            await deleteDoc(doc(db, "products", editingProduct.id));
            await loadProducts();
            setModalVisible(false);
            setEditingProduct(null);
        } catch (e) {
            setErrorMsg("Error deleting product.");
        }
    };

    // Close handler (no changes)
    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingProduct(null);
        setErrorMsg('');
    };

    return (
        <ThemedView style={globalStyles.subPageContainer}>
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 10 }}
            />
            <FormModal
                mode="product"
                visible={modalVisible}
                onClose={handleCloseModal}
                editingItem={editingProduct}
                onSave={handleSaveProduct}
                onDelete={handleDeleteProduct}
                form={newProduct}
                setForm={setNewProduct}
                uploading={uploading}
                handlePickImage={handlePickImage}
                showCategoryPicker={showCategoryPicker}
                setShowCategoryPicker={setShowCategoryPicker}
                errorMsg={errorMsg}
            />
        </ThemedView>
    );
}