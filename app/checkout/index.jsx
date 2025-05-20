import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useGlobalStyles } from '@/constants/globalStyles';
import { router } from 'expo-router';

const MOCK_ITEMS = [
    {
        id: '1',
        name: 'Iced Latte',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=60&q=80',
        price: 5.50,
        points: 10,
        quantity: 1,
    },
    {
        id: '2',
        name: 'Blueberry Muffin',
        image: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=60&q=80',
        price: 3.00,
        points: 5,
        quantity: 2,
    },
];

export default function CheckoutScreen() {
    const { theme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const items = MOCK_ITEMS;

    // Calculate summary values
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const gst = subtotal * 0.10;
    const discount = 2.00;
    const total = subtotal + gst - discount;
    const pointsEarned = items.reduce((sum, item) => sum + item.points * item.quantity, 0);

    return (
        <>
            <View style={globalStyles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol name="chevron.left" size={28} />
                </TouchableOpacity>
                <ThemedText type="title" >Checkout</ThemedText>
                <View style={{ width: 28 }} />
            </View>
            <ThemedView style={globalStyles.container}>
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 30, margin: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {items.map((item) => (
                        <View
                            key={item.id}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 20,
                                backgroundColor: Colors[theme].pri,
                                borderRadius: 12,
                                padding: 12,
                                shadowOpacity: 0.07,
                                shadowRadius: 4,
                                shadowOffset: { width: 0, height: 2 },
                            }}
                        >
                            <Image
                                source={{ uri: item.image }}
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 10,
                                    marginRight: 14,
                                    backgroundColor: Colors[theme].secondaryBackground,
                                }}
                            />
                            <View style={{ flex: 1 }}>
                                <ThemedText type="subtitle" style={{ marginBottom: 4 }}>
                                    {item.name}
                                </ThemedText>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <ThemedText type="default" style={{ marginRight: 8 }}>
                                        ${item.price.toFixed(2)}
                                    </ThemedText>
                                    <View style={{ backgroundColor: Colors[theme].pri, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
                                        <Text style={{ color: Colors[theme].background, fontSize: 12 }}>{item.points} pts</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                                <Text style={{ marginHorizontal: 10, fontWeight: 'bold', fontSize: 16, color: Colors[theme].text }}>
                                    {item.quantity}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {/* Pick Up Information */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 14,
                            borderRadius: 10,
                            backgroundColor: Colors[theme].secondaryBackground,
                            marginBottom: 16,
                        }}
                    >
                        <IconSymbol name="map-pin" size={22} color={Colors[theme].tint} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                            <ThemedText type="subtitle" style={{ marginBottom: 2 }}>Pick Up Information</ThemedText>
                            <ThemedText type="default" style={{ color: Colors[theme].textSecondary }}>Select a location</ThemedText>
                        </View>
                        <IconSymbol name="chevron-right" size={20} color={Colors[theme].textSecondary} />
                    </View>

                    {/* Credit Card Section */}
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 14,
                            borderRadius: 10,
                            backgroundColor: Colors[theme].secondaryBackground,
                            marginBottom: 20,
                        }}
                    >
                        <IconSymbol name="credit-card" size={22} color={Colors[theme].tint} style={{ marginRight: 12 }} />
                        <View style={{ flex: 1 }}>
                            <ThemedText type="subtitle" style={{ marginBottom: 2 }}>Credit Card</ThemedText>
                            <ThemedText type="default" style={{ color: Colors[theme].textSecondary }}>•••• 1234</ThemedText>
                        </View>
                        <IconSymbol name="chevron-right" size={20} color={Colors[theme].textSecondary} />
                    </View>

                    {/* Summary Section */}
                    <View style={{
                        backgroundColor: Colors[theme].secondaryBackground,
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 24,
                    }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <ThemedText type="subtitle">Total ({totalItems} items)</ThemedText>
                            <ThemedText type="subtitle">${total.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <ThemedText type="default" style={{ color: Colors[theme].textSecondary }}>GST (10%)</ThemedText>
                            <ThemedText type="default">${gst.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <ThemedText type="default" style={{ color: Colors[theme].textSecondary }}>Discount</ThemedText>
                            <ThemedText type="default" style={{ color: Colors[theme].tint }}>-${discount.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <ThemedText type="default" style={{ color: Colors[theme].textSecondary }}>Subtotal</ThemedText>
                            <ThemedText type="default">${subtotal.toFixed(2)}</ThemedText>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                            <ThemedText type="default" style={{ color: Colors[theme].tint }}>Points Earned</ThemedText>
                            <ThemedText type="default" style={{ color: Colors[theme].tint }}>{pointsEarned} pts</ThemedText>
                        </View>
                    </View>

                    {/* Pay Button */}
                    <TouchableOpacity style={[globalStyles.pillButton, { backgroundColor: Colors[theme].tint, marginBottom: 8 }]}>
                        <Text style={{ color: Colors[theme].background, fontWeight: 'bold', fontSize: 18, textAlign: 'center' }}>
                            Pay
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </ThemedView>
        </>
    );
}