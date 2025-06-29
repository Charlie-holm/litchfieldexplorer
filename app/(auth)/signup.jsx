import { useState } from 'react';
import { View, TextInput, Pressable, Text, TouchableOpacity, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { useGlobalStyles } from '@/constants/globalStyles';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useFonts } from 'expo-font';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Signup() {
    const { theme: colorScheme } = useThemeContext();
    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [signupErrors, setSignupErrors] = useState([]);
    const router = useRouter();
    const globalStyles = useGlobalStyles();

    const [fontsLoaded] = useFonts({
        'Lobster-Regular': require('@/assets/fonts/Lobster-Regular.ttf'),
    });

    const handleSignup = async () => {
        let errors = [];
        setSignupErrors([]);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!firstname) errors.push('First name is required.');
        if (!lastname) errors.push('Last name is required.');
        if (!email) {
            errors.push('Email is required.');
        } else if (!emailRegex.test(email)) {
            errors.push('Please enter a valid email address.');
        }

        if (!password) {
            errors.push('Password is required.');
        } else if (password.length < 6) {
            errors.push('Password should be at least 6 characters.');
        }

        if (password !== confirmPassword) errors.push('Passwords do not match.');

        if (errors.length > 0) {
            setSignupErrors(errors);
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);

            try {
                await setDoc(doc(db, 'users', auth.currentUser.uid), {
                    firstName: firstname,
                    lastName: lastname,
                    phoneNumber: phoneNumber,
                    email: email,
                    points: 0
                });
            } catch (dbError) {
                console.error('Firestore Error:', dbError);
                setSignupErrors(['Failed to save user data.']);
                return;
            }

            try {
                await updateProfile(auth.currentUser, {
                    displayName: `${firstname} ${lastname}`
                });
            } catch (profileError) {
                console.error('Update Profile Error:', profileError);
                setSignupErrors(['Failed to update profile info.']);
                return;
            }

            await signOut(auth);
            router.replace('/signedup');

        } catch (error) {
            let message = '';
            console.error('Signup Error:', error);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'This email is already registered.';
                    break;
                default:
                    message = 'Authentication failed. Please try again.';
            }
            setSignupErrors([message]);
        }
    };

    return (
        <ThemedView style={globalStyles.container}>
            <ThemedView style={globalStyles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <IconSymbol
                        name="chevron.left"
                        size={24}
                        color={Colors[colorScheme].highlight}
                    />
                </TouchableOpacity>
                <ThemedText type="title">Sign up</ThemedText>
                <View style={{ width: 24 }} />
            </ThemedView>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={globalStyles.itemContainer}>
                    <TextInput
                        style={globalStyles.inputTextBox}
                        placeholder="First Name"
                        placeholderTextColor={Colors[colorScheme].tri}
                        autoCapitalize="words"
                        value={firstname}
                        onChangeText={(text) => {
                            setFirstName(text);
                            setSignupErrors([]);
                        }}
                    />
                    <TextInput
                        style={globalStyles.inputTextBox}
                        placeholder="Last Name"
                        placeholderTextColor={Colors[colorScheme].tri}
                        autoCapitalize="words"
                        value={lastname}
                        onChangeText={(text) => {
                            setLastName(text);
                            setSignupErrors([]);
                        }}
                    />
                    <TextInput
                        style={globalStyles.inputTextBox}
                        placeholder="Email"
                        placeholderTextColor={Colors[colorScheme].tri}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setSignupErrors([]);
                        }}
                    />
                    <TextInput
                        style={globalStyles.inputTextBox}
                        placeholder="Phone Number"
                        placeholderTextColor={Colors[colorScheme].tri}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={(text) => {
                            setPhoneNumber(text);
                            setSignupErrors([]);
                        }}
                    />
                    <TextInput
                        style={globalStyles.inputTextBox}
                        placeholder="Password"
                        placeholderTextColor={Colors[colorScheme].tri}
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setSignupErrors([]);
                        }}
                    />
                    <TextInput
                        style={globalStyles.inputTextBox}
                        placeholder="Confirm Password"
                        placeholderTextColor={Colors[colorScheme].tri}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    {signupErrors.length > 0 && signupErrors.map((err, index) => (
                        <ThemedText key={index} type="default" style={{ alignSelf: 'flex-start', color: 'red', marginBottom: 10 }}>
                            {err}
                        </ThemedText>
                    ))}
                    <Pressable
                        onPress={() => setAgreed(!agreed)}
                        style={{ flexDirection: 'row', alignSelf: 'flex-start', gap: 6 }}
                    >
                        {
                            agreed ? (
                                <IconSymbol
                                    name="checkmark"
                                    size={18}
                                    color={Colors[colorScheme].highlight}
                                    style={{
                                        width: 18,
                                        height: 18,
                                        borderWidth: 1,
                                        borderColor: Colors[colorScheme].highlight,
                                        textAlign: 'center',
                                    }}
                                />
                            ) : (
                                <View
                                    style={{
                                        width: 18,
                                        height: 18,
                                        borderWidth: 1,
                                        borderColor: Colors[colorScheme].highlight,
                                    }}
                                />
                            )
                        }
                        <ThemedText type="default">
                            I agree to the{' '}
                            <Text style={{ textDecorationLine: 'underline' }}>terms & policy</Text>
                        </ThemedText>
                    </Pressable>
                </View>
            </ScrollView>
            <ThemedView style={{ padding: 20 }}>
                <Pressable
                    style={[
                        globalStyles.pillButton,
                        { opacity: agreed ? 1 : 0.5, width: '100%' },
                    ]}
                    onPress={handleSignup}
                    disabled={!agreed}
                >
                    <ThemedText type="subtitle" style={{ color: Colors[colorScheme].pri }}>
                        Sign up
                    </ThemedText>
                </Pressable>
            </ThemedView>
        </ThemedView>
    );
}
