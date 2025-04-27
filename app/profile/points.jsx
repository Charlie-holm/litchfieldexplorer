import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/firebaseConfig';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { getTierDisplayDetails } from '@/scripts/pointsSystem';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

export default function PointsDetailScreen() {
    const globalStyles = useGlobalStyles();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const user = auth.currentUser;
    const [currentPoints, setCurrentPoints] = useState(0);
    const [tier, setTier] = useState('Basic');
    const [tierAchievedDate, setTierAchievedDate] = useState('');

    const { nextTier, pointsToNext, formattedExpiryDate } = getTierDisplayDetails(tier, currentPoints, tierAchievedDate);

    const { theme: colorScheme } = useThemeContext();

    const progressColor = Colors.tier[tier] || Colors.tier.Basic;

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setCurrentPoints(data.points || 0);
                    setTier(data.tier || 'Basic');
                    setTierAchievedDate(data.tierAchievedDate || '');

                    const details = getTierDisplayDetails(data.tier || 'Basic', data.points || 0, data.tierAchievedDate || '');
                    setDisplayDetails(details);
                }
            }
        };
        fetchData();
    }, [user]);

    return (
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
            <ThemedView>
                <AnimatedCircularProgress
                    style={{ alignSelf: 'center' }}
                    size={300}
                    width={40}
                    fill={(pointsToNext > 0) ? (currentPoints / (pointsToNext + currentPoints)) * 100 : 100}
                    tintColor={progressColor}
                    backgroundColor={Colors[colorScheme].border}
                    rotation={0}
                    lineCap="round"
                >
                    {
                        (fill) => (
                            <View style={{ alignItems: 'center' }}>
                                <ThemedText type="subtitle">
                                    {currentPoints} / {pointsToNext + currentPoints} pts
                                </ThemedText>
                                <View style={{ height: 10 }} />
                                <ThemedText type="title">{tier} Tier</ThemedText>
                            </View>
                        )
                    }
                </AnimatedCircularProgress>
                <ThemedText type="default" style={{ marginTop: 20 }}>
                    {pointsToNext > 0
                        ? `Earn ${pointsToNext} more points to reach ${nextTier} Tier!`
                        : `You've reached the highest tier! 🎉`}
                </ThemedText>
                <View style={globalStyles.itemContainer}>
                </View>
                <View style={{ width: '90%', marginTop: 30 }}>
                    <ThemedText type="title">Recent Activity</ThemedText>
                    <View style={{ marginTop: 10 }}>
                        <ThemedText type="default">+20 pts - Coffee Purchase</ThemedText>
                        <ThemedText type="default">+50 pts - Completed Profile</ThemedText>
                        <ThemedText type="default">+100 pts - Referral Bonus</ThemedText>
                    </View>

                    <ThemedText type="title" style={{ marginTop: 30 }}>Rewards</ThemedText>
                    <View style={{ marginTop: 10 }}>
                        <ThemedText type="default">🎁 Free Coffee - 200 pts</ThemedText>
                        <ThemedText type="default">🎁 10% Off Coupon - 500 pts</ThemedText>
                        <ThemedText type="default">🎁 Exclusive Mug - 800 pts</ThemedText>
                    </View>

                    {formattedExpiryDate && (
                        <ThemedText type="warning" style={{ marginTop: 30 }}>
                            Your {tier} Tier expires on {formattedExpiryDate}
                        </ThemedText>
                    )}
                </View>
            </ThemedView>
        </ScrollView>
    );
}