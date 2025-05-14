import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const sizes = ['S', 'M', 'L', 'XL'];
const colors = ['#222', '#666', '#aaa'];

export default function ProductDetailScreen() {
  const { theme: colorScheme } = useThemeContext();
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};
  const [item, setItem] = useState(null);
  const { theme } = useThemeContext();
  const activeTheme = theme === 'auto' ? 'light' : theme;

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setItem({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchItem();
  }, [id]);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          No product data available.
        </ThemedText>
      </ThemedView>
    );
  }

  const imageSource = item.imageUrl ? { uri: item.imageUrl } : tshirtImage;

  const themeColors = Colors[activeTheme];

  return (
    <ThemedView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Back Button */}
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconSymbol
            name="chevron.left" size={24} color={Colors[colorScheme].text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={imageSource} style={styles.image} resizeMode="contain" />

        <View style={[styles.infoContainer, { backgroundColor: themeColors.card }]}>
          <View style={styles.headerRow}>
            <ThemedText type="title" style={[styles.title, { color: themeColors.text }]}>
              {item.name}
            </ThemedText>

            <View style={styles.quantitySelector}>
              <TouchableOpacity onPress={() => setQuantity(prev => Math.max(1, prev - 1))}>
                <Text style={[styles.qtyButton, { backgroundColor: themeColors.border }]}>−</Text>
              </TouchableOpacity>
              <Text style={[styles.qtyValue, { color: themeColors.text }]}>{quantity}</Text>
              <TouchableOpacity onPress={() => setQuantity(prev => prev + 1)}>
                <Text style={[styles.qtyButton, { backgroundColor: themeColors.border }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ThemedText style={[styles.description, { color: themeColors.text }]}>
            {item.description || 'No description available.'}
          </ThemedText>

          <View style={styles.selectorGroup}>
            <Text style={[styles.selectorLabel, { color: themeColors.text }]}>Choose Size</Text>
            <View style={styles.sizeRow}>
              {sizes.map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    {
                      borderColor: themeColors.border,
                      backgroundColor: selectedSize === size
                        ? themeColors.tint
                        : themeColors.background === 'fff' ? '#f0f0f0' : '#222',
                    },
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text
                    style={{
                      color: selectedSize === size
                        ? themeColors.tintText || '#fff'
                        : themeColors.text,
                    }}
                  >
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.selectorGroup}>
            <Text style={[styles.selectorLabel, { color: themeColors.text }]}>Color</Text>
            <View style={styles.colorRow}>
              {colors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: color,
                      borderColor: selectedColor === color ? themeColors.tint : '#ccc',
                      borderWidth: selectedColor === color ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.cartButton, { backgroundColor: themeColors.tint }]}>
            <Text style={[styles.cartText, { color: themeColors.background }]}>
              Add to Cart | {item.price ? `$${item.price}` : 'Price Unavailable'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  image: {
    width: '100%',
    height: 450,
    marginBottom: 16,
  },
  infoContainer: {
    flex: 1,
    width: '100%',
    padding: 24,
    borderRadius: 0,
    marginTop: -20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    flex: 1,
    flexWrap: 'wrap',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    fontSize: 22,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    textAlign: 'center',
  },
  qtyValue: {
    fontSize: 18,
    marginHorizontal: 6,
  },
  description: {
    marginTop: 10,
    fontSize: 14,
  },
  selectorGroup: {
    marginTop: 24,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  sizeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sizeButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  sizeText: {
    fontSize: 14,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  cartButton: {
    marginTop: 32,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  cartText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
