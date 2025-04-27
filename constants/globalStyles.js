import { StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';

const createGlobalStyles = (colorScheme) =>
    StyleSheet.create({
        container: {
            paddingTop: 130,
            flex: 1,
            backgroundColor: Colors[colorScheme].background,
            justifyContent: 'flex-start',
        },
        subPageContainer: {
            flex: 1,
            backgroundColor: Colors[colorScheme].background,
            justifyContent: 'flex-start',
        },
        itemContainer: {
            width: '90%',
            alignSelf: 'center',
            justifyContent: 'center',
            gap: 16,
            marginTop: 20,
        },
        thinInputTextBox: {
            paddingVertical: 10,
            paddingHorizontal: 30,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].card,
            fontSize: 18,
            color: Colors[colorScheme].text,
        },
        inputTextBox: {
            paddingVertical: 20,
            paddingHorizontal: 30,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: Colors[colorScheme].border,
            backgroundColor: Colors[colorScheme].card,
            fontSize: 18,
            color: Colors[colorScheme].text,
        },
        heroImage: {
            height: 250,
            width: '90%',
            borderRadius: 16,
            marginBottom: 20,
            alignSelf: 'center',
            overflow: 'hidden',
        },
        titleBlock: {
            alignItems: 'center',
            marginBottom: 16,
            gap: 4,
        },
        buttonCard: {
            backgroundColor: Colors[colorScheme].card,
            borderRadius: 12,
            padding: 16,
            marginHorizontal: 20,
            marginBottom: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        buttonCardIcon: {
            width: 80,
            height: 80,
            borderRadius: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
            overflow: 'hidden',
        },
        buttonLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors[colorScheme].card,
            gap: 8,
        },
        overlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        overlayContent: {
            width: '80%',
            backgroundColor: Colors[colorScheme].card,
            padding: 20,
            borderRadius: 12,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 10,
        },
        smallPillButton: {
            position: 'relative',
            backgroundColor: Colors[colorScheme].nav,
            borderRadius: 40,
            height: 40,
            width: '30%',
            alignItems: 'center',
            justifyContent: 'center',
        },
        pillButton: {
            position: 'relative',
            backgroundColor: Colors[colorScheme].nav,
            borderRadius: 40,
            height: 60,
            bottom: 30,
            width: '90%',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            borderTopWidth: 0,
        },
        footer: {
            marginTop: 'auto',
            paddingVertical: 20,
            alignItems: 'center',
        },
    });

export const useGlobalStyles = () => {
    const { theme } = useThemeContext();
    return createGlobalStyles(theme);
};
