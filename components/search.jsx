import { useState, useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, TextInput, View, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useGlobalStyles } from '@/constants/globalStyles';
import { ThemedText } from '@/components/ThemedText';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig';

export function SearchModal({ visible, onClose }) {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const screenHeight = Dimensions.get('window').height;
    const [animatedTop] = useState(new Animated.Value(screenHeight * 0.6));
    const hasAnimatedUp = useRef(false);
    const router = useRouter();

    useEffect(() => {
        const fetchAllItems = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'keywords'));
                const fetchedItems = [];
                querySnapshot.forEach((doc) => {
                    fetchedItems.push({ id: doc.id, ...doc.data() });
                });
                setSearchResults(fetchedItems);
                console.log('SearchModal loaded on route:', router.pathname);
            } catch (error) {
                console.error('Failed to fetch keywords:', error);
            }
        };

        if (visible) {
            fetchAllItems();
            setSearchText('');
            hasAnimatedUp.current = false;
        }
    }, [visible]);

    useEffect(() => {
        const updateResults = () => {
            const lower = searchText.toLowerCase();
            const filtered = searchResults.filter(item =>
                item.name?.toLowerCase().includes(lower) ||
                item.description?.toLowerCase().includes(lower)
            );
            setSearchResults(filtered);
        };

        if (searchText.length > 0 && !hasAnimatedUp.current) {
            Animated.timing(animatedTop, {
                toValue: screenHeight * 0.2,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                hasAnimatedUp.current = true;
                updateResults();
            });
        } else if (searchText.length > 0) {
            updateResults();
        } else {
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

            <View style={globalStyles.overlay}>
                <Pressable
                    onPress={() => {
                        onClose();
                        setSearchText('');
                    }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                />
                <IconSymbol name="circle.fill" size={40} color={Colors[colorScheme].highlight} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }} />
                <Pressable onPress={onClose} style={{ position: 'absolute', top: 60, right: 20, zIndex: 10 }}>
                    <IconSymbol name="xmark.circle.fill" size={40} color={Colors[colorScheme].pri} />
                </Pressable>

                <Animated.View style={{ position: 'absolute', width: '95%', left: '2.5%', top: animatedTop }}>
                    <TextInput
                        placeholder="Search Here..."
                        style={globalStyles.inputTextBox}
                        placeholderTextColor={Colors[colorScheme].tri}
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
                                            if (item.type === 'attraction') router.push({ pathname: `/attractiondetail/${item.id}` });
                                            else if (item.type === 'product') router.push({ pathname: `/productdetail/${item.id}` });
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