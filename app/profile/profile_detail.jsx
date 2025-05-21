import NetInfo from '@react-native-community/netinfo';
import { View, Pressable, TextInput, Alert, Image } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useState, useEffect } from 'react';
import { auth, db } from '@/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useGlobalStyles } from '@/constants/globalStyles';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import * as ImagePicker from 'expo-image-picker';

const CLOUD_NAME = 'djrzkaal4';
const UPLOAD_PRESET = 'user-profile-upload';

export default function ProfileDetailScreen() {
    const colorScheme = useColorScheme();
    const globalStyles = useGlobalStyles();
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [email, setEmail] = useState('');
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOffline(!state.isConnected);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const docRef = doc(db, 'users', auth.currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFirstName(data.firstName || '');
                setLastName(data.lastName || '');
                setEmail(data.email || '');
                setPhoneNumber(data.phoneNumber || '');
                setProfileImage(data.profileImage || '');
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                firstName,
                lastName,
                phoneNumber,
                email,
                profileImage
            });
            Alert.alert(
                'Success',
                'Profile updated successfully',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/profile')
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        }
    };

    const handlePickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert("Permission Denied", "You need to allow access to your photos to upload a profile picture.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            const formData = new FormData();

            formData.append('file', {
                uri: imageUri,
                type: 'image/jpeg',
                name: `${auth.currentUser.uid}.jpg`,
            });
            formData.append('upload_preset', UPLOAD_PRESET);
            formData.append('folder', 'user-profile-pic');

            try {
                const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (data.secure_url) {
                    setProfileImage(data.secure_url);
                    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                        profileImage: data.secure_url
                    });
                    Alert.alert("Image Uploaded!", "Profile picture updated.");
                } else {
                    Alert.alert('Upload Failed', JSON.stringify(data));
                }
            } catch (err) {
                Alert.alert('Error', 'Failed to upload image');
            }
        }
    };

    return (
        <ThemedView style={globalStyles.container}>
            <View style={[globalStyles.itemContainer, { flex: 1, justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'column', alignItems: 'left', justifyContent: 'space-between' }}>
                        <View style={globalStyles.profileImage}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={globalStyles.image} />
                            ) : (
                                <IconSymbol name="person.circle" size={120} />
                            )}
                        </View>
                        <Pressable
                            onPress={handlePickImage}
                            style={[globalStyles.smallPillButton, { width: 120 }]}
                        >
                            <ThemedText type="default" style={{ color: '#fff' }}>Edit</ThemedText>
                        </Pressable>
                    </View>
                    <View style={{ flex: 1 }}>
                        <ThemedText type="defaultBold" style={{ marginVertical: 5 }}>First Name</ThemedText>
                        <TextInput
                            style={globalStyles.thinInputTextBox}
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <ThemedText type="defaultBold" style={{ marginVertical: 5 }}>Last Name</ThemedText>
                        <TextInput
                            style={globalStyles.thinInputTextBox}
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>
                </View>
                <View style={{ width: '100%', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 10 }}>
                    <ThemedText type="defaultBold" style={{ marginVertical: 5 }}>Email</ThemedText>
                    <TextInput
                        style={[globalStyles.inputTextBox, { width: '100%' }]}
                        placeholder="Email"
                        value={email}
                        onChangeText={setEmail}
                    />
                    <ThemedText type="defaultBold" style={{ marginVertical: 5 }}>Phone Number</ThemedText>
                    <TextInput
                        style={[globalStyles.inputTextBox, { width: '100%' }]}
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>
                <View style={{ width: '100%', alignItems: 'center', marginTop: 'auto' }}>
                    {isOffline && (
                        <ThemedText type="default" style={{ marginBottom: 30, color: Colors[colorScheme].pri }}>
                            Please reconnect to save changes.
                        </ThemedText>
                    )}
                    <Pressable
                        style={[
                            globalStyles.pillButton,
                            { width: '100%', opacity: isOffline ? 0.5 : 1 }
                        ]}
                        onPress={handleSave}
                        disabled={isOffline}
                    >
                        <ThemedText type="subtitle" style={{ color: '#f8f8f8' }}>
                            Save
                        </ThemedText>
                    </Pressable>
                </View>
            </View>
        </ThemedView>
    );
}
