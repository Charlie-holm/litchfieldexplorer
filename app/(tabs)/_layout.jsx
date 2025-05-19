import { useEffect, useState } from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Text, View, Pressable, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { SearchModal } from '@/components/search';
import { SearchProvider } from '@/context/SearchContext';
import { attractions, products, tabs } from '@/context/allItems';
import { auth } from '@/firebaseConfig';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/firebaseConfig';
import { useGlobalStyles } from '@/constants/globalStyles';
import { ThemedText } from '@/components/ThemedText';

export default function TabLayout() {
  const globalStyles = useGlobalStyles();
  const { theme: colorScheme } = useThemeContext();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const currentScreen = pathname.split('/').pop();
  const titleMap = {
    index: 'Litchfield Explorer',
    explore: 'Explore',
    shop: 'Shop',
  };
  const pageTitle = titleMap[currentScreen] || 'Litchfield Explorer';

  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore(app);
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileImage(data.profileImage || '');
          } else {
            console.log('No such document!');
          }
        }
      } catch (error) {
        console.log('Error fetching profile image:', error);
      }
    };
    fetchProfileImage();
  }, []);

  return (
    <SearchProvider>
      <View style={globalStyles.header}>
        <View style={globalStyles.titleContainer}>
          <ThemedText type="title" style={{ fontFamily: 'Lobster-Regular' }}>{pageTitle}</ThemedText>
        </View>
        <View style={globalStyles.buttonContainer}>
          <Pressable onPress={() => setShowSearch(true)}>
            <IconSymbol name="magnifyingglass" size={28} />
          </Pressable>
          <IconSymbol name="cart" size={28} />
          <Pressable onPress={() => router.push('/profile')}>
            <View style={globalStyles.smallprofileImage}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={globalStyles.image} resizeMode="cover" />
              ) : (
                <IconSymbol name="person.circle" />
              )}
            </View>
          </Pressable>
        </View>
      </View>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme].pri,
          tabBarInactiveTintColor: Colors[colorScheme].tri,
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            ...globalStyles.tabBar,
          },
        }}>
        <Tabs.Screen
          name="explore"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={40} name={focused ? 'safari.fill' : 'safari'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={40} name={focused ? 'house.fill' : 'house'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="shop"
          options={{
            tabBarIcon: ({ color, focused }) => (
              <IconSymbol size={40} name={focused ? 'bag.fill' : 'bag'} color={color} />
            ),
          }}
        />
      </Tabs>
      <SearchModal
        visible={showSearch}
        onClose={() => setShowSearch(false)}
        allItems={[...attractions, ...products, ...tabs]}
      />
    </SearchProvider>
  );
}
