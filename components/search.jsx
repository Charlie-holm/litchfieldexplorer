import { useState, useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, TextInput, View, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useGlobalStyles } from '@/constants/globalStyles';
import { ThemedText } from '@/components/ThemedText';

export function SearchModal({ visible, onClose, allItems }) {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const screenHeight = Dimensions.get('window').height;
    const [animatedTop] = useState(new Animated.Value(screenHeight * 0.6));
    const hasAnimatedUp = useRef(false);
    const navigation = useNavigation();
    const router = useRouter();

    const updateResults = (query) => {
        const lower = query.toLowerCase();
        const filtered = allItems?.filter(item =>
            item.name?.toLowerCase().includes(lower) ||
            item.description?.toLowerCase().includes(lower)
        );
        setSearchResults(filtered);
    };

    useEffect(() => {
        if (searchText.length > 0 && !hasAnimatedUp.current) {
            Animated.timing(animatedTop, {
                toValue: screenHeight * 0.2,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                hasAnimatedUp.current = true;
                updateResults(searchText);
            });
        } else {
            updateResults(searchText);
        }

        if (searchText.length === 0) {
            hasAnimatedUp.current = false;
            Animated.timing(animatedTop, {
                toValue: screenHeight * 0.4,
                duration: 300,
                useNativeDriver: false,
            }).start();
            setSearchResults([]);
        }
    }, [searchText]);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: '#00000088' }}>
                <Pressable
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    onPress={() => {
                        onClose();
                        setSearchText('');
                    }}
                />

                <Pressable onPress={onClose} style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}>
                    <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].card} />
                </Pressable>

                <Animated.View style={{ position: 'absolute', width: '95%', left: '2.5%', top: animatedTop }}>
                    <TextInput
                        placeholder="Search Here..."
                        style={globalStyles.inputTextBox}
                        placeholderTextColor={Colors[colorScheme].text}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </Animated.View>

                {searchText.length > 0 && (
                    <FlatList
                        style={{ marginTop: screenHeight * 0.29, paddingHorizontal: '2.5%' }}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        data={searchResults}
                        keyExtractor={(item) => `${item.type}-${item.id}`}
                        renderItem={({ item, index }) => {
                            const translateY = new Animated.Value(-20);
                            const opacity = new Animated.Value(0);

                            Animated.parallel([
                                Animated.timing(translateY, {
                                    toValue: 0,
                                    duration: 300,
                                    delay: index * 50,
                                    useNativeDriver: true,
                                }),
                                Animated.timing(opacity, {
                                    toValue: 1,
                                    duration: 300,
                                    delay: index * 50,
                                    useNativeDriver: true,
                                }),
                            ]).start();

                            return (
                                <Animated.View
                                    style={{
                                        transform: [{ translateY }],
                                        opacity,
                                        margin: 5,
                                    }}
                                >
                                    <Pressable
                                        onPress={() => {
                                            if (item.type === 'attraction') navigation.navigate('AttractionDetail', { id: item.id });
                                            else if (item.type === 'product') navigation.navigate('ProductDetail', { id: item.id });
                                            else if (item.type === 'tab') {
                                                router.push(item.route);
                                                onClose();
                                                setSearchText('');
                                            }
                                        }}
                                        style={[globalStyles.buttonCard, { marginBottom: 0 }]}
                                    >
                                        <View>
                                            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                                            <ThemedText type="small">{item.type}</ThemedText>
                                        </View>
                                        <IconSymbol name="chevron.right" size={24} color={Colors[colorScheme].text} />
                                    </Pressable>
                                </Animated.View>
                            );
                        }}
                    />
                )}
            </View>
        </Modal>
    );
}