import { Modal, Pressable, View, Image, ScrollView, Dimensions } from 'react-native';
import { useState } from 'react';
import { useGlobalStyles } from '@/constants/globalStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [showModal, setShowModal] = useState(false);
  const { theme: colorScheme } = useThemeContext();
  const globalStyles = useGlobalStyles();

  return (
    <ThemedView style={globalStyles.container}>
      <View style={globalStyles.heroImage}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={true}
          style={{ flex: 1 }}
        >
          <Image
            source={require('@/assets/images/home1.jpg')}
            resizeMode="cover"
            style={{ width: Dimensions.get('window').width * 0.9, height: '100%' }}
          />
          <Image
            source={require('@/assets/images/home2.jpg')}
            resizeMode="cover"
            style={{ width: Dimensions.get('window').width * 0.9, height: '100%' }}
          />
          <Image
            source={require('@/assets/images/home3.jpg')}
            resizeMode="cover"
            style={{ width: Dimensions.get('window').width * 0.9, height: '100%' }}
          />
        </ScrollView>
      </View>

      <ThemedView style={globalStyles.titleBlock}>
        <ThemedText type="title">Welcome to Litchfield!</ThemedText>
      </ThemedView>

      <Pressable onPress={() => setShowModal(true)}>
        <ThemedView style={globalStyles.buttonCard}>
          <ThemedView style={globalStyles.buttonLeft}>
            <IconSymbol name="info.circle" color={Colors[colorScheme].text} />
            <ThemedText type="subtitle">Quick Information</ThemedText>
          </ThemedView>
          <IconSymbol name="chevron.right" size={28} color={Colors[colorScheme].text} />
        </ThemedView>
      </Pressable>

      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable style={globalStyles.overlay} onPress={() => setShowModal(false)}>
          <IconSymbol name="circle.fill" size={40} color={Colors[colorScheme].text} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }} />
          <Pressable onPress={() => setShowModal(false)} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}>
            <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].card} />
          </Pressable>
          <View style={globalStyles.overlayContent}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconSymbol name="exclamationmark.triangle" size={28} color={Colors[colorScheme].text} />
              <ThemedText type="subtitle">Heat warning</ThemedText>
            </View>
            <ThemedText style={{ marginTop: 10 }}>
              Temperatures across the Northern Territory can be very hot between October and April, it can exceed 40 degrees Celsius.
              Check for active heatwave warnings before you visit, go to the Bureau of Meteorology website.
              Central Australia has dry heat, and the Top End is humid. Both can cause exhaustion and dehydration.
              Find out how to prepare and stay safe in the heat.
            </ThemedText>
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}
