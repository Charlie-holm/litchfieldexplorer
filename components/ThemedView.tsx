import { View, type ViewProps } from 'react-native';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const { theme } = useThemeContext();
  const backgroundColor = theme === 'dark' ? darkColor ?? Colors.dark.background : lightColor ?? Colors.light.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
