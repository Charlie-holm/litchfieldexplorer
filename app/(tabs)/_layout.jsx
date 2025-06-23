import { useEffect, useState, useCallback, useRef } from 'react';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { View, Pressable, Image } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { SearchModal } from '@/components/search';
import { SearchProvider } from '@/context/SearchContext';
import { auth } from '@/firebaseConfig';
import { getFirestore, doc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { app } from '@/firebaseConfig';
import { useGlobalStyles } from '@/constants/globalStyles';
import { ThemedText } from '@/components/ThemedText';
import Cart from '@/components/cart';
import { useFocusEffect } from '@react-navigation/native';
import { getCachedAttractions, getCachedProducts, getCachedKeywords } from '@/context/dataCache';

export default function Layout() {
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

  const [cart, setCart] = useState([]);
  const [refreshCartFlag, setRefreshCartFlag] = useState(false);
  // Expose refreshCart for external usage (e.g., after add/remove API calls)
  const refreshCart = useCallback(() => {
    setRefreshCartFlag(flag => !flag);
  }, []);
  // Expose refreshCart globally if needed (attach to window for debugging/demo)
  // window.refreshCart = refreshCart;

  // Fetch profile image
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

  // Fetch cart from Firestore subcollection users/{uid}/cart when auth or refreshCartFlag changes
  useEffect(() => {
    let unsubscribeCart = null;
    let isMounted = true;
    const fetchCart = async () => {
      const user = auth.currentUser;
      if (!user) {
        setCart([]);
        return;
      }
      try {
        const db = getFirestore(app);
        // Listen to the cart subcollection for real-time updates
        const cartColRef = collection(db, 'users', user.uid, 'cart');
        unsubscribeCart = onSnapshot(cartColRef, (snapshot) => {
          if (!isMounted) return;
          const cartItems = [];
          snapshot.forEach(docSnap => {
            cartItems.push({ id: docSnap.id, ...docSnap.data() });
          });
          setCart(cartItems);
        }, (error) => {
          if (isMounted) setCart([]);
        });
      } catch (error) {
        if (isMounted) setCart([]);
      }
    };
    fetchCart();
    return () => {
      isMounted = false;
      if (unsubscribeCart) unsubscribeCart();
    };
  }, [refreshCartFlag]);

  // Re-fetch cart on auth change
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(() => {
      refreshCart();
    });
    return () => unsubscribeAuth();
  }, [refreshCart]);

  useFocusEffect(
    useCallback(() => {
      const fetchAllItems = async () => {
        try {
          const cachedAttractions = await getCachedAttractions();
          const cachedProducts = await getCachedProducts();
          const cachedKeywords = await getCachedKeywords();

          const dbAttractions = cachedAttractions.map(item => ({
            ...item,
            type: 'attraction',
            route: `/attractiondetail/${item.id}`,
          }));

          const dbProducts = cachedProducts.map(item => ({
            ...item,
            type: 'product',
            route: `/productdetail/${item.id}`,
          }));

          setAllItems([...dbAttractions, ...dbProducts, ...cachedKeywords]);
        } catch (err) {
          console.error("Failed to load cached items:", err);
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
        refreshCart={refreshCart}
        cart={cart}
      />
    </SearchProvider>
  );
}
// Optionally export refreshCart if you want to import/use it elsewhere:
// export { refreshCart };
