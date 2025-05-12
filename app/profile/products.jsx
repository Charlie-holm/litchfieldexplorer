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

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const globalStyles = useGlobalStyles();
    const [modalVisible, setModalVisible] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: '',
        price: '',
        description: '',
        stockEntries: [],
        color: '',
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
                    stockEntries: [],
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
            stockEntries: product.stockEntries || [],
            color: product.color || '',
            imageUrl: product.imageUrl || '',
        });
        setErrorMsg('');
        setModalVisible(true);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.img} />
            <View style={{ flex: 1 }}>
                <Text>{item.name}</Text>
                <Text>${item.price}</Text>
            </View>
            <Pressable
                onPress={() => handleEditProduct(item)}
                style={{
                    backgroundColor: "#333",
                    padding: 8,
                    borderRadius: 6,
                    marginLeft: 8,
                    alignSelf: "flex-start"
                }}
            >
                <Text style={{ color: "white" }}>Edit</Text>
            </Pressable>
        </View>
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
                            {(newProduct.stockEntries || []).map((sizeBlock, sIdx) => (
                                <View key={sIdx} style={{ marginBottom: 12 }}>
                                    <TextInput
                                        placeholder="Size"
                                        value={sizeBlock.size}
                                        onChangeText={(text) => {
                                            const updated = [...newProduct.stockEntries];
                                            updated[sIdx].size = text;
                                            setNewProduct(prev => ({ ...prev, stockEntries: updated }));
                                        }}
                                        style={[globalStyles.thinInputTextBox, { marginBottom: 6 }]}
                                    />
                                    {(sizeBlock.colors || []).map((colorBlock, cIdx) => (
                                        <View key={cIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                            <TextInput
                                                placeholder="Color"
                                                value={colorBlock.color}
                                                onChangeText={(text) => {
                                                    const updated = [...newProduct.stockEntries];
                                                    updated[sIdx].colors[cIdx].color = text;
                                                    setNewProduct(prev => ({ ...prev, stockEntries: updated }));
                                                }}
                                                style={[globalStyles.thinInputTextBox, { flex: 1 }]}
                                            />
                                            <TextInput
                                                placeholder="Qty"
                                                value={colorBlock.quantity?.toString() || ''}
                                                onChangeText={(text) => {
                                                    const updated = [...newProduct.stockEntries];
                                                    updated[sIdx].colors[cIdx].quantity = parseInt(text) || 0;
                                                    setNewProduct(prev => ({ ...prev, stockEntries: updated }));
                                                }}
                                                keyboardType="numeric"
                                                style={[globalStyles.thinInputTextBox, { width: 70 }]}
                                            />
                                        </View>
                                    ))}
                                    <Pressable
                                        onPress={() => {
                                            const updated = [...newProduct.stockEntries];
                                            updated[sIdx].colors = [...(updated[sIdx].colors || []), { color: '', quantity: 0 }];
                                            setNewProduct(prev => ({ ...prev, stockEntries: updated }));
                                        }}
                                        style={[globalStyles.smallButton, { width: '100%', marginBottom: 6 }]}
                                    >
                                        <Text style={{ textAlign: 'center', color: 'white' }}>Add Color</Text>
                                    </Pressable>
                                </View>
                            ))}
                            <Pressable
                                onPress={() => {
                                    setNewProduct(prev => ({
                                        ...prev,
                                        stockEntries: [...(prev.stockEntries || []), { size: '', colors: [] }]
                                    }));
                                }}
                                style={[globalStyles.smallButton, { width: '100%', marginBottom: 10 }]}
                            >
                                <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Add Size</Text>
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
                                    <View style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: 'white' }}>
                                        <Picker
                                            selectedValue={newProduct.category}
                                            onValueChange={(value) => {
                                                setNewProduct(prev => ({ ...prev, category: value }));
                                                setShowCategoryPicker(false);
                                            }}
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
                                        { backgroundColor: '#1f8c42', marginTop: 8, width: '100%' }
                                    ]}
                                >
                                    <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Save</ThemedText>
                                </Pressable>
                                {editingProduct ? (
                                    <Pressable
                                        onPress={handleDeleteProduct}
                                        style={[
                                            globalStyles.smallButton,
                                            { backgroundColor: '#bc2c2c', marginTop: 8, width: '100%' }
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