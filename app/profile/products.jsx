import { View, Text, FlatList, Pressable, Image } from "react-native";
import { useEffect, useState } from "react";
import { db } from '@/firebaseConfig';
import { collection, getDocs } from "firebase/firestore";

export default function ProductList() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const load = async () => {
            const snap = await getDocs(collection(db, "products"));
            setProducts(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        };
        load();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.img} />
            <View style={{ flex: 1 }}>
                <Text>{item.name}</Text>
                <Text>${item.price}</Text>
                {/* Add Edit/Delete buttons if needed */}
            </View>
        </View>
    );

    return (
        <FlatList
            data={products}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 10 }}
        />
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