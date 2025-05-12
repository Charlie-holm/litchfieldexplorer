import { useFonts } from 'expo-font';
import { useRouter, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';
import { ThemeProvider } from '@/context/ThemeProvider';
import { useColorScheme } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded){
    return null;
  }

  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}
