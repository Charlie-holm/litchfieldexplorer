import { useState, useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, TextInput, View, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useGlobalStyles } from '@/constants/globalStyles';
import { ThemedText } from '@/components/ThemedText';
import { getCachedKeywords } from '@/context/dataCache';

export function SearchModal({ visible, onClose }) {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [showNoResults, setShowNoResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const screenHeight = Dimensions.get('window').height;
    const animatedTop = useRef(new Animated.Value(screenHeight * 0.6)).current;
    const hasAnimatedUp = useRef(false);
    const debounceTimeout = useRef(null);
    const router = useRouter();

    const highlightMatch = (text, query, isDescription = false) => {
        if (!text || !query) return <ThemedText>{text}</ThemedText>;

        const regex = new RegExp(`(${query})`, 'gi');
        const match = text.match(regex);

        if (!match || match.length === 0) return <ThemedText>{text}</ThemedText>;

        if (!isDescription) {
            const parts = text.split(regex);
            return parts.map((part, index) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <ThemedText key={index} style={{ fontWeight: '900' }}>{part}</ThemedText>
                ) : (
                    <ThemedText key={index}>{part}</ThemedText>
                )
            );
        }

        const words = text.split(/\s+/);
        const matchIndex = words.findIndex(word => word.toLowerCase().includes(query.toLowerCase()));

        const start = Math.max(matchIndex - 5, 0);
        const end = Math.min(matchIndex + 6, words.length);
        const snippetWords = words.slice(start, end);
        const snippet = snippetWords.join(' ');
        const parts = snippet.split(regex);

        const hasStartEllipsis = start > 0;
        const hasEndEllipsis = end < words.length;

        return (
            <ThemedText>
                {hasStartEllipsis && '... '}
                {parts.map((part, index) =>
                    part.toLowerCase() === query.toLowerCase() ? (
                        <ThemedText key={index} style={{ fontWeight: '900' }}>{part}</ThemedText>
                    ) : (
                        <ThemedText key={index}>{part}</ThemedText>
                    )
                )}
                {hasEndEllipsis && ' ...'}
            </ThemedText>
        );
    };

    useEffect(() => {
        const fetchAllItems = async () => {
            try {
                const cachedItems = await getCachedKeywords();
                setAllItems(cachedItems);
                setSearchResults(cachedItems);
                console.log('Loaded keywords from cache');
            } catch (error) {
                console.error('Failed to load cached keywords:', error);
            }
        };

        if (visible) {
            fetchAllItems();
            setSearchText('');
            hasAnimatedUp.current = false;
            Animated.timing(animatedTop, {
                toValue: screenHeight * 0.4,
                duration: 300,
                useNativeDriver: false,
            }).start();
        }
    }, [visible]);

    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        setLoading(true);
        setSearchResults([]);
        setShowNoResults(false);

        const updateResults = () => {
            const lower = searchText.toLowerCase();
            const filtered = allItems.filter(item =>
                item.name?.toLowerCase().includes(lower) ||
                item.description?.toLowerCase().includes(lower)
            );
            if (filtered.length === 0) {
                setTimeout(() => {
                    setSearchResults(filtered);
                    setShowNoResults(true);
                    setLoading(false);
                }, 300);
            } else {
                setSearchResults(filtered);
                setShowNoResults(false);
                setLoading(false);
            }
        };

        if (searchText.length > 0 && !hasAnimatedUp.current) {
            Animated.timing(animatedTop, {
                toValue: screenHeight * 0.2,
                duration: 300,
                useNativeDriver: false,
            }).start(() => {
                hasAnimatedUp.current = true;
                debounceTimeout.current = setTimeout(updateResults, 300);
            });
        } else if (searchText.length > 0 && hasAnimatedUp.current) {
            debounceTimeout.current = setTimeout(updateResults, 300);
        } else {
            setSearchResults([]);
            setLoading(false);
        }

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
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
                    <>
                        {loading && hasAnimatedUp.current ? (
                            <View style={{
                                position: 'absolute',
                                top: screenHeight * 0.3,
                                left: 0,
                                right: 0,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <ThemedText type="subtitle" style={{ color: 'white' }}>Loading...</ThemedText>
                            </View>
                        ) : searchResults.length > 0 ? (
                            <FlatList
                                style={{
                                    marginTop: screenHeight * 0.29,
                                    paddingHorizontal: '2.5%',
                                    width: '100%',
                                    alignSelf: 'center',
                                }}
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
                                                    if (item.type === 'attraction') {
                                                        router.push({ pathname: `/attractiondetail/${item.id}` });
                                                        onClose();
                                                        setSearchText('');
                                                    } else if (item.type === 'product') {
                                                        router.push({ pathname: `/productdetail/${item.id}` });
                                                        onClose();
                                                        setSearchText('');
                                                    } else if (item.type === 'tab') {
                                                        router.push(item.route);
                                                        onClose();
                                                        setSearchText('');
                                                    }
                                                }}
                                                style={[globalStyles.buttonCard, { marginBottom: 0 }]}
                                            >
                                                <View style={{ flexShrink: 1, maxWidth: '90%' }}>
                                                    <ThemedText type="defaultSemiBold">
                                                        {highlightMatch(item.name, searchText)}
                                                    </ThemedText>
                                                    <ThemedText type="small">
                                                        {highlightMatch(item.description, searchText, true)}
                                                    </ThemedText>
                                                </View>
                                                <IconSymbol name="chevron.right" size={24} color={Colors[colorScheme].highlight} />
                                            </Pressable>
                                        </Animated.View>
                                    );
                                }}
                            />
                        ) : showNoResults && (
                            <View style={{
                                position: 'absolute',
                                top: screenHeight * 0.3,
                                left: 0,
                                right: 0,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <ThemedText type="subtitle" style={{ color: 'white' }}>No results found</ThemedText>
                            </View>
                        )}
                    </>
                )}
            </View>
        </Modal>
    );
}