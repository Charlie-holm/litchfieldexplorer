import React, { useState, useEffect } from 'react';
import { Image, ScrollView, TouchableOpacity, View, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/constants/globalStyles';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const sizes = ['S', 'M', 'L', 'XL'];
const colors = ['#222', '#aaa'];

export default function ProductDetailScreen() {
  const { theme: colorScheme } = useThemeContext();
  const globalStyles = useGlobalStyles();
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

  const themeColors = Colors[colorScheme];

  if (!item) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText type="subtitle">Loading product...</ThemedText>
      </ThemedView>
    );
  }

  const imageSource = { uri: item.imageUrl };

  return (
    <ThemedView style={{ flex: 1, backgroundColor: themeColors.pri }}>
      <View style={[globalStyles.attractionImageContainer, { height: Dimensions.get('window').width }]}>
        <Image
          source={imageSource}
          style={globalStyles.image}
        />
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={globalStyles.backIcon}
        >
          <IconSymbol name="chevron.left" color={'#f8f8f8'} />
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1, zIndex: 2 }}>
        <ScrollView
          contentContainerStyle={{ paddingTop: 420, }}
          bounces={false}
        >
          <View style={{ flex: 1 }}>
            <View style={globalStyles.infoCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                <ThemedText type="title" >{item.name}</ThemedText>
                <View style={globalStyles.quantityInline}>
                  <TouchableOpacity onPress={() => setQuantity(prev => Math.max(1, prev - 1))} style={globalStyles.smallButton}>
                    <ThemedText type={'defaultSemiBold'}>−</ThemedText>
                  </TouchableOpacity>

                  <ThemedText type={'defaultSemiBold'}>{quantity}</ThemedText>

                  <TouchableOpacity onPress={() => setQuantity(prev => prev + 1)} style={globalStyles.smallButton}>
                    <ThemedText type={'defaultSemiBold'}>+</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>

              <ThemedText>{item.description || 'No description available.'}</ThemedText>

              <ThemedView style={globalStyles.longDivider} />

              <View style={{ marginBottom: 16 }}>
                {/* SIZE SELECTOR */}
                <View style={globalStyles.selectorGroup}>
                  <ThemedText type={'subtitle'} style={{ marginBottom: 10 }}>Size</ThemedText>
                  <View style={globalStyles.sizeRow}>
                    {sizes.map(size => {
                      const isSelected = selectedSize === size;

                      return (
                        <TouchableOpacity
                          key={size}
                          onPress={() => setSelectedSize(size)}
                          style={[
                            globalStyles.smallButton,
                            {
                              backgroundColor: isSelected ? themeColors.for : themeColors.sec,
                              borderColor: themeColors.highlight,
                            },
                          ]}
                        >
                          <ThemedText
                            style={{
                              fontSize: 14,
                              fontWeight: '500',
                              color: isSelected ? themeColors.sec : themeColors.highlight,
                            }}
                          >
                            {size}
                          </ThemedText>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                <View style={[globalStyles.selectorGroup, { marginTop: 16 }]}>
                  <ThemedText type={'subtitle'} style={{ marginBottom: 10 }}>Color</ThemedText>
                  <View style={globalStyles.colorRow}>
                    {colors.map(color => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                          globalStyles.smallButton,
                          {
                            backgroundColor: color,
                            borderColor: selectedColor === color ? themeColors.highlight : themeColors.sec,
                            borderWidth: selectedColor === color ? 3 : 1,

                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[globalStyles.pillButton, { marginTop: 20, width: '100%' }]}
                onPress={() =>
                  alert(
                    `Added ${quantity} × ${item.name} (${selectedSize}, ${selectedColor}) to cart.`
                  )
                }
              >
                <ThemedText type="subtitle" style={{ color: Colors[colorScheme].pri }}>
                  Add to Cart | {item.price ? `$${item.price}` : 'Price Unavailable'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </ThemedView>
  );
}
