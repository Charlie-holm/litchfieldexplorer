import { View } from 'react-native';
import { Slot } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TouchableOpacity } from 'react-native';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';

export default function Layout() {
  const { theme: colorScheme } = useThemeContext();
  const router = useRouter();
  const { title } = useLocalSearchParams();
  const labelMap = {
    'profile_detail': 'Profile Info',
    'theme': 'Theme',
    'points': 'Points',
    'wishlist': 'Wishlist',
    'support': 'Support',
    'help': 'Help',
    'payment': 'Payment',
    'points': 'Points',
  };

  const screenTitle = typeof title === 'string'
    ? title
    : labelMap[usePathname().split('/').pop()] || 'Profile';

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 80,
          paddingBottom: 20,
          backgroundColor: Colors[colorScheme].background,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol
            name="chevron.left" size={24} color={Colors[colorScheme].text}
          />
        </TouchableOpacity>
        <ThemedText type="title">{screenTitle.charAt(0).toUpperCase() + screenTitle.slice(1)}</ThemedText>
        <View style={{ width: 24 }} />
      </View>
      <Slot />
    </View>
  );
}