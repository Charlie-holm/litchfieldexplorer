import { View, Text, FlatList, Image, Pressable, Modal, TextInput, ScrollView, Alert } from "react-native";
import { useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { auth } from '@/firebaseConfig';
import { db } from '@/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { useNavigation } from "expo-router";
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/constants/globalStyles';

export default function AttractionList() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [attractions, setAttractions] = useState([]);
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);
    const [newAttraction, setNewAttraction] = useState({
        name: '',
        description: '',
        review: '',
        statusEntries: [],
        facilities: [],
        activities: [],
        location: '',
        imageUrl: ''
    });
    const [editingAttraction, setEditingAttraction] = useState(null);
    const [uploading, setUploading] = useState(false);
    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert("Permission Denied", "You need to allow access to your photos to upload an image.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            const formData = new FormData();

            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: `${auth.currentUser.uid}-${Date.now()}.jpg`,
            });
            formData.append('upload_preset', 'attractions');
            formData.append('folder', 'attractions');

            try {
                setUploading(true);
                const response = await fetch("https://api.cloudinary.com/v1_1/djrzkaal4/image/upload", {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (data.secure_url) {
                    setNewAttraction(prev => ({ ...prev, imageUrl: data.secure_url }));
                    Alert.alert("Image Uploaded!", "Attraction image updated.");
                } else {
                    Alert.alert('Upload Failed', JSON.stringify(data));
                }
            } catch (err) {
                Alert.alert('Error', 'Failed to upload image');
            } finally {
                setUploading(false);
            }
        }
    };

    useEffect(() => {
        const load = async () => {
            const snap = await getDocs(collection(db, "attractions"));
            setAttractions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        };
        load();
    }, []);

    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener('triggerAddOverlay', (detail) => {
            if (detail === 'attractions') {
                setNewAttraction({
                    name: '',
                    description: '',
                    review: '',
                    statusEntries: [],
                    facilities: [],
                    activities: [],
                    location: '',
                    imageUrl: ''
                });
                setEditingAttraction(null);
                setModalVisible(true);
            }
        });
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (editingAttraction) {
            setNewAttraction({
                name: editingAttraction.name || '',
                description: editingAttraction.description || '',
                review: editingAttraction.review?.toString() ?? '',
                facilities: editingAttraction.facilities || [],
                activities: editingAttraction.activities || [],
                location: editingAttraction.location || '',
                imageUrl: editingAttraction.imageUrl || '',
                statusEntries: editingAttraction.status?.map(statusItem => {
                    const [label, open] = statusItem.split(' - ');
                    return { label, open: open === 'Open' };
                }) || [],
            });
        }
    }, [editingAttraction]);

    const renderItem = ({ item }) => (
        <Pressable
            onPress={() => {
                setEditingAttraction(item);
                setModalVisible(true);
            }}
        >
            <ThemedView style={globalStyles.buttonCard}>
                <ThemedView style={globalStyles.buttonLeft}>
                    <ThemedText type="subtitle">{item.name}</ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={28} color={Colors[colorScheme].text} />
            </ThemedView>
        </Pressable>
    );

    return (
        <View style={{ flex: 1 }}>
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: '#000000aa', justifyContent: 'center' }}>
                    <Pressable
                        onPress={() => {
                            setModalVisible(false);
                            setEditingAttraction(null);
                        }}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                    />
                    <View style={{ backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 10, maxHeight: '60%' }}>
                        <ScrollView>
                            {['name', 'description', 'review', 'location'].map((field) => (
                                <TextInput
                                    key={field}
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                    value={newAttraction[field]}
                                    onChangeText={(text) => {
                                        setNewAttraction(prev => ({ ...prev, [field]: text }));
                                    }}
                                    keyboardType={field === 'review' ? 'decimal-pad' : 'default'}
                                    style={[globalStyles.thinInputTextBox, { marginBottom: 10 }]}
                                />
                            ))}

                            <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>Status</Text>
                            {(newAttraction.statusEntries || []).map((entry, index) => (
                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <TextInput
                                        placeholder="Status label"
                                        value={entry.label}
                                        onChangeText={(text) => {
                                            const updated = [...newAttraction.statusEntries];
                                            updated[index].label = text;
                                            setNewAttraction(prev => ({ ...prev, statusEntries: updated }));
                                        }}
                                        style={[globalStyles.thinInputTextBox, { marginRight: 10, flex: 1 }]}
                                    />
                                    <Pressable
                                        onPress={() => {
                                            const updated = [...newAttraction.statusEntries];
                                            updated[index].open = !updated[index].open;
                                            setNewAttraction(prev => ({ ...prev, statusEntries: updated }));
                                        }}
                                        style={[globalStyles.smallButton, { backgroundColor: entry.open ? 'green' : 'red', width: 90 }]}
                                    >
                                        <Text style={{ color: 'white' }}>{entry.open ? 'Open' : 'Closed'}</Text>
                                    </Pressable>
                                </View>
                            ))}

                            <Pressable
                                onPress={() => {
                                    setNewAttraction(prev => ({
                                        ...prev,
                                        statusEntries: [...(prev.statusEntries || []), { label: '', open: true }]
                                    }));
                                }}
                                style={[globalStyles.smallButton, { width: '100%', marginBottom: 10 }]}
                            >
                                <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Add Status Label</Text>
                            </Pressable>

                            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Facilities</Text>
                            {[
                                'BBQ - Gas',
                                'BBQ - Wood',
                                'Camper Trailers',
                                'Coffee',
                                'ECD',
                                'Free Wi-fi',
                                'Information Sign',
                                'Public Toilet',
                                'Water',
                                'Caravan',
                                'Disabled Access',
                                'Food',
                                'Firepit',
                                'Phone',
                                'Shower',
                                'Heritage'
                            ].map(option => (
                                <Pressable
                                    key={option}
                                    onPress={() => {
                                        const updated = newAttraction.facilities?.includes(option)
                                            ? newAttraction.facilities.filter(f => f !== option)
                                            : [...(newAttraction.facilities || []), option];
                                        setNewAttraction(prev => ({ ...prev, facilities: updated }));
                                    }}
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}
                                >
                                    {newAttraction.facilities?.includes(option) ? (
                                        <IconSymbol
                                            name="checkmark"
                                            size={18}
                                            color={Colors[colorScheme].text}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderWidth: 1,
                                                borderColor: Colors[colorScheme].text,
                                                textAlign: 'center',
                                            }}
                                        />
                                    ) : (
                                        <View
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderWidth: 1,
                                                borderColor: Colors[colorScheme].text,
                                            }}
                                        />
                                    )}
                                    <ThemedText type="default">{option}</ThemedText>
                                </Pressable>
                            ))}
                            <Text style={{ fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>Activities</Text>
                            {[
                                '4WD',
                                'Campground Hosting',
                                'Camping',
                                'Picnic',
                                'Sightseeing',
                                'Swimming',
                                'Walking'
                            ].map(option => (
                                <Pressable
                                    key={option}
                                    onPress={() => {
                                        const updated = newAttraction.activities?.includes(option)
                                            ? newAttraction.activities.filter(a => a !== option)
                                            : [...(newAttraction.activities || []), option];
                                        setNewAttraction(prev => ({ ...prev, activities: updated }));
                                    }}
                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 }}
                                >
                                    {newAttraction.activities?.includes(option) ? (
                                        <IconSymbol
                                            name="checkmark"
                                            size={18}
                                            color={Colors[colorScheme].text}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderWidth: 1,
                                                borderColor: Colors[colorScheme].text,
                                                textAlign: 'center',
                                            }}
                                        />
                                    ) : (
                                        <View
                                            style={{
                                                width: 18,
                                                height: 18,
                                                borderWidth: 1,
                                                borderColor: Colors[colorScheme].text,
                                            }}
                                        />
                                    )}
                                    <ThemedText type="default">{option}</ThemedText>
                                </Pressable>
                            ))}
                            {newAttraction.imageUrl ? (
                                <View style={{ borderWidth: 1, borderColor: '#aaa', borderRadius: 8, marginBottom: 10, padding: 2, backgroundColor: '#f5f5f5' }}>
                                    <Image
                                        source={{ uri: newAttraction.imageUrl }}
                                        style={{ width: '100%', height: 180, borderRadius: 8 }}
                                        resizeMode="cover"
                                    />
                                </View>
                            ) : null}
                            <Pressable
                                onPress={handlePickImage}
                                style={[globalStyles.smallPillButton, { width: '100%', marginBottom: 15 }]}
                            >
                                <ThemedText type="default" style={{ color: '#fff' }}>
                                    {uploading ? "Uploading..." : "Edit Image"}
                                </ThemedText>
                            </Pressable>
                            <Pressable
                                onPress={async () => {
                                    try {
                                        const dataToSave = {
                                            ...newAttraction,
                                            review: parseFloat(newAttraction.review) || 0,
                                            status: (newAttraction.statusEntries || []).map(entry => `${entry.label} - ${entry.open ? 'Open' : 'Closed'}`),
                                        };

                                        const snapshot = await getDocs(collection(db, "attractions"));
                                        const existing = snapshot.docs.find(doc =>
                                            doc.data().name.toLowerCase() === dataToSave.name.toLowerCase() &&
                                            (!editingAttraction || doc.id !== editingAttraction.id)
                                        );
                                        if (existing) {
                                            alert('Place name must be unique.');
                                            return;
                                        }

                                        if (editingAttraction) {
                                            await updateDoc(doc(db, "attractions", editingAttraction.id), dataToSave);
                                        } else {
                                            await addDoc(collection(db, "attractions"), dataToSave);
                                        }
                                        const snap = await getDocs(collection(db, "attractions"));
                                        setAttractions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                                        setModalVisible(false);
                                        setEditingAttraction(null);
                                    } catch (error) {
                                        console.error("Failed to save attraction:", error);
                                    }
                                }}
                                style={[globalStyles.smallButton, { backgroundColor: '#2ecc71', marginTop: 8, width: '100%' }]}
                            >
                                <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Save</ThemedText>
                            </Pressable>
                            {editingAttraction && (
                                <Pressable
                                    onPress={async () => {
                                        try {
                                            await deleteDoc(doc(db, "attractions", editingAttraction.id));
                                            const snap = await getDocs(collection(db, "attractions"));
                                            setAttractions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                                            setModalVisible(false);
                                            setEditingAttraction(null);
                                        } catch (error) {
                                            console.error("Failed to delete attraction:", error);
                                        }
                                    }}
                                    style={[globalStyles.smallButton, { backgroundColor: '#e74c3c', marginTop: 8, width: '100%' }]}
                                >
                                    <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Delete</ThemedText>
                                </Pressable>
                            )}
                            <Pressable
                                onPress={() => {
                                    setModalVisible(false);
                                    setEditingAttraction(null);
                                }}
                                style={[globalStyles.smallButton, { marginTop: 8, width: '100%' }]}
                            >
                                <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Close</ThemedText>
                            </Pressable>
                        </ScrollView>
                    </View>
                </View>
            </Modal >
            <FlatList
                data={attractions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 10 }}
            />
        </View >
    );
}

const styles = {
    card: {
        flexDirection: "row",
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#eef0f3",
        borderRadius: 10,
        alignItems: "center",
    },
    img: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
    },
    sub: {
        fontSize: 13,
        color: "#555",
    },
};