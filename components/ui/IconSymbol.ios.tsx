import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';


export function IconSymbol({

  name,
  size = 32,
  color,
  style,
  weight = 'regular',
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  const { theme: colorScheme } = useThemeContext();
  const finalColor = color ?? Colors[colorScheme].highlight;

  return (
    <SymbolView
      weight={weight}
      tintColor={finalColor}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}
