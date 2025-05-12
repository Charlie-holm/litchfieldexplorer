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
            <ThemedView style={[globalStyles.buttonCard, { flexDirection: 'row', alignItems: 'center' }]}>
                <ThemedView style={[globalStyles.buttonLeft, { flex: 1 }]}>
                    <Image source={{ uri: item.imageUrl }} style={{ width: 50, height: 50, borderRadius: 6 }} />
                    <ThemedText type="subtitle">{item.name}</ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={28} color="#000" />
            </ThemedView>
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
        <View>
            <FlatList
                data={products}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 10 }}
            />
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: '#000000aa', justifyContent: 'center' }}>
                    <Pressable
                        onPress={handleCloseModal}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    />
                    <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, maxHeight: '60%' }}>
                        <ScrollView contentContainerStyle={{ padding: 20 }}>
                            {['name', 'price', 'description'].map((field) =>
                                field === 'price' ? (
                                    <TextInput
                                        key={field}
                                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                        value={newProduct[field]}
                                        onChangeText={(text) => {
                                            const floatOnly = text.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                                            setNewProduct(prev => ({ ...prev, price: floatOnly }));
                                        }}
                                        style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                        keyboardType="decimal-pad"
                                    />
                                ) : (
                                    <TextInput
                                        key={field}
                                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                        value={newProduct[field]}
                                        onChangeText={(text) => setNewProduct(prev => ({ ...prev, [field]: text }))}
                                        style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                    />
                                )
                            )}

                            <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>Size & Color Inventory</Text>

                            <View style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderColor: '#ccc', marginBottom: 6 }}>
                                <Text style={{ flex: 1, fontWeight: 'bold' }}>Size</Text>
                                <Text style={{ flex: 1, fontWeight: 'bold' }}>Color</Text>
                                <Text style={{ flex: 1, fontWeight: 'bold' }}>Qty</Text>
                                <Text style={{ width: 30 }} />
                            </View>

                            {(newProduct.inventory || []).map((entry, idx) => (
                                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                    <TextInput
                                        placeholder="Size"
                                        value={entry.size}
                                        onChangeText={(text) => {
                                            const updated = [...newProduct.inventory];
                                            updated[idx].size = text;
                                            setNewProduct(prev => ({ ...prev, inventory: updated }));
                                        }}
                                        style={{ flex: 1, marginRight: 4 }}
                                    />
                                    <TextInput
                                        placeholder="Color"
                                        value={entry.color}
                                        onChangeText={(text) => {
                                            const updated = [...newProduct.inventory];
                                            updated[idx].color = text;
                                            setNewProduct(prev => ({ ...prev, inventory: updated }));
                                        }}
                                        style={{ flex: 1, marginRight: 4 }}
                                    />
                                    <TextInput
                                        placeholder="Qty"
                                        value={entry.quantity?.toString() || ''}
                                        onChangeText={(text) => {
                                            const updated = [...newProduct.inventory];
                                            updated[idx].quantity = parseInt(text) || 0;
                                            setNewProduct(prev => ({ ...prev, inventory: updated }));
                                        }}
                                        keyboardType="numeric"
                                        style={{ flex: 1, marginRight: 4 }}
                                    />
                                    <Pressable onPress={() => {
                                        const updated = [...newProduct.inventory];
                                        updated.splice(idx, 1);
                                        setNewProduct(prev => ({ ...prev, inventory: updated }));
                                    }}>
                                        <Text style={{ fontSize: 16, color: 'red' }}>❌</Text>
                                    </Pressable>
                                </View>
                            ))}

                            <Pressable
                                onPress={() => {
                                    setNewProduct(prev => ({
                                        ...prev,
                                        inventory: [...(prev.inventory || []), { size: '', color: '', quantity: 0 }]
                                    }));
                                }}
                                style={[globalStyles.smallButton, { width: '100%', marginBottom: 10 }]}
                            >
                                <Text style={{ textAlign: 'center', color: 'white' }}>Add Row</Text>
                            </Pressable>
                            <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>Category</Text>
                            <Pressable
                                onPress={() => setShowCategoryPicker(true)}
                                style={{
                                    borderWidth: 1,
                                    borderColor: '#ccc',
                                    borderRadius: 6,
                                    padding: 10,
                                    marginBottom: 10,
                                    backgroundColor: '#f9f9f9'
                                }}
                            >
                                <Text>{newProduct.category ? newProduct.category : 'Category...'}</Text>
                            </Pressable>

                            <Modal
                                visible={showCategoryPicker}
                                transparent
                                animationType="fade"
                                onRequestClose={() => setShowCategoryPicker(false)}
                            >
                                <Pressable style={{ flex: 1, justifyContent: 'center', backgroundColor: '#00000099' }} onPress={() => setShowCategoryPicker(false)}>
                                    <View style={{ borderRadius: 8, backgroundColor: 'white', padding: 10, height: 200, width: '80%', alignSelf: 'center' }}>
                                        <Picker
                                            selectedValue={newProduct.category}
                                            onValueChange={(value) => {
                                                setNewProduct(prev => ({ ...prev, category: value }));
                                                setShowCategoryPicker(false);
                                            }}
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <Picker.Item label="Category..." value="" />
                                            <Picker.Item label="Dress" value="dress" />
                                            <Picker.Item label="T-Shirts" value="tshirts" />
                                            <Picker.Item label="Pants" value="pants" />
                                            <Picker.Item label="Socks" value="socks" />
                                            <Picker.Item label="Hats" value="hats" />
                                        </Picker>
                                    </View>
                                </Pressable>
                            </Modal>

                            {newProduct.imageUrl ? (
                                <View style={{ borderWidth: 1, borderColor: '#aaa', borderRadius: 8, marginBottom: 10, padding: 2, backgroundColor: '#f5f5f5' }}>
                                    <Image
                                        source={{ uri: newProduct.imageUrl }}
                                        style={{ width: '100%', height: 180, borderRadius: 8 }}
                                        resizeMode="cover"
                                    />
                                </View>
                            ) : null}

                            <Pressable
                                onPress={handlePickImage}
                                style={[globalStyles.smallPillButton, { width: '100%', marginBottom: 15 }]}
                            >
                                <Text style={{ color: 'white' }}>{uploading ? "Uploading..." : "Edit Image"}</Text>
                            </Pressable>

                            {errorMsg ? (
                                <Text style={{ color: 'red', marginBottom: 10, textAlign: 'center' }}>{errorMsg}</Text>
                            ) : null}

                            <View style={{ flexDirection: 'column', gap: 8, marginTop: 10 }}>
                                <Pressable
                                    onPress={handleSaveProduct}
                                    style={[
                                        globalStyles.smallButton,
                                        { backgroundColor: '#2ecc71', marginTop: 8, width: '100%' }
                                    ]}
                                >
                                    <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Save</ThemedText>
                                </Pressable>
                                {editingProduct ? (
                                    <Pressable
                                        onPress={handleDeleteProduct}
                                        style={[
                                            globalStyles.smallButton,
                                            { backgroundColor: '#e74c3c', marginTop: 8, width: '100%' }
                                        ]}
                                    >
                                        <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Delete</ThemedText>
                                    </Pressable>
                                ) : null}
                                <Pressable
                                    onPress={handleCloseModal}
                                    style={[
                                        globalStyles.smallButton,
                                        { backgroundColor: '#888', marginTop: 8, width: '100%' }
                                    ]}
                                >
                                    <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Close</ThemedText>
                                </Pressable>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = {
    card: {
        flexDirection: "row",
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#f2f2f2",
        borderRadius: 10,
        alignItems: "center",
    },
    img: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 10,
    },
};