import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { attractions, products, tabs } from '@/context/allItems';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

const allItems = [
    ...attractions,
    ...products,
    ...tabs,
];

export default function SearchItemsAdminScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme];

    const renderItem = ({ item }) => (
        <ThemedView style={styles.itemContainer}>
            <ThemedText type="subtitle">{item.name}</ThemedText>
            <ThemedText type="default">{item.description || item.route}</ThemedText>
            <ThemedText type="small" style={{ color: theme.tint }}>{item.type.toUpperCase()}</ThemedText>
        </ThemedView>
    );

    return (
        <FlatList
            data={allItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
        />
    );
}

const styles = StyleSheet.create({
    listContainer: {
        padding: 16,
    },
    itemContainer: {
        backgroundColor: '#f5f5f5',
        marginBottom: 12,
        padding: 16,
        borderRadius: 10,
    },
});