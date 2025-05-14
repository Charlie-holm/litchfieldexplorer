import { FlatList, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useEffect, useState } from 'react';
import { useGlobalStyles } from '@/constants/globalStyles';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { router } from 'expo-router';


const categories = [
    { key: 'all', label: 'All Items', icon: 'square.grid.2x2' },
    { key: 'dress', label: 'Dress', icon: 'figure.dress.line.vertical.figure' },
    { key: 'tshirts', label: 'T-Shirts', icon: 'tshirt' },
    { key: 'pants', label: 'Pants', icon: 'figure.walk' },
];

export default function ShopScreen() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [items, setItems] = useState([]);
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const navigation = useNavigation();

    useEffect(() => {
        const fetchItems = async () => {
            const snapshot = await getDocs(collection(db, 'products'));
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setItems(data);
        };
        fetchItems();
    }, []);

    const filteredItems = selectedCategory === 'all' ? items : items.filter(item => item.category === selectedCategory);

    return (
        <ThemedView style={globalStyles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={globalStyles.categoryContainer}
            >
                {categories.map(cat => (
                    <TouchableOpacity
                        key={cat.key}
                        style={[
                            globalStyles.categoryButton,
                            selectedCategory === cat.key && globalStyles.categoryButtonSelected,
                        ]}
                        onPress={() => setSelectedCategory(cat.key)}
                    >
                        <IconSymbol
                            name={cat.icon}
                            size={20}
                            color={
                                selectedCategory === cat.key
                                    ? Colors[colorScheme].pri
                                    : Colors[colorScheme].highlight
                            }
                        />
                        <ThemedText
                            style={{
                                color:
                                    selectedCategory === cat.key
                                        ? Colors[colorScheme].pri
                                        : Colors[colorScheme].highlight,
                            }}
                        >
                            {cat.label}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <FlatList
                data={filteredItems}
                style={globalStyles.shopItemContainer}
                contentContainerStyle={{ paddingBottom: 30 }}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/productdetail/${item.id}`)}
                        style={globalStyles.productCard}
                    >
                        <Image
                            source={{ uri: item.imageUrl }}
                            style={[globalStyles.image, { height: Dimensions.get('window').width * 0.4, marginBottom: 10 }]}
                            resizeMode="cover"
                        />
                        <ThemedView style={globalStyles.productCardContent}>
                            <ThemedText type="defaultBold" >{item.name}</ThemedText>
                            <ThemedText type="small" style={{ color: 'gray' }}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</ThemedText>
                            <ThemedText type="defaultSemiBold">${item.price}</ThemedText>
                        </ThemedView>
                    </TouchableOpacity>
                )
                }
            />
        </ThemedView >
    );
}
