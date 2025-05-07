import home1 from '@/assets/images/home1.jpg';
import { StyleSheet, Image, Platform, Dimensions, TouchableOpacity, FlatList, View } from 'react-native';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useGlobalStyles } from '@/constants/globalStyles';
import { useThemeContext } from '@/context/ThemeProvider';
import { router } from 'expo-router';

export default function TabTwoScreen() {
  const { theme: colorScheme } = useThemeContext();
  const globalStyles = useGlobalStyles();
  const [attractions, setAttractions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, 'attractions'));
      const attractionsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const wangiFall = attractionsData.find(item => item.name?.toLowerCase().includes('wangi'));
      const others = attractionsData.filter(item => !item.name?.toLowerCase().includes('wangi'));
      setAttractions(wangiFall ? [wangiFall, ...others] : attractionsData);
    };
    fetchData();
  }, []);

  return (
    <ThemedView style={globalStyles.container}>
      <ThemedView style={globalStyles.itemContainer}>
        <ThemedText type="title" style={{ marginBottom: 10 }}>Most Visited Place</ThemedText>
        {attractions[0] && (
          <TouchableOpacity onPress={() => router.push(`/attractiondetail/${attractions[0].id}`)}>
            <ThemedView style={globalStyles.heroImage}>
              <Image
                source={home1}
                style={{ width: Dimensions.get('window').width * 0.9, height: '100%' }}
                resizeMode="cover"
              />
              <ThemedView style={globalStyles.imageShawdow}>
                <ThemedText type="defaultSemiBold" style={{ color: 'white', fontSize: 16 }}>{attractions[0].name}</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: 'white', fontSize: 14 }}>Explore ↗</ThemedText>
              </ThemedView>
            </ThemedView>
          </TouchableOpacity>
        )}
        <ThemedText type="title" style={{ marginBottom: 10 }}>More Places</ThemedText>
        <View style={{ height: 250 }}>
          <FlatList
            data={attractions.length > 0 ? attractions.slice(1) : []}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => router.push(`/attractiondetail/${item.id}`)}>
                <ThemedView style={[globalStyles.itemCard, { width: 180, borderRadius: 8, overflow: 'hidden' }]}>
                  <Image
                    source={home1}
                    style={{ height: '100%', width: 180 }}
                    resizeMode="cover"
                  />
                  <ThemedView style={globalStyles.imageShawdow}>
                    <ThemedText type="defaultSemiBold" style={{ color: 'white', fontSize: 16 }}>{item.name}</ThemedText>
                  </ThemedView>
                </ThemedView>
              </TouchableOpacity>
            )}
          />
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
});
