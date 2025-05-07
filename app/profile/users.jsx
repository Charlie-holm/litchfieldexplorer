import { FlatList, Pressable, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { db } from '@/firebaseConfig';
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/constants/globalStyles';
import { Ionicons } from '@expo/vector-icons';

export default function UserList() {
    const globalStyles = useGlobalStyles();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingPoints, setEditingPoints] = useState({});
    const [expandedUserId, setExpandedUserId] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const snapshot = await getDocs(collection(db, "users"));
            setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        };
        fetchUsers();
    }, []);

    const handleToggleAdmin = async (user) => {
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, { admin: !user.admin });
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const handleRemoveUser = async (user) => {
        const userRef = doc(db, "users", user.id);
        await deleteDoc(userRef);
        const snapshot = await getDocs(collection(db, "users"));
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    const handleSavePoints = async (user) => {
        const userRef = doc(db, "users", user.id);
        const pointsValue = parseInt(editingPoints[user.id], 10);
        if (!isNaN(pointsValue)) {
            await updateDoc(userRef, { points: pointsValue });
            const snapshot = await getDocs(collection(db, "users"));
            setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        }
    };

    const renderItem = ({ item }) => {
        const isExpanded = expandedUserId === item.id;

        return (
            <Pressable onPress={() => setExpandedUserId(isExpanded ? null : item.id)}>
                <ThemedView style={[globalStyles.buttonCard, { flexDirection: 'column' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <View >
                            <ThemedText type="subtitle">{item.name || item.email}</ThemedText>
                            <ThemedText type="small">{item.email}</ThemedText>
                            <ThemedText type="small">Points: {item.points || 0}</ThemedText>
                        </View>
                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={24}
                            color="gray"
                        />
                    </View>

                    {isExpanded && (
                        <View style={{ alignItems: 'flex-start', width: '100%' }}>
                            <TextInput
                                style={[globalStyles.thinInputTextBox, { width: 100, marginTop: 8, marginBottom: 8 }]}
                                keyboardType="numeric"
                                value={editingPoints[item.id] !== undefined ? String(editingPoints[item.id]) : String(item.points || 0)}
                                onChangeText={(text) => setEditingPoints(prev => ({ ...prev, [item.id]: text }))}
                            />
                            <Pressable
                                onPress={() => handleSavePoints(item)}
                                style={[globalStyles.smallButton, { backgroundColor: '#3498db', borderColor: '#3498db', marginBottom: 8 }]}
                            >
                                <ThemedText style={{ color: 'white' }}>Save Points</ThemedText>
                            </Pressable>
                            <Pressable
                                onPress={() => handleToggleAdmin(item)}
                                style={[
                                    globalStyles.smallButton,
                                    item.admin
                                        ? { backgroundColor: '#ff69b4', borderColor: '#ff69b4' }
                                        : { backgroundColor: '#2ecc71', borderColor: '#2ecc71' }
                                ]}
                            >
                                <ThemedText style={{ color: 'white' }}>
                                    {item.admin ? "Remove Admin Role" : "Make Admin"}
                                </ThemedText>
                            </Pressable>
                            <Pressable
                                onPress={() => handleRemoveUser(item)}
                                style={[globalStyles.smallButton, { backgroundColor: '#e74c3c', borderColor: '#e74c3c', marginTop: 8 }]}
                            >
                                <ThemedText style={{ color: 'white' }}>Remove User</ThemedText>
                            </Pressable>
                        </View>
                    )}
                </ThemedView>
            </Pressable>
        );
    };

    return (
        <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 15 }}
        />
    );
}