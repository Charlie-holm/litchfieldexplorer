import { StyleSheet, Dimensions } from 'react-native';
import { useThemeContext } from '@/context/ThemeProvider';
import { Colors } from '@/constants/Colors';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const createGlobalStyles = (colorScheme) =>
    StyleSheet.create({
        container: {
            paddingTop: screenHeight * 0.15,
            height: screenHeight,
            justifyContent: 'flex-start',
        },
        subPageContainer: {
            flex: 1,
            justifyContent: 'flex-start',
        },
        profileContainer: {
            justifyContent: 'flex-start',
            height: screenHeight,
        },
        itemContainer: {
            width: screenWidth * 0.9,
            alignSelf: 'center',
            justifyContent: 'center',
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
            borderRadius: 16,
            marginBottom: 20,
            alignSelf: 'center',
            overflow: 'hidden',
        },
        imageShawdow: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingVertical: 15,
            paddingHorizontal: 15,
            backgroundColor: 'rgba(0,0,0,0.4)',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
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
            maxHeight: screenHeight * 0.6,
            width: screenWidth * 0.8,
            backgroundColor: Colors[colorScheme].card,
            padding: 20,
            borderRadius: 12,
            alignSelf: 'center',
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
            width: screenWidth * 0.3,
            alignItems: 'center',
            justifyContent: 'center',
        },
        smallButton: {
            position: 'relative',
            backgroundColor: Colors[colorScheme].nav,
            borderRadius: 40,
            height: 40,
            width: 200,
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
        categoryContainer: {
            flexDirection: 'row',
            paddingHorizontal: 22,
            gap: 12,
            alignItems: 'center',
            height: 40,
            marginBottom: 20
        },
        categoryButton: {
            flexDirection: 'row',
            gap: 5,
            alignItems: 'center',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors[colorScheme].border,
            backgroundColor: 'transparent',
        },
        categoryButtonSelected: {
            backgroundColor: Colors[colorScheme].text,
            borderColor: Colors[colorScheme].text,
        },
        shopItemContainer: {
            marginBottom: 60,
            height: screenHeight - 240,
            marginHorizontal: 26
        },
        itemCard: {
            marginHorizontal: 4,
            alignItems: 'center',
            borderRadius: 20,
            height: 250,
            overflow: 'hidden'
        },
        itemImage: {
            width: '100%',
            height: 160,
            resizeMode: 'contain',
            borderRadius: 8,
            marginBottom: 10,
        },
        itemTitle: {
            fontWeight: 'bold',
            textAlign: 'center',
            color: Colors[colorScheme].text,
        },
        itemCategory: {
            color: Colors[colorScheme].text,
            textAlign: 'center',
        },
        itemPrice: {
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 4,
            color: Colors[colorScheme].text,
        },
    });

export const useGlobalStyles = () => {
    const { theme } = useThemeContext();
    return createGlobalStyles(theme);
};
