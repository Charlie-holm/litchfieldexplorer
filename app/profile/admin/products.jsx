import { View, FlatList, Pressable, Image, Alert, Animated, DeviceEventEmitter } from "react-native";
import { Swipeable } from 'react-native-gesture-handler';
import { Text } from 'react-native';
import { useEffect, useState, useRef } from "react";
import { db } from '@/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
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
    const animatedValues = useRef([]).current;

    // Load products from Firestore
    const loadProducts = async () => {
        const snap = await getDocs(collection(db, "products"));
        const loaded = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        animatedValues.length = 0;
        loaded.forEach((_, i) => {
            animatedValues[i] = new Animated.Value(0);
        });

        setProducts(loaded);

        const animations = loaded.map((_, i) =>
            Animated.timing(animatedValues[i], {
                toValue: 1,
                duration: 400,
                delay: i * 80,
                useNativeDriver: true,
            })
        );
        Animated.stagger(80, animations).start();
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

    const renderItem = ({ item, index }) => (
        <Swipeable
            renderRightActions={() => (
                <View style={globalStyles.buttonRemove}>
                    <Pressable
                        onPress={() => {
                            Alert.alert(
                                'Delete Product',
                                'Are you sure you want to delete this product?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                await deleteDoc(doc(db, "products", item.id));
                                                await loadProducts();
                                            } catch (error) {
                                                console.error("Failed to delete product:", error);
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
            <Animated.View
                style={{
                    opacity: animatedValues[index] || 0,
                    transform: [{
                        translateY: (animatedValues[index] || new Animated.Value(0)).interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                        })
                    }]
                }}
            >
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
            </Animated.View>
        </Swipeable>
    );

    const handleSaveProduct = async () => {
        setErrorMsg('');

        if (!newProduct.name.trim()) {
            setErrorMsg("Product name is required.");
            return;
        }
        if (!newProduct.price || isNaN(Number(newProduct.price))) {
            setErrorMsg("Valid price is required.");
            return;
        }

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

        const data = {
            ...newProduct,
            price: parseFloat(newProduct.price),
        };

        if ('sizeEntries' in data) {
            delete data.sizeEntries;
        }

        if ('size' in data) {
            delete data.size;
        }

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

    const handleDelete = () => {
        Alert.alert('Confirm Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    if (!editingProduct) return;
                    try {
                        await deleteDoc(doc(db, "products", editingProduct.id));
                        await loadProducts();
                        setModalVisible(false);
                        setEditingProduct(null);
                    } catch (e) {
                        setErrorMsg("Error deleting product.");
                    }
                }
            }
        ]);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setEditingProduct(null);
        setErrorMsg('');
    };

    return (
        <ThemedView style={globalStyles.container}>
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ marginVertical: 10, paddingHorizontal: 20 }}
            />
            <FormModal
                mode="product"
                visible={modalVisible}
                onClose={handleCloseModal}
                editingItem={editingProduct}
                onSave={handleSaveProduct}
                onDelete={handleDelete}
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