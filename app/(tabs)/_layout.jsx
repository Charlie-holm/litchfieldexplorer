import { useEffect, useState, useCallback } from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { View, Pressable, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useCart } from '@/context/CartContext';
import { SearchModal } from '@/components/search';
import { SearchProvider } from '@/context/SearchContext';
import { auth } from '@/firebaseConfig';
import { getFirestore, doc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { app } from '@/firebaseConfig';
import { useGlobalStyles } from '@/constants/globalStyles';
import { ThemedText } from '@/components/ThemedText';
import Cart from '@/components/cart';
import { useFocusEffect } from '@react-navigation/native';
import { getDocs } from 'firebase/firestore';

export default function TabLayout() {
  const globalStyles = useGlobalStyles();
  const { theme: colorScheme } = useThemeContext();
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const currentScreen = pathname.split('/').pop();
  const titleMap = {
    index: 'Litchfield Explorer',
    explore: 'Explore',
    shop: 'Shop',
  };
  const pageTitle = titleMap[currentScreen] || 'Litchfield Explorer';

  const { cart, setCart, getCart, user } = useCart();

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

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const db = getFirestore();
        const cartRef = collection(db, 'users', firebaseUser.uid, 'cart');

        const unsubscribeCart = onSnapshot(cartRef, async () => {
          const updatedCart = await getCart();
          setCart(updatedCart);
        });

        return () => unsubscribeCart();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchAllItems = async () => {
        try {
          const db = getFirestore(app);
          const snapAttractions = await getDocs(collection(db, 'attractions'));
          const dbAttractions = snapAttractions.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'attraction',
            route: `/attractiondetail/${doc.id}`,
          }));

          const snapProducts = await getDocs(collection(db, 'products'));
          const dbProducts = snapProducts.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'product',
            route: `/productdetail/${doc.id}`,
          }));

          const snapKeywords = await getDocs(collection(db, 'keywords'));
          const dbKeywords = snapKeywords.docs.map(doc => doc.data());

          setAllItems([...dbAttractions, ...dbProducts, ...dbKeywords]);
        } catch (err) {
          console.error("Failed to fetch items:", err);
        }
      };

      fetchAllItems();
    }, [])
  );

  return (
    <SearchProvider>
      <View style={globalStyles.header}>
        <View style={globalStyles.titleContainer}>
          <ThemedText type="title" style={{ fontFamily: 'Lobster' }}>{pageTitle}</ThemedText>
        </View>
        <View style={globalStyles.buttonContainer}>
          <Pressable onPress={() => setShowSearch(true)}>
            <IconSymbol name="magnifyingglass" />
          </Pressable>
          <Pressable onPress={() => setShowCart(true)}>
            <IconSymbol name={Array.isArray(cart) && cart.length > 0 ? 'cart.fill' : 'cart'} />
          </Pressable>
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
        allItems={allItems}
      />
      <Cart
        cartVisible={showCart}
        setCartVisible={setShowCart}
      />
    </SearchProvider>
  );
}
