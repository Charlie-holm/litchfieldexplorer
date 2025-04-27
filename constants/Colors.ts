/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#000';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    nav: '#000',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    iconSelected: '#fff',
    border: '#687076',
    card: '#f1f1f1',
    pillButtonText: '#fff'
  },
  dark: {
    text: '#ECEDEE',
    nav: '#8B8B8B',
    background: '#151718',
    tint: tintColorDark,
    iconSelected: '#000',
    icon: '#ECEDEE',
    border: '#ECEDEE',
    card: '#888888',
    pillButtonText: '#ECEDEE'
  },
  tier: {
    Basic: '#A9A9A9',
    Silver: '#C0C0C0',
    Gold: '#FFD700',
    Platinum: '#E5E4E2'
  }
};