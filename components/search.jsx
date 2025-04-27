import { useState, useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, TextInput, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useGlobalStyles } from '@/constants/globalStyles';

export function SearchModal({ visible, onClose }) {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [searchText, setSearchText] = useState('');
    const animatedMargin = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedMargin, {
            toValue: searchText.length > 0 ? -300 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [searchText]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={globalStyles.overlay} onPress={onClose}>
                <IconSymbol name="circle.fill" size={40} color={Colors[colorScheme].text} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }} />
                <Pressable onPress={onClose} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}>
                    <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].card} />
                </Pressable>
                <Animated.View style={{ width: '95%', transform: [{ translateY: animatedMargin }] }}>
                    <TextInput
                        placeholder="Search Here..."
                        style={globalStyles.inputTextBox}
                        placeholderTextColor={Colors[colorScheme].text}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </Animated.View>
            </Pressable>
        </Modal>
    );
}