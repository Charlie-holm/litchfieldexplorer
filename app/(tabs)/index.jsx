import { Modal, Pressable, View, Image, FlatList, Dimensions, ScrollView } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useGlobalStyles } from '@/constants/globalStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getCachedQuickInfo } from '@/context/dataCache';

export default function TabsIndex() {
  const [showModal, setShowModal] = useState(false);
  const [quickInfos, setQuickInfos] = useState([]);
  const { theme: colorScheme } = useThemeContext();
  const globalStyles = useGlobalStyles();

  const images = [
    require('@/assets/images/home1.jpg'),
    require('@/assets/images/home2.jpg'),
    require('@/assets/images/home3.jpg'),
  ];

  const repeatCount = 100;
  const imageList = Array.from({ length: repeatCount }, () => images).flat();

  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(images.length * repeatCount / 2);

  useEffect(() => {
    const loadQuickInfo = async () => {
      const cached = await getCachedQuickInfo();
      setQuickInfos(cached);
    };
    loadQuickInfo();
  }, []);

  useEffect(() => {
    // Jump to middle copy on mount
    flatListRef.current?.scrollToIndex({ index: currentIndex, animated: false });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <ThemedView style={globalStyles.container}>
      <ThemedView style={globalStyles.itemContainer}>
        <View style={globalStyles.heroImage}>
          <FlatList
            ref={flatListRef}
            data={imageList}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, index) => ({
              length: Dimensions.get('window').width * 0.9,
              offset: (Dimensions.get('window').width * 0.9) * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (Dimensions.get('window').width * 0.9));
              setCurrentIndex(index);
              // If near start or end, reset to middle copy to keep illusion infinite
              if (index < images.length || index > imageList.length - images.length) {
                const middleIndex = images.length * repeatCount / 2;
                setCurrentIndex(middleIndex);
                flatListRef.current?.scrollToIndex({ index: middleIndex, animated: false });
              }
            }}
            renderItem={({ item }) => (
              <Image
                source={item}
                resizeMode="cover"
                style={[globalStyles.image, { width: Dimensions.get('window').width * 0.9 }]}
              />
            )}
            keyExtractor={(_, index) => index.toString()}
          />
        </View>
        <ThemedText type="title" style={{ paddingBottom: 20 }}>Welcome to Litchfield!</ThemedText>
        <Pressable onPress={() => setShowModal(true)}>
          <ThemedView style={globalStyles.buttonCard}>
            <View style={globalStyles.buttonLeft}>
              <IconSymbol name="info.circle" />
              <ThemedText type="subtitle" >Quick Information</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={28} />
          </ThemedView>
        </Pressable>

        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={globalStyles.overlay}>
            <Pressable
              onPress={() => setShowModal(false)}
              style={globalStyles.overlaybg}
            />
            <IconSymbol name="circle.fill" size={40} color={Colors[colorScheme].highlight} style={globalStyles.overlayCloseButton} />
            <Pressable onPress={() => setShowModal(false)} style={globalStyles.overlayCloseButton}>
              <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].pri} />
            </Pressable>
            <View style={globalStyles.overlayContent}>
              <ThemedText type="title" style={{ marginBottom: 20, alignSelf: 'center' }}>Quick Information</ThemedText>
              <ScrollView style={{ width: '100%' }}>
                {quickInfos.map((info) => (
                  <View key={info.id} style={{ marginBottom: 15 }}>
                    <ThemedText type="subtitle" >{info.title}</ThemedText>
                    <ThemedText type="default">{info.message}</ThemedText>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ThemedView>
    </ThemedView>
  );
}
