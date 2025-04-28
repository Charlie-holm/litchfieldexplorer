import { View, Pressable, Alert, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/firebaseConfig';
import { useGlobalStyles } from '@/constants/globalStyles';
import { useThemeContext } from '@/context/ThemeProvider';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { signOut } from 'firebase/auth';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { checkTierUpdate } from '@/scripts//pointsSystem';
import { getTierDisplayDetails } from '@/scripts/pointsSystem';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default function ProfileScreen() {
    const { theme: colorScheme } = useThemeContext();
    const globalStyles = useGlobalStyles();
    const router = useRouter();
    const user = auth.currentUser;
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [currentPoints, setPoints] = useState(0);
    const [tier, setTier] = useState('Basic');
    const [tierAchievedDate, setTierAchievedDate] = useState('');
    const progressColor = Colors.tier[tier] || Colors.tier.Basic;

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setPhoneNumber(data.phoneNumber || 'No phone number');
                    setProfileImage(data.profileImage || '');
                    setPoints(data.points || 0);
                    setTier(data.tier || 'Basic');
                    setTierAchievedDate(data.tierAchievedDate || '');

                    const tierUpdate = checkTierUpdate(data.points, data.tier, data.tierAchievedDate);
                    if (tierUpdate) {
                        await updateDoc(docRef, tierUpdate);
                    }
                }
            }
        };
        fetchUserData();
    }, [user]);

    const { nextTier, pointsToNext, formattedExpiryDate } = getTierDisplayDetails(tier, currentPoints, tierAchievedDate);

    const sections = [
        { label: 'Theme', icon: 'paintpalette', path: '/profile/theme' },
        { label: 'Wishlist', icon: 'heart', path: '/profile/wishlist' },
        { label: 'Payment', icon: 'creditcard', path: '/profile/payment' },
        { label: 'Help', icon: 'questionmark.circle', path: '/profile/help' },
        { label: 'Support', icon: 'bubble.left.and.bubble.right', path: '/profile/support' },
    ];

    return (
        <ThemedView style={{ flex: 1, justifyContent: 'space-between' }}>
            <ThemedView style={globalStyles.subPageContainer}>
                <Pressable onPress={() => router.push('/profile/profile_detail')}>
                    <View style={globalStyles.buttonCard}>
                        <View style={globalStyles.buttonCardIcon}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%' }} />
                            ) : (
                                <IconSymbol name="person.circle" size={70} color={Colors[colorScheme].icon} />
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="subtitle" style={{ fontWeight: 'bold' }}>
                                {user?.displayName || 'User Name'}
                            </ThemedText>
                            <ThemedText type="small">
                                {user?.email}
                            </ThemedText>
                            <ThemedText type="small">
                                {phoneNumber}
                            </ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={24} color={Colors[colorScheme].text} />
                    </View>
                </Pressable>
                <Pressable onPress={() => router.push('/profile/points')}>
                    <View style={globalStyles.buttonCard}>
                        <View style={globalStyles.buttonCardIcon}>
                            <AnimatedCircularProgress
                                size={80}
                                width={8}
                                fill={(pointsToNext + currentPoints > 0) ? (currentPoints / (pointsToNext + currentPoints)) * 100 : 100}
                                tintColor={progressColor}
                                backgroundColor={Colors[colorScheme].border}
                                rotation={0}
                                lineCap="round"
                            >
                                {
                                    (fill) => (
                                        <>
                                            <ThemedText type="defaultSemiBold">
                                                {currentPoints}
                                            </ThemedText>
                                            <ThemedText type="small">
                                                pts
                                            </ThemedText>
                                        </>
                                    )
                                }
                            </AnimatedCircularProgress>
                        </View>
                        <View style={{ flex: 1 }}>
                            <ThemedText type="subtitle" style={{ fontWeight: 'bold' }}>Litchfield Club</ThemedText>
                            <ThemedText type="defaultSemiBold" style={{ marginBottom: 2 }}>{tier} Tier</ThemedText>
                            {nextTier !== 'Max Tier' && (
                                <ThemedText type="small">Next Tier: {nextTier} ({pointsToNext} pts needed)</ThemedText>
                            )}
                            <ThemedText type="small">Tier Expiry: {formattedExpiryDate}</ThemedText>
                        </View>
                        <IconSymbol name="chevron.right" size={24} color={Colors[colorScheme].text} />
                    </View>
                </Pressable>

                {sections.map(({ label, icon, path }) => (
                    <Pressable key={path} onPress={() => router.push({ pathname: path, params: { title: label } })}>
                        <ThemedView style={globalStyles.buttonCard}>
                            <ThemedView style={globalStyles.buttonLeft}>
                                <IconSymbol name={icon} color={Colors[colorScheme].text} />
                                <ThemedText type="subtitle">{label}</ThemedText>
                            </ThemedView>
                            <IconSymbol name="chevron.right" size={28} color={Colors[colorScheme].text} />
                        </ThemedView>
                    </Pressable>
                ))}
            </ThemedView>
            <Pressable
                onPress={() => {
                    Alert.alert(
                        "Confirm Sign Out",
                        "Are you sure you want to sign out?",
                        [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Sign Out", onPress: async () => {
                                    try {
                                        await signOut(auth);
                                        router.replace('/(auth)');
                                    } catch (error) {
                                        console.error('Error signing out:', error);
                                    }
                                }
                            }
                        ]
                    );
                }}
                style={{ alignItems: 'center' }}
            >
                <ThemedView style={[globalStyles.pillButton, { width: '90%' }]}>
                    <ThemedText type="subtitle" style={{ color: Colors[colorScheme].pillButtonText }}>
                        Sign Out
                    </ThemedText>
                </ThemedView>
            </Pressable>
        </ThemedView >
    );
}