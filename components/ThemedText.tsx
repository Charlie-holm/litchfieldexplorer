import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'title' | 'subtitle' | 'default' | 'defaultSemiBold' | 'defaultBold' | 'small';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const { theme } = useThemeContext();
  const color = theme === 'dark' ? darkColor ?? Colors.dark.highlight : lightColor ?? Colors.light.highlight;

  return (
    <Text
      style={[
        { color },
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'default' ? styles.default : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'defaultBold' ? styles.defaultBold : undefined,
        type === 'small' ? styles.small : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  defaultBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'bold',
  },
  small: {
    fontSize: 12,
    lineHeight: 20,
  },
});
