import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
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
          <IconSymbol name="chevron.left" size={24} color={themeColors.pri} />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={imageSource} style={styles.image} resizeMode="contain" />

        <ThemedView style={styles.contentSection}>
          <ThemedView style={styles.nameRow}>
            <ThemedText type="title" style={styles.title}>{item.name}</ThemedText>
            <ThemedView style={styles.quantityInline}>
              <TouchableOpacity onPress={() => setQuantity(prev => Math.max(1, prev - 1))}>
                <ThemedText style={[styles.qtyButton, { backgroundColor: themeColors.border, color: themeColors.text }]}>−</ThemedText>
              </TouchableOpacity>

              <ThemedText style={[styles.qtyValue, { color: themeColors.text }]}>{quantity}</ThemedText>

              <TouchableOpacity onPress={() => setQuantity(prev => prev + 1)}>
                <ThemedText style={[styles.qtyButton, { backgroundColor: themeColors.border, color: themeColors.text }]}>+</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.description}>
            {item.description || 'No description available.'}
          </ThemedText>

          <ThemedView style={styles.longDivider} />

          <ThemedView style={styles.selectorCombinedRow}>
            {/* SIZE SELECTOR */}
            <ThemedView style={styles.selectorGroup}>
              <ThemedText style={styles.selectorLabel}>Size</ThemedText>
              <ThemedView style={styles.sizeRow}>
  {sizes.map(size => {
    const isSelected = selectedSize === size;

    return (
      <TouchableOpacity
        key={size}
        onPress={() => setSelectedSize(size)}
        style={[
          styles.sizeButton,
          {
            backgroundColor: isSelected ? themeColors.tint : themeColors.cardBackground,
            borderColor: isSelected ? themeColors.tint : themeColors.border,
          },
        ]}
      >
        <ThemedText
          style={{
            fontSize: 14,
            fontWeight: '500',
            color: isSelected ? themeColors.tintText : themeColors.text,
          }}
        >
          {size}
        </ThemedText>
      </TouchableOpacity>
    );
  })}
</ThemedView>

            </ThemedView>

            {/* COLOR SELECTOR */}
            <ThemedView style={styles.selectorGroup}>
              <ThemedText style={styles.selectorLabel}>Color</ThemedText>
              <ThemedView style={styles.colorRow}>
                {colors.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorDot,
                      {
                        backgroundColor: color,
                        borderColor: selectedColor === color ? themeColors.tint : themeColors.border,
                        borderWidth: selectedColor === color ? 3 : 1,
                      },
                    ]}
                  />
                ))}
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <TouchableOpacity
            style={[styles.cartButton, { backgroundColor: themeColors.tint }]}
            onPress={() =>
              alert(
                `Added ${quantity} × ${item.name} (${selectedSize}, ${selectedColor}) to cart.`
              )
            }
          >
            <ThemedText style={[styles.cartText, { color: themeColors.tintText, textAlign: 'center' }]}>
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
  longDivider: {
    height: 1.5,
    width: '100%',
    backgroundColor: '#ccc',
    marginVertical: 20,
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
    justifyContent: 'flex-start',
  },
  sizeButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 3,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginRight: 10,
    marginTop: 6,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 10,
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
    marginHorizontal: 8,
    fontWeight: '500',
  },
  cartButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  cartText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
