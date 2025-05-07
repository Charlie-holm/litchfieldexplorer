import { View, Text, FlatList, Image } from "react-native";
import { useEffect, useState } from "react";
import { db } from '@/firebaseConfig';
import { collection, getDocs } from "firebase/firestore";

export default function AttractionList() {
    const [attractions, setAttractions] = useState([]);

    useEffect(() => {
        const load = async () => {
            const snap = await getDocs(collection(db, "attractions"));
            setAttractions(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        };
        load();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.img} />
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.sub}>{item.description?.slice(0, 50)}...</Text>
            </View>
        </View>
    );

    return (
        <FlatList
            data={attractions}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10 }}
        />
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