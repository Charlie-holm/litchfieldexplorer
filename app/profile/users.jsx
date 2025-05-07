import { FlatList, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { db } from '@/firebaseConfig';
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/constants/globalStyles';

export default function UserList() {
    const globalStyles = useGlobalStyles();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

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

    const renderItem = ({ item }) => (
        <ThemedView style={[globalStyles.buttonCard, { flexDirection: 'column', alignItems: 'flex-start' }]}>
            <ThemedText type="subtitle">{item.name || item.email}</ThemedText>
            <ThemedText type="default" style={globalStyles.textMuted}>{item.email}</ThemedText>
            <Pressable
                onPress={() => !item.admin && handleToggleAdmin(item)}
                style={[
                    globalStyles.smallButton,
                    item.admin && { backgroundColor: "#ccc", borderColor: "#ccc" }
                ]}
                disabled={item.admin}
            >
                <ThemedText style={globalStyles.smallPillButtonText}>
                    {item.admin ? "Remove Admin Role" : "Make Admin"}
                </ThemedText>
            </Pressable>
        </ThemedView>
    );

    return (
        <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 15 }}
        />
    );
}