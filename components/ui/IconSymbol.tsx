// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  'house': { lib: Feather, name: 'home' },
  'house.fill': { lib: Feather, name: 'home' },
  'safari': { lib: Feather, name: 'compass' },
  'safari.fill': { lib: Feather, name: 'compass' },
  'chevron.left.forwardslash.chevron.right': { lib: MaterialIcons, name: 'code' },
  'chevron.right': { lib: MaterialIcons, name: 'chevron-right' },
  'bag': { lib: Feather, name: 'shopping-bag' },
  'bag.fill': { lib: Feather, name: 'shopping-bag' },
  'magnifyingglass': { lib: Feather, name: 'search' },
  'cart': { lib: Feather, name: 'shopping-cart' },
  'person.circle': { lib: Feather, name: 'user' },
} as const;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 32,
  color,
  style,
  weight,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const icon = MAPPING[name];
  if (icon.lib === Feather) {
    return <Feather name={icon.name} size={size} color={color} style={style} />;
  }
  return <MaterialIcons name={icon.name} size={size} color={color} style={style} />;
}