import { Stack, useRouter, usePathname, useLocalSearchParams } from 'expo-router';
import { View, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';

export default function ProfileLayout() {
  const globalStyles = useGlobalStyles();
  const { theme: colorScheme } = useThemeContext();
  const router = useRouter();
  const { title } = useLocalSearchParams();
  const pathname = usePathname();
  const currentPage = pathname.split('/').pop();
  const isOrderDetail = pathname.includes('/order/');
  const labelMap = {
    'profile_detail': 'Profile Info',
    'theme': 'Theme',
    'points': 'Points',
    'order': 'Orders',
    'help': 'Help',
    'admin': 'Admin Panel',
    'users': 'Users',
    'products': 'Products',
    'attractions': 'Attractions',
    'reward': 'Rewards',
    'quickinfo': 'Quick Info',
    'searchitems': 'Keywords',
  };

  const screenTitle = typeof title === 'string'
    ? title
    : isOrderDetail
      ? 'Order Detail'
      : labelMap[currentPage] || 'Profile';

  // Inline header logic and JSX
  const CustomHeader = () => (
    <View style={globalStyles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <IconSymbol name="chevron.left" size={28} />
      </TouchableOpacity>
      <ThemedText type="title">
        {screenTitle.charAt(0).toUpperCase() + screenTitle.slice(1)}
      </ThemedText>
      {['products', 'attractions', 'quickinfo', 'payment', 'searchitems', 'reward'].includes(currentPage) ? (
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
  );

  return (
    <Stack
      screenOptions={{
        header: () => <CustomHeader />,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="profile_detail" />
      <Stack.Screen name="theme" />
      <Stack.Screen name="points" />
      <Stack.Screen name="order/index" />
      <Stack.Screen name="order/[id]" />
      <Stack.Screen name="help" />
      <Stack.Screen name="admin/index" />
      <Stack.Screen name="admin/attractions" />
      <Stack.Screen name="admin/products" />
      <Stack.Screen name="admin/users" />
      <Stack.Screen name="admin/quickinfo" />
      <Stack.Screen name="admin/reward" />
      <Stack.Screen name="admin/searchitems" />
    </Stack>
  );
}