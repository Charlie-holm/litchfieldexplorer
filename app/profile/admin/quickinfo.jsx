import React, { useEffect, useState, useRef } from 'react';
import { FlatList, Pressable, Alert, View, Text, Animated, DeviceEventEmitter } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { collection, addDoc, setDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import FormModal from './FormModal';

async function logLastUpdate(collectionName) {
    const userId = auth.currentUser?.uid || "unknown";
    await setDoc(doc(db, "lastupdate", collectionName), {
        updatedAt: serverTimestamp(),
        by: userId,
    });
}

export default function QuickInfoPanel() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [infos, setInfos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingInfo, setEditingInfo] = useState(null);
    const [form, setForm] = useState({ title: '', message: '' });
    const animatedValues = useRef([]).current;

    useEffect(() => {
        const q = query(collection(db, 'quickInfo'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            animatedValues.length = 0;
            items.forEach((_, i) => {
                animatedValues[i] = new Animated.Value(0);
            });
            setInfos(items);

            const animations = items.map((_, i) =>
                Animated.timing(animatedValues[i], {
                    toValue: 1,
                    duration: 400,
                    delay: i * 80,
                    useNativeDriver: true,
                })
            );
            Animated.stagger(80, animations).start();
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const listener = DeviceEventEmitter.addListener('triggerAddOverlay', () => {
            setForm({ title: '', message: '' });
            setEditingInfo(null);
            setModalVisible(true);
        });
        return () => listener.remove();
    }, []);

    const handleSave = async () => {
        const payload = {
            title: form.title.trim(),
            message: form.message.trim(),
            timestamp: serverTimestamp(),
        };
        if (!payload.title || !payload.message) return;

        try {
            if (editingInfo) {
                await updateDoc(doc(db, "quickInfo", editingInfo.id), payload);
            } else {
                await addDoc(collection(db, "quickInfo"), payload);
            }
            await logLastUpdate("lastupdate");
            setModalVisible(false);
            setEditingInfo(null);
            setForm({ title: '', message: '' });
        } catch (error) {
            console.error("Failed to save info:", error);
        }
    };

    const handleDelete = () => {
        Alert.alert('Confirm Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    if (!editingInfo) return;
                    try {
                        await deleteDoc(doc(db, "quickInfo", editingInfo.id));
                        await logLastUpdate("lastupdate");
                        setModalVisible(false);
                        setEditingInfo(null);
                    } catch (error) {
                        console.error("Failed to delete info:", error);
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item, index }) => (
        <Swipeable
            renderRightActions={() => (
                <View style={globalStyles.buttonRemove}>
                    <Pressable
                        onPress={() => {
                            Alert.alert(
                                'Delete Info',
                                'Are you sure you want to delete this quick info?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                await deleteDoc(doc(db, "quickInfo", item.id));
                                            } catch (error) {
                                                console.error("Failed to delete info:", error);
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
            <Animated.View style={{
                opacity: animatedValues[index] || 0,
                transform: [{
                    translateY: (animatedValues[index] || new Animated.Value(0)).interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                    })
                }]
            }}>
                <Pressable onPress={() => {
                    setForm({ title: item.title || '', message: item.message || '' });
                    setEditingInfo(item);
                    setModalVisible(true);
                }}>
                    <ThemedView style={globalStyles.buttonCard}>
                        <View style={globalStyles.buttonLeft}>
                            <ThemedText type="subtitle">{item.title || '(No title)'}</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={28} />
                    </ThemedView>
                </Pressable>
            </Animated.View>
        </Swipeable>
    );

    return (
        <ThemedView style={globalStyles.container}>
            <FormModal
                mode="quickinfo"
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
            <FlatList
                data={infos}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ marginVertical: 10, paddingHorizontal: 20 }}
            />
        </ThemedView>
    );
}