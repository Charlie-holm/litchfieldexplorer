import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const sizes = ['S', 'M', 'L', 'XL'];
const colors = ['#222', '#aaa'];

export default function ProductDetailScreen() {
  const { theme: colorScheme } = useThemeContext();
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState(colors[0]);

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

  if (!item) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">No product data available.</ThemedText>
      </ThemedView>
    );
  }

  const themeColors = Colors[colorScheme];
  const imageSource = item.imageUrl ? { uri: item.imageUrl } : null;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconSymbol name="chevron.left" size={24} color={themeColors.text} />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={imageSource} style={styles.image} resizeMode="contain" />

        <ThemedView style={styles.contentSection}>
          <ThemedView style={styles.nameRow}>
            <ThemedText type="title" style={styles.title}>{item.name}</ThemedText>
            <ThemedView style={styles.quantityInline}>
              <TouchableOpacity onPress={() => setQuantity(prev => Math.max(1, prev - 1))}>
                <ThemedText style={[styles.qtyButton, { backgroundColor: themeColors.border }]}>−</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.qtyValue}>{quantity}</ThemedText>
              <TouchableOpacity onPress={() => setQuantity(prev => prev + 1)}>
                <ThemedText style={[styles.qtyButton, { backgroundColor: themeColors.border }]}>+</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.description}>
            {item.description || 'No description available.'}
          </ThemedText>

          <ThemedView style={[styles.divider, { backgroundColor: themeColors.border }]} />

          <ThemedView style={styles.selectorCombinedRow}>
            <ThemedView style={styles.selectorGroup}>
              <ThemedText style={styles.selectorLabel}>Size</ThemedText>
              <ThemedView style={styles.sizeRow}>
                {sizes.map(size => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.sizeButton,
                      {
                        borderColor: themeColors.border,
                        backgroundColor: selectedSize === size
                          ? themeColors.tint
                          : themeColors.cardBackground,
                      },
                    ]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <ThemedText
                      style={{
                        fontSize: 12,
                        color: selectedSize === size
                          ? themeColors.tintText
                          : themeColors.text,
                      }}
                    >
                      {size}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.selectorGroup}>
              <ThemedText style={styles.selectorLabel}>Color</ThemedText>
              <ThemedView style={styles.colorRow}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: color,
                        borderColor: selectedColor === color
                          ? themeColors.tint
                          : themeColors.border,
                        borderWidth: selectedColor === color ? 2 : 1,
                      },
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity
            style={[styles.cartButton, { backgroundColor: themeColors.tint }]}
            onPress={() => alert(`Added ${item.name} to cart.`)}
          >
            <ThemedText style={[styles.cartText, { color: themeColors.tintText }]}>
              Add to Cart | {item.price ? `$${item.price}` : 'Price Unavailable'}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  image: {
    width: '94%',
    height: 400,
    alignSelf: 'center',
    borderRadius: 12,
  },
  contentSection: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    marginTop: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
  },
  selectorCombinedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectorGroup: {
    flex: 1,
    marginRight: 12,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sizeButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  quantityInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyButton: {
    fontSize: 18,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  qtyValue: {
    fontSize: 16,
    marginHorizontal: 6,
  },
  cartButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
  },
  cartText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
