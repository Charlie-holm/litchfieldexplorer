import { StyleSheet, Image, Platform, Dimensions, TouchableOpacity } from 'react-native';
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
  return (
    <ThemedView style={globalStyles.container}>
      <ThemedView style={globalStyles.itemContainer}>
        <TouchableOpacity onPress={() => router.push('/attractiondetail')}>
          <ThemedView style={globalStyles.heroImage}>
            <Image
              source={require('@/assets/images/home1.jpg')}
              style={{ width: Dimensions.get('window').width * 0.9, height: '100%' }}
              resizeMode="cover"
            />
            <ThemedView style={globalStyles.imageShawdow}>
              <ThemedText type="defaultSemiBold" style={{ color: 'white', fontSize: 16 }}>Wangi Falls</ThemedText>
              <ThemedText type="defaultSemiBold" style={{ color: 'white', fontSize: 14 }}>Explore ↗</ThemedText>
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>

        <ThemedText type="title" style={{ marginBottom: 10 }}>More Places</ThemedText>
        <ThemedView style={{ flexDirection: 'row', gap: 10 }}>
          <ThemedView style={globalStyles.itemCard}>
            <Image
              source={require('@/assets/images/home2.jpg')}
              style={{ height: '100%' }}
              resizeMode="cover"
            />
            <ThemedView
              style={globalStyles.imageShawdow}
            >
              <ThemedText type="defaultSemiBold" style={{ color: 'white', fontSize: 16 }}>Bluey Rockhole</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={globalStyles.itemCard}>
            <Image
              source={require('@/assets/images/home3.jpg')}
              style={{ height: '100%' }}
              resizeMode="cover"
            />
            <ThemedView
              style={globalStyles.imageShawdow}
            >
              <ThemedText type="defaultSemiBold" style={{ color: 'white', fontSize: 16 }}>Cascades</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
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
