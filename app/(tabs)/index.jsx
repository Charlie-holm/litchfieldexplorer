import { Modal, Pressable, View, Image, ScrollView, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { useGlobalStyles } from '@/constants/globalStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const [showModal, setShowModal] = useState(false);
  const [quickInfos, setQuickInfos] = useState([]);
  const { theme: colorScheme } = useThemeContext();
  const globalStyles = useGlobalStyles();

  useEffect(() => {
    const q = query(collection(db, 'quickInfo'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setQuickInfos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  return (
    <ThemedView style={globalStyles.container}>
      <ThemedView style={globalStyles.itemContainer}>
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
              style={[globalStyles.image, { width: Dimensions.get('window').width * 0.9 }]}
            />
            <Image
              source={require('@/assets/images/home2.jpg')}
              resizeMode="cover"
              style={[globalStyles.image, { width: Dimensions.get('window').width * 0.9 }]}
            />
            <Image
              source={require('@/assets/images/home3.jpg')}
              resizeMode="cover"
              style={[globalStyles.image, { width: Dimensions.get('window').width * 0.9 }]}
            />
          </ScrollView>
        </View>
        <ThemedText type="title" style={{ paddingBottom: 20 }}>Welcome to Litchfield!</ThemedText>
        <Pressable onPress={() => setShowModal(true)}>
          <ThemedView style={globalStyles.buttonCard}>
            <ThemedView style={globalStyles.buttonLeft}>
              <IconSymbol name="info.circle" />
              <ThemedText type="subtitle" >Quick Information</ThemedText>
            </ThemedView>
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
