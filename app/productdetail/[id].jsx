import React, { useState, useEffect } from 'react';
import { Modal, Pressable, View, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalStyles } from '@/constants/globalStyles';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getCachedProducts } from '@/context/dataCache';
import { useCart } from '@/context/CartContext';

const sizes = ['S', 'M', 'L', 'XL'];

export default function ProductDetailScreen() {
  const { theme: colorScheme } = useThemeContext();
  const globalStyles = useGlobalStyles();
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState();
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertTitle, setAlertTitle] = useState('Quick Info');
  const [alertMessage, setAlertMessage] = useState('');

  const getColorStyle = (color) => {
    switch (color.toLowerCase()) {
      case 'black': return '#222';
      case 'grey': return '#aaa';
      case 'red': return '#d00';
      case 'blue': return '#007aff';
      case 'white': return '#fff';
      default: return '#ccc';
    }
  };

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      const allProducts = await getCachedProducts();
      const product = allProducts.find(p => p.id === id);
      if (product) {
        setItem(product);

        // Extract unique colors where quantity > 0
        const colorsSet = new Set();
        product.inventory?.forEach(inv => {
          if (inv.quantity > 0) {
            colorsSet.add(inv.color);
          }
        });
        const colorsArray = Array.from(colorsSet);
        setAvailableColors(colorsArray);

        if (colorsArray.length > 0) {
          setSelectedColor(colorsArray[0]);
        }
      }
    };
    fetchItem();
  }, [id]);
  // Reset quantity when size or color changes to valid stock or 0
  useEffect(() => {
    if (!item) return;
    const currentStock = item.inventory?.find(
      inv => inv.size === selectedSize && inv.color === selectedColor
    )?.quantity || 1;

    if (quantity > currentStock) {
      setQuantity(currentStock > 0 ? currentStock : 0);
    }
  }, [selectedSize, selectedColor, item])

  const themeColors = Colors[colorScheme];
  const { addToCart } = useCart();

  if (!item) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText type="subtitle">Loading product...</ThemedText>
      </ThemedView>
    );
  }

  const imageSource = { uri: item.imageUrl };

  const currentStock = item.inventory?.find(
    inv => inv.size === selectedSize && inv.color === selectedColor
  )?.quantity || 1;

  const isAddDisabled = !selectedSize || !selectedColor;

  return (
    <ThemedView style={{ flex: 1, backgroundColor: themeColors.pri }}>
      <View style={[globalStyles.attractionImageContainer, { height: Dimensions.get('window').width }]}>
        <Image
          source={imageSource}
          style={globalStyles.image}
        />
        <TouchableOpacity
          onPress={() => {
            router.push('/shop');
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
                    <ThemedText type={'defaultSemiBold'} style={{ color: '#f8f8f8' }}>−</ThemedText>
                  </TouchableOpacity>

                  <ThemedText type={'defaultSemiBold'}>{quantity}</ThemedText>

                  <TouchableOpacity onPress={() => {
                    const currentStock = item.inventory?.find(
                      inv => inv.size === selectedSize && inv.color === selectedColor
                    )?.quantity || 0;

                    setQuantity(prev => {
                      if (prev < currentStock) return prev + 1;
                      else {
                        setAlertTitle('Stock Alert');
                        setAlertMessage(`Only ${currentStock} ${item.name} (Size: ${selectedSize}, Color: ${selectedColor}) available in stock.`);
                        setShowAlertModal(true);
                        return prev;
                      }
                    });
                  }}
                    style={globalStyles.smallButton}>
                    <ThemedText type={'defaultSemiBold'} style={{ color: '#f8f8f8' }}>+</ThemedText>
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
                      const match = item.inventory?.find(i => i.size === size && i.color === selectedColor);
                      const isAvailable = match ? match.quantity > 0 : false;
                      const isSelected = selectedSize === size;

                      return (
                        <TouchableOpacity
                          key={size}
                          disabled={!isAvailable}
                          onPress={() => isAvailable && setSelectedSize(size)}
                          style={[
                            globalStyles.smallButton,
                            {
                              backgroundColor: isSelected ? themeColors.for : themeColors.sec,
                              borderColor: isAvailable ? themeColors.highlight : 'black',
                              opacity: isAvailable ? 1 : 0.4,
                              width: isSelected ? 44 : 36,
                              height: isSelected ? 44 : 36,
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRadius: 22,
                            },
                          ]}
                        >
                          <ThemedText
                            style={{
                              fontSize: isSelected ? 16 : 14,
                              fontWeight: '600',
                              color: isSelected ? themeColors.sec : '#f8f8f8',
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
                    {availableColors.map(color => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                          globalStyles.smallButton,
                          {
                            backgroundColor: getColorStyle(color),
                            borderColor: selectedColor === color ? themeColors.highlight : themeColors.sec,
                            borderWidth: selectedColor === color ? 3 : 1,
                            width: selectedColor === color ? 44 : 36,
                            height: selectedColor === color ? 44 : 36,
                            borderRadius: 22,
                          },
                        ]}
                      />
                    ))}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                disabled={isAddDisabled || currentStock === 0} style={[
                  (isAddDisabled || currentStock === 0)
                    ? globalStyles.pillButtonDisabled
                    : globalStyles.pillButton,
                  { marginTop: 20, width: '100%' }]}

                onPress={() => {
                  addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price || 0,
                    image: item.imageUrl,
                    quantity,
                    size: selectedSize,
                    color: selectedColor,
                  }).then(() => {
                    setAlertTitle('Added to Cart');
                    setAlertMessage(`${quantity} ${item.name} (Size: ${selectedSize}, Color: ${selectedColor}) added`);
                      setShowAlertModal(true);
                    });
                  }}
              >
                <ThemedText type="subtitle" style={{ color: Colors[colorScheme].pri }}>
                  Add to Cart | {item.price ? `$${item.price}` : 'Price Unavailable'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
          <Modal
            visible={showAlertModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowAlertModal(false)}
          >
            <View style={globalStyles.overlay}>
              <Pressable
                onPress={() => setShowAlertModal(false)}
                style={globalStyles.overlaybg}
              />
              <View style={globalStyles.overlayContent}>
                <ThemedText type="title" style={{ marginBottom: 20, alignSelf: 'center' }}>
                  {alertTitle}
                </ThemedText>
                <ThemedText type="default" style={{ textAlign: 'center' }}>
                  {alertMessage}
                </ThemedText>
                <TouchableOpacity
                  onPress={() => setShowAlertModal(false)}
                  style={[globalStyles.smallPillButton, { marginTop: 20, alignSelf: 'center' }]}
                >
                  <ThemedText style={{ color: '#f8f8f8' }}>OK</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </View>
    </ThemedView>
  );
}