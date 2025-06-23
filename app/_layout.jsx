import { useFonts } from 'expo-font';
import { useRouter, Slot, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider } from '@/context/ThemeProvider';
import { CartProvider } from '@/context/CartContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();


export default function Layout() {

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Lobster: require('../assets/fonts/Lobster-Regular.ttf'),
  });

  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <ThemeProvider>
          <Stack screenOptions={{ animation: 'slide_from_right', headerShown: false }} />
        </ThemeProvider>
      </CartProvider>
    </GestureHandlerRootView>
  );
}
