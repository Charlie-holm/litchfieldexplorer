import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/firebaseConfig';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/firebaseConfig';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { getTierDisplayDetails } from '@/scripts/pointsSystem';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

// ... [imports remain unchanged]

export default function PointsDetailScreen() {
  const globalStyles = useGlobalStyles();
  const db = getFirestore(app);
  const user = auth.currentUser;

  const [currentPoints, setCurrentPoints] = useState(0);
  const [tier, setTier] = useState('Basic');
  const [tierAchievedDate, setTierAchievedDate] = useState('');
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);

  const { theme: colorScheme } = useThemeContext();
  const backgroundColor = Colors[colorScheme].background;
  const textColor = Colors[colorScheme].text;
  const borderColor = Colors[colorScheme].border;

  const { nextTier, pointsToNext, formattedExpiryDate, newTier } =
    getTierDisplayDetails(tier, currentPoints, tierAchievedDate);

  const progressColor = Colors.tier[tier] || Colors.tier.Basic;

  const rewards = [
    { name: 'Free Coffee', cost: 200 },
    { name: '10% Off Coupon', cost: 500 },
    { name: 'Exclusive Mug', cost: 800 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const oldTier = data.tier || 'Basic';
          const points = data.points || 0;

          setCurrentPoints(points);
          setTier(oldTier);
          setTierAchievedDate(data.tierAchievedDate || '');

          const { newTier } = getTierDisplayDetails(oldTier, points, data.tierAchievedDate || '');

          // Tier upgrade check
          if (newTier !== oldTier) {
            setShowUpgradeMessage(true);

            // Update tier in Firestore
            await docRef.update({
              tier: newTier,
              tierAchievedDate: new Date().toISOString(),
            });

            // Refresh state
            setTier(newTier);
            setTierAchievedDate(new Date().toISOString());
          }
        }
      }
    };
    fetchData();
  }, [user]);

  const handleRedeem = (reward) => {
    const rewardName = reward || 'Unknown Reward';
    alert(`Redeemed: ${reward}`);
  };

  return (
    <ThemedView style={globalStyles.container}>
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={{ paddingVertical: 30, paddingHorizontal: 20 }}
      >
        <ThemedView style={{ width: '100%' }}>
          <AnimatedCircularProgress
            style={{ alignSelf: 'center' }}
            size={300}
            width={40}
            fill={
              pointsToNext > 0
                ? (currentPoints / (pointsToNext + currentPoints)) * 100
                : 100
            }
            tintColor={progressColor}
            backgroundColor={borderColor}
            rotation={0}
            lineCap="round"
          >
            {(fill) => (
              <View style={{ alignItems: 'center' }}>
                <ThemedText type="subtitle">
                  {currentPoints} / {pointsToNext + currentPoints} pts
                </ThemedText>
                <View style={{ height: 10 }} />
                <ThemedText type="title">{tier} Tier</ThemedText>
              </View>
            )}
          </AnimatedCircularProgress>

          {showUpgradeMessage ? (
            <ThemedText type="title" style={{ marginTop: 20, textAlign: 'center', color: 'green' }}>
              🎉 Congratulations! You've reached the {tier} Tier!
            </ThemedText>
          ) : (
            <ThemedText
              type="default"
              style={{ marginTop: 20, textAlign: 'center' }}
            >
              {pointsToNext > 0
                ? `Earn ${pointsToNext} more points to reach ${nextTier} Tier!`
                : `You've reached the highest tier! 🎉`}
            </ThemedText>
          )}

          {/* Rewards First */}
          <View style={{ marginTop: 30 }}>
            <ThemedText type="title">Rewards</ThemedText>
            <View style={{ marginTop: 10 }}>
              {rewards.map((reward, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginVertical: 8,
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: Colors[colorScheme].card,
                    borderWidth: 1,
                    borderColor,
                  }}
                >
                  <ThemedText type="default">
                    🎁 {reward.name} - {reward.cost} pts
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => handleRedeem(reward.name)}
                    disabled={currentPoints < reward.cost}
                    style={{
                      backgroundColor:
                        currentPoints >= reward.cost
                          ? Colors[colorScheme].tint
                          : borderColor,
                      paddingVertical: 6,
                      paddingHorizontal: 14,
                      borderRadius: 10,
                    }}
                  >
                    <ThemedText
                      type="default"
                      style={{
                        color:
                          currentPoints >= reward.cost ? '#fff' : textColor,
                        fontWeight: '600',
                      }}
                    >
                      Redeem
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Recent Activity */}
            <ThemedText type="title" style={{ marginTop: 30 }}>
              Recent Activity
            </ThemedText>
            <View style={{ marginTop: 10 }}>
              <ThemedText type="default">+20 pts - Coffee Purchase</ThemedText>
              <ThemedText type="default">+50 pts - Completed Profile</ThemedText>
              <ThemedText type="default">+100 pts - Referral Bonus</ThemedText>
            </View>

            {formattedExpiryDate && (
              <ThemedText type="warning" style={{ marginTop: 30 }}>
                Your {tier} Tier expires on {formattedExpiryDate}
              </ThemedText>
            )}
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
