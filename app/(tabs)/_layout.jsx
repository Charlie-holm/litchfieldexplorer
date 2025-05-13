import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { Text, View, Pressable, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { SearchModal } from '@/components/search';
import { useSearch, SearchProvider } from '@/context/SearchContext';
import { attractions, products, tabs } from '@/context/allItems';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/firebaseConfig';

export default function TabLayout() {
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
        const auth = getAuth(app);
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
      <View style={{ flex: 1 }}>
        <View style={{ position: 'absolute', top: 70, left: 30, right: 30, flexDirection: 'row', alignItems: 'center', zIndex: 100 }}>
          <Text style={{
            fontSize: 32,
            fontFamily: 'Lobster-Regular',
            color: Colors[colorScheme].text,
          }}>{pageTitle}</Text>
          <View style={{ flexDirection: 'row', marginLeft: 'auto', gap: 10 }}>
            <Pressable onPress={() => setShowSearch(true)}>
              <IconSymbol name="magnifyingglass" size={28} color={Colors[colorScheme].icon} />
            </Pressable>
            <IconSymbol name="cart" size={28} color={Colors[colorScheme].icon} />
            <Pressable onPress={() => router.push('/profile')}>
              <View style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                overflow: 'hidden',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <IconSymbol name="person.circle" size={30} color={Colors[colorScheme].icon} />
                )}
              </View>
            </Pressable>
          </View>
        </View>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme].iconSelected,
            tabBarInactiveTintColor: Colors[colorScheme].icon,
            headerShown: false,
            tabBarShowLabel: false,
            tabBarStyle: {
              position: 'absolute',
              bottom: 30,
              backgroundColor: Colors[colorScheme].nav,
              borderRadius: 40,
              height: 60,
              paddingHorizontal: 30,
              marginHorizontal: 30,
              alignSelf: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              borderTopWidth: 0,
              elevation: 0,
              borderTopColor: 'transparent',
            },
          }}>
          <Tabs.Screen
            name="explore"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <IconSymbol size={40} name={focused ? 'safari.fill' : 'safari'} color={color} style={{ marginTop: 20 }} />
              ),
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <IconSymbol size={40} name={focused ? 'house.fill' : 'house'} color={color} style={{ marginTop: 20 }} />
              ),
            }}
          />
          <Tabs.Screen
            name="shop"
            options={{
              tabBarIcon: ({ color, focused }) => (
                <IconSymbol size={40} name={focused ? 'bag.fill' : 'bag'} color={color} style={{ marginTop: 20 }} />
              ),
            }}
          />
        </Tabs>
        <SearchModal
          visible={showSearch}
          onClose={() => setShowSearch(false)}
          allItems={[...attractions, ...products, ...tabs]}
        />
      </View>
    </SearchProvider>
  );
}
