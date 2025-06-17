import { useEffect, useRef, useState } from "react";
import { View, FlatList, Image, Pressable, Alert, Text, Animated, DeviceEventEmitter } from "react-native";
import { Swipeable } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { db, auth } from '@/firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, setDoc, doc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { useNavigation } from "expo-router";
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/constants/globalStyles';
import FormModal from './FormModal';

async function logLastUpdate(collectionName) {
    const userId = auth.currentUser?.uid || "unknown";
    await setDoc(doc(db, "lastupdate", collectionName), {
        updatedAt: serverTimestamp(),
        by: userId,
    });
}

export default function AttractionList() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [attractions, setAttractions] = useState([]);
    const animatedValues = useRef([]).current;
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
            const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setAttractions(items);

            animatedValues.length = items.length;
            for (let i = 0; i < items.length; i++) {
                animatedValues[i] = new Animated.Value(0);
            }

            const animations = items.map((_, index) =>
                Animated.timing(animatedValues[index], {
                    toValue: 1,
                    duration: 400,
                    delay: index * 80,
                    useNativeDriver: true,
                })
            );
            Animated.stagger(80, animations).start();
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

    const renderItem = ({ item, index }) => (
        <Swipeable
            renderRightActions={() => (
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
            )}
        >
            <Animated.View style={{
                opacity: animatedValues[index] || 0,
                transform: [{
                    translateY: (animatedValues[index] || new Animated.Value(0)).interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                    }),
                }]
            }}>
                <Pressable onPress={() => {
                    setEditingAttraction(item);
                    setModalVisible(true);
                }}>
                    <View style={globalStyles.buttonCard}>
                        <View style={globalStyles.buttonCardIcon}>
                            <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="subtitle">{item.name}</ThemedText>
                            <ThemedText type="small">{item.review}</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={28} color={Colors[colorScheme].text} />
                    </View>
                </Pressable>
            </Animated.View>
        </Swipeable>
    );

    const handleSave = async () => {
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
            await logLastUpdate("lastupdate");
            const snap = await getDocs(collection(db, "attractions"));
            setAttractions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            setModalVisible(false);
            setEditingAttraction(null);
            Toast.show({ type: 'success', text1: 'Attraction saved!' });
        } catch (error) {
            console.error("Failed to save attraction:", error);
        }
    };

    const handleDelete = () => {
        Alert.alert('Confirm Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await deleteDoc(doc(db, "attractions", editingAttraction.id));
                    await logLastUpdate("lastupdate");
                    const snap = await getDocs(collection(db, "attractions"));
                    setAttractions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                    setModalVisible(false);
                    setEditingAttraction(null);
                    Toast.show({ type: 'success', text1: 'Attraction deleted.' });
                }
            }
        ]);
    };

    return (
        <ThemedView style={globalStyles.container}>
            <FormModal
                mode="attraction"
                visible={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                    setEditingAttraction(null);
                }}
                editingItem={editingAttraction}
                onSave={handleSave}
                onDelete={handleDelete}
                form={newAttraction}
                setForm={setNewAttraction}
                uploading={uploading}
                handlePickImage={handlePickImage}
            />
            <FlatList
                data={attractions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ marginVertical: 10, paddingHorizontal: 20 }}
                initialNumToRender={6}
                maxToRenderPerBatch={10}
            />
        </ThemedView>
    );
}
