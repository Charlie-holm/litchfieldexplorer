import { View, Pressable, TextInput, DeviceEventEmitter, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useGlobalStyles } from '@/constants/globalStyles';
import { useState, useEffect } from 'react';
import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { auth, db } from '@/firebaseConfig';

export default function PaymentScreen() {
    const colorScheme = useColorScheme();
    const themeColors = Colors[colorScheme];
    const globalStyles = useGlobalStyles();

    const [cards, setCards] = useState([]);
    const [pageAuthenticated, setPageAuthenticated] = useState(false);
    const [pagePassword, setPagePassword] = useState('');
    const [showAddCardOverlay, setShowAddCardOverlay] = useState(false);
    const [newCardNumber, setNewCardNumber] = useState('');
    const [newExpiryDate, setNewExpiryDate] = useState('');

    const fetchCardData = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;
            console.log("Fetching card data for:", user.uid);

            const userDoc = await doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
                const data = docSnap.data();
                console.log("User document data:", data);
                console.log("Fetched cards from Firestore:", data.cards);
                if (data.cards && Array.isArray(data.cards)) {
                    setCards(data.cards.map(card => ({
                        ...card,
                        expanded: false,
                        editing: false
                    })));
                }
            }
        } catch (err) {
            console.error("Failed to fetch card data:", err);
        }
    };

    const addNewCard = () => {
        DeviceEventEmitter.emit('triggerAddOverlay');
    };

    DeviceEventEmitter.addListener('triggerAddOverlay', () => {
        setShowAddCardOverlay(true);
    });

    const updateCard = (index, updates) => {
        setCards(prev => prev.map((c, i) => i === index ? { ...c, ...updates } : c));
    };

    const formatCardNumber = (input) => {
        const cleaned = input.replace(/\D+/g, '').slice(0, 16);
        return cleaned.match(/.{1,4}/g)?.join(' ') || '';
    };

    const formatExpiryDate = (input) => {
        const cleaned = input.replace(/\D+/g, '').slice(0, 4);
        if (cleaned.length <= 2) return cleaned;
        return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    };

    if (!pageAuthenticated) {
        return (
            <View style={globalStyles.container}>
                <ThemedText type="default">Enter Password</ThemedText>
                <TextInput
                    style={globalStyles.inputTextBox}
                    value={pagePassword}
                    onChangeText={setPagePassword}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    secureTextEntry
                />
                <Pressable
                    onPress={async () => {
                        try {
                            const user = auth.currentUser;
                            if (!user || !user.email) return;
                            const credential = EmailAuthProvider.credential(user.email, pagePassword);
                            await reauthenticateWithCredential(user, credential);
                            setPageAuthenticated(true);
                            console.log("Reauthenticated, now fetching card data...");
                            await fetchCardData();
                        } catch (error) {
                            console.error("Reauthentication failed:", error);
                            alert("Incorrect password");
                        }
                    }}
                    style={[globalStyles.smallPillButton, { backgroundColor: '#3498db', borderColor: '#3498db', marginTop: 10 }]}
                >
                    <ThemedText style={{ color: 'white' }}>Submit</ThemedText>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            <ThemedView style={{ flex: 1 }}>
                {cards.length === 0 && (
                    <ThemedText type="default">No cards found.</ThemedText>
                )}
                {cards.map((card, index) => (
                    <Pressable key={index} onPress={() => {
                        setCards(prev => prev.map((c, i) => i === index ? { ...c, expanded: !c.expanded } : c));
                    }}>
                        <ThemedView style={[globalStyles.buttonCard, { flexDirection: 'column' }]}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <ThemedText type="subtitle">
                                    {card.expanded
                                        ? (card.cardNumber || '•••• •••• •••• ••••')
                                        : (card.cardNumber ? '•••• •••• •••• ' + card.cardNumber.slice(-4) : '•••• •••• •••• ••••')}
                                </ThemedText>
                            </View>
                            {card.expanded && (
                                <View style={{ marginTop: 16, width: '100%' }}>
                                    {card.editing ? (
                                        <>
                                            <ThemedText type="default">Card Number</ThemedText>
                                            <TextInput
                                                style={globalStyles.inputTextBox}
                                                value={card.cardNumber}
                                                onChangeText={(text) => updateCard(index, { cardNumber: formatCardNumber(text) })}
                                                placeholder="Enter card number"
                                                placeholderTextColor="#888"
                                                keyboardType="numeric"
                                            />
                                            <ThemedText type="default">Expiry Date</ThemedText>
                                            <TextInput
                                                style={globalStyles.inputTextBox}
                                                value={card.expiryDate}
                                                onChangeText={(text) => updateCard(index, { expiryDate: formatExpiryDate(text) })}
                                                placeholder="MM/YY"
                                                placeholderTextColor="#888"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <ThemedText type="default">Card Number</ThemedText>
                                            <ThemedText type="default">{card.cardNumber || '•••• •••• •••• ••••'}</ThemedText>
                                            <ThemedText type="default">Expiry Date</ThemedText>
                                            <ThemedText type="default">{card.expiryDate || 'MM/YY'}</ThemedText>
                                        </>
                                    )}
                                    <Pressable
                                        style={[globalStyles.smallPillButton, { backgroundColor: '#2ecc71', marginTop: 10 }]}
                                        onPress={async () => {
                                            if (card.editing) {
                                                try {
                                                    const newCards = cards.map((c, i) => i === index ? { ...c, editing: false } : c);
                                                    await setDoc(doc(db, 'users', auth.currentUser.uid), {
                                                        cards: newCards.map(({ expanded, editing, ...data }) => data)
                                                    }, { merge: true });
                                                    setCards(newCards);
                                                    alert('Card saved to Firestore');
                                                } catch (err) {
                                                    console.error("Firestore update failed:", err);
                                                    alert("Failed to save card.");
                                                }
                                            } else {
                                                updateCard(index, { editing: true });
                                            }
                                        }}
                                    >
                                        <ThemedText style={{ color: 'white' }}>{card.editing ? 'Save' : 'Edit'}</ThemedText>
                                    </Pressable>
                                    <Pressable
                                        style={[globalStyles.smallPillButton, { backgroundColor: '#e74c3c', marginTop: 10 }]}
                                        onPress={async () => {
                                            try {
                                                const updatedCards = cards.filter((_, i) => i !== index);
                                                await setDoc(doc(db, 'users', auth.currentUser.uid), {
                                                    cards: updatedCards.map(({ expanded, editing, ...data }) => data)
                                                }, { merge: true });
                                                setCards(updatedCards);
                                            } catch (err) {
                                                console.error("Failed to delete card:", err);
                                                alert("Failed to delete card.");
                                            }
                                        }}
                                    >
                                        <ThemedText style={{ color: 'white' }}>Delete</ThemedText>
                                    </Pressable>
                                </View>
                            )}
                        </ThemedView>
                    </Pressable>
                ))}
            </ThemedView>
            {showAddCardOverlay && (
                <View style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 999
                }}>
                    <View style={{
                        backgroundColor: '#fff',
                        padding: 20,
                        borderRadius: 10,
                        width: '80%'
                    }}>
                        <ThemedText type="subtitle">Add New Card</ThemedText>
                        <TextInput
                            style={globalStyles.inputTextBox}
                            placeholder="Card Number"
                            value={newCardNumber}
                            onChangeText={(text) => setNewCardNumber(formatCardNumber(text))}
                        />
                        <TextInput
                            style={globalStyles.inputTextBox}
                            placeholder="MM/YY"
                            value={newExpiryDate}
                            onChangeText={(text) => setNewExpiryDate(formatExpiryDate(text))}
                        />
                        <Pressable
                            style={[globalStyles.smallPillButton, { backgroundColor: '#2ecc71', marginTop: 10 }]}
                            onPress={async () => {
                                const cardDigits = newCardNumber.replace(/\s/g, '');
                                const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

                                if (cardDigits.length !== 16) {
                                    alert("Card number must be 16 digits.");
                                    return;
                                }

                                if (!expiryRegex.test(newExpiryDate)) {
                                    alert("Expiry date must be in MM/YY format and valid.");
                                    return;
                                }

                                try {
                                    const newCard = {
                                        cardNumber: newCardNumber,
                                        expiryDate: newExpiryDate
                                    };
                                    const updatedCards = [...cards, newCard];
                                    await setDoc(doc(db, 'users', auth.currentUser.uid), {
                                        cards: updatedCards
                                    }, { merge: true });
                                    setCards(updatedCards.map(card => ({ ...card, expanded: false, editing: false })));
                                    setShowAddCardOverlay(false);
                                    setNewCardNumber('');
                                    setNewExpiryDate('');
                                } catch (err) {
                                    console.error("Failed to save new card:", err);
                                    alert("Failed to save card.");
                                }
                            }}
                        >
                            <ThemedText style={{ color: 'white' }}>Save</ThemedText>
                        </Pressable>
                        <Pressable
                            style={[globalStyles.smallPillButton, { backgroundColor: '#e74c3c', marginTop: 10 }]}
                            onPress={() => setShowAddCardOverlay(false)}
                        >
                            <ThemedText style={{ color: 'white' }}>Cancel</ThemedText>
                        </Pressable>
                    </View>
                </View>
            )}
        </View>
    );
}
