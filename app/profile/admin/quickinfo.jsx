import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, Alert } from 'react-native';
import { DeviceEventEmitter } from 'react-native';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import FormModal from './FormModal';

export default function QuickInfoPanel() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [infos, setInfos] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingInfo, setEditingInfo] = useState(null);
    const [form, setForm] = useState({ title: '', message: '' });

    useEffect(() => {
        const q = query(collection(db, 'quickInfo'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setInfos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
                        setModalVisible(false);
                        setEditingInfo(null);
                    } catch (error) {
                        console.error("Failed to delete info:", error);
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <Pressable onPress={() => {
            setForm({ title: item.title || '', message: item.message || '' });
            setEditingInfo(item);
            setModalVisible(true);
        }}>
            <ThemedView style={globalStyles.buttonCard}>
                <ThemedView style={globalStyles.buttonLeft}>
                    <ThemedText type="subtitle">{item.title || '(No title)'}</ThemedText>
                </ThemedView>
                <IconSymbol name="chevron.right" size={28} color={Colors[colorScheme].text} />
            </ThemedView>
        </Pressable>
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
                contentContainerStyle={{ marginVertical: 10, padding: 10 }}
            />
        </ThemedView>
    );
}