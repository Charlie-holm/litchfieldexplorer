import { View, Text, FlatList, Image, Pressable, Modal, TextInput, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";
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
        status: '',
        facilities: '',
        activities: '',
        location: '',
        imageUrl: ''
    });
    const [editingAttraction, setEditingAttraction] = useState(null);

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
                review: editingAttraction.review || '',
                facilities: editingAttraction.facilities || [],
                activities: editingAttraction.activities || [],
                location: editingAttraction.location || '',
                imageUrl: editingAttraction.imageUrl || '',
                statusLabel: editingAttraction.status?.[0]?.split(' - ')[0] || '',
                statusOpen: editingAttraction.status?.[0]?.includes('Open') || false,
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
                <Pressable
                    onPress={() => {
                        setModalVisible(false);
                        setEditingAttraction(null);
                    }}
                    style={{ flex: 1, backgroundColor: '#000000aa', justifyContent: 'center' }}
                >
                    <View style={{ backgroundColor: 'white', margin: 20, padding: 20, borderRadius: 10, maxHeight: '60%' }}>
                        <ScrollView>
                            {['name', 'description', 'review', 'status', 'facilities', 'activities', 'location', 'imageUrl'].map((field) => (
                                <TextInput
                                    key={field}
                                    placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                    value={newAttraction[field]}
                                    onChangeText={(text) => setNewAttraction(prev => ({ ...prev, [field]: text }))}
                                    style={{ borderBottomWidth: 1, marginBottom: 10 }}
                                />
                            ))}
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
                                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                                >
                                    <View style={{
                                        width: 20,
                                        height: 20,
                                        borderWidth: 1,
                                        borderColor: '#333',
                                        backgroundColor: newAttraction.facilities?.includes(option) ? '#333' : '#fff',
                                        marginRight: 10,
                                    }} />
                                    <Text>{option}</Text>
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
                                    style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}
                                >
                                    <View style={{
                                        width: 20,
                                        height: 20,
                                        borderWidth: 1,
                                        borderColor: '#333',
                                        backgroundColor: newAttraction.activities?.includes(option) ? '#333' : '#fff',
                                        marginRight: 10,
                                    }} />
                                    <Text>{option}</Text>
                                </Pressable>
                            ))}
                            <Pressable
                                onPress={async () => {
                                    try {
                                        const dataToSave = {
                                            ...newAttraction,
                                            status: newAttraction.statusLabel
                                                ? [`${newAttraction.statusLabel} - ${newAttraction.statusOpen ? 'Open' : 'Closed'}`]
                                                : [],
                                        };
                                        delete dataToSave.statusLabel;
                                        delete dataToSave.statusOpen;

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
                                style={{ marginTop: 10, backgroundColor: '#2ecc71', padding: 10, borderRadius: 6 }}
                            >
                                <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Save</Text>
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
                                    style={{ marginTop: 10, backgroundColor: '#e74c3c', padding: 10, borderRadius: 6 }}
                                >
                                    <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>Delete</Text>
                                </Pressable>
                            )}
                            <Pressable
                                onPress={() => {
                                    setModalVisible(false);
                                    setEditingAttraction(null);
                                }}
                                style={{ marginTop: 10, backgroundColor: '#ccc', padding: 10, borderRadius: 6 }}
                            >
                                <Text style={{ textAlign: 'center' }}>Close</Text>
                            </Pressable>
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
            <FlatList
                data={attractions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 10 }}
            />
        </View>
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