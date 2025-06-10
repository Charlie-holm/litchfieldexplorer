import { View, DeviceEventEmitter } from 'react-native';
import { Slot } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TouchableOpacity } from 'react-native';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { useGlobalStyles } from '@/constants/globalStyles';
import { useRouter, usePathname, useLocalSearchParams } from 'expo-router';

export default function Layout() {
  const globalStyles = useGlobalStyles();
  const { theme: colorScheme } = useThemeContext();
  const router = useRouter();
  const { title } = useLocalSearchParams();
  const currentPage = usePathname().split('/').pop();
  const isOrderDetail = usePathname().includes('/order/');
  const labelMap = {
    'profile_detail': 'Profile Info',
    'theme': 'Theme',
    'points': 'Points',
    'order': 'Orders',
    'support': 'Support',
    'help': 'Help',
    'payment': 'Payment',
    'points': 'Points',
    'admin': 'Admin Panel',
    'users': 'Users',
    'products': 'Products',
    'attractions': 'Attractions',
    'quickinfo': 'Quick Info',
    'searchitems': 'Keywords',
  };

  const screenTitle = typeof title === 'string'
    ? title
    : isOrderDetail
      ? 'Order Detail'
      : labelMap[currentPage] || 'Profile';

  return (
    <View style={{ flex: 1 }}>
      <View style={globalStyles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={28} />
        </TouchableOpacity>
        <ThemedText type="title">{screenTitle.charAt(0).toUpperCase() + screenTitle.slice(1)}</ThemedText>
        {['products', 'attractions', 'quickinfo', 'payment', 'searchitems'].includes(currentPage) ? (
          <TouchableOpacity
            onPress={() => {
              DeviceEventEmitter.emit('triggerAddOverlay', currentPage);
            }}
            accessibilityLabel="add"
            accessibilityRole="button"
          >
            <IconSymbol name="plus" size={28} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 28 }} />
        )}
      </View>
      <Slot />
    </View>
  );
}