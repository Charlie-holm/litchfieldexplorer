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
          <View style={globalStyles.overlay}>
            <Pressable
              onPress={() => setShowModal(false)}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <IconSymbol name="circle.fill" size={40} color={Colors[colorScheme].text} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }} />
            <Pressable onPress={() => setShowModal(false)} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}>
              <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].card} />
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
