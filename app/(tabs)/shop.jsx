import { FlatList, Image, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useState } from 'react';
import { useGlobalStyles } from '@/constants/globalStyles';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';

const categories = [
    { key: 'all', label: 'All Items', icon: 'square.grid.2x2' },
    { key: 'dress', label: 'Dress', icon: 'figure.dress.line.vertical.figure' },
    { key: 'tshirts', label: 'T-Shirts', icon: 'tshirt' },
    { key: 'pants', label: 'Pants', icon: 'figure.walk' },
];

const items = [
    { id: '1', title: 'NT-styled Dress', category: 'dress', price: '$59.99', image: require('@/assets/images/icon.png') },
    { id: '2', title: 'Darwin Sunrise Sock', category: 'socks', price: '$9.99', image: require('@/assets/images/icon.png') },
    { id: '3', title: 'Litchfield T-shirt', category: 'tshirts', price: '$29.99', image: require('@/assets/images/icon.png') },
    { id: '5', title: 'Darwin-styled Pant', category: 'pants', price: '$49.99', image: require('@/assets/images/icon.png') },
    { id: '6', title: 'NT-styled Dress', category: 'dress', price: '$59.99', image: require('@/assets/images/icon.png') },
    { id: '7', title: 'Darwin Sunrise Sock', category: 'socks', price: '$9.99', image: require('@/assets/images/icon.png') },
    { id: '8', title: 'Litchfield T-shirt', category: 'tshirts', price: '$29.99', image: require('@/assets/images/icon.png') },
    { id: '9', title: 'Darwin-styled Pant', category: 'pants', price: '$49.99', image: require('@/assets/images/icon.png') },
];

export default function ShopScreen() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();

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
                                    ? Colors[colorScheme].iconSelected
                                    : Colors[colorScheme].icon
                            }
                        />
                        <ThemedText
                            style={{
                                color:
                                    selectedCategory === cat.key
                                        ? Colors[colorScheme].iconSelected
                                        : Colors[colorScheme].text,
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
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ThemedView style={[
                        globalStyles.itemCard,
                        {
                            borderWidth: 1,
                            borderColor: Colors[colorScheme].border,
                            backgroundColor: Colors[colorScheme].card,
                        },
                    ]}>
                        <Image source={item.image} style={globalStyles.itemImage} resizeMode="contain" />
                        <ThemedText style={globalStyles.itemTitle}>{item.title}</ThemedText>
                        <ThemedText style={globalStyles.itemCategory}>{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</ThemedText>
                        <ThemedText style={globalStyles.itemPrice}>{item.price}</ThemedText>
                    </ThemedView>
                )}
            />
        </ThemedView>
    );
}
