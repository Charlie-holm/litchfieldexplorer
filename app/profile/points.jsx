import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/firebaseConfig';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { app } from '@/firebaseConfig';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { getTierDisplayDetails } from '@/scripts/pointsSystem';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import ENV from '@/env';

export default function PointsDetailScreen() {
  const globalStyles = useGlobalStyles();
  const db = getFirestore(app);
  const [user, setUser] = useState(null);

  const [currentPoints, setCurrentPoints] = useState(0);
  const [tier, setTier] = useState('Basic');
  const [tierAchievedDate, setTierAchievedDate] = useState('');
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [activities, setActivities] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);

  const { theme: colorScheme } = useThemeContext();
  const backgroundColor = Colors[colorScheme].background;
  const textColor = Colors[colorScheme].tri;
  const borderColor = Colors[colorScheme].for;

  const { nextTier, pointsToNext, formattedExpiryDate } =
    getTierDisplayDetails(tier, currentPoints, tierAchievedDate);

  const progressColor = Colors.tier[tier] || Colors.tier.Basic;

  const fetchUserData = async (uid) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      setCurrentPoints(data.points || 0);
      setTier(data.tier || 'Basic');
      setTierAchievedDate(data.tierAchievedDate || '');
      setRedeemedRewards(data.redeemedRewards || []);

      const recentActivity = Array.isArray(data.recentActivity) ? data.recentActivity : [];

      const formattedActivity = recentActivity
        .slice()
        .sort((a, b) => {
          const dateA = a.date?.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime();
          const dateB = b.date?.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime();
          return dateB - dateA;
        })
        .map(entry => {
          const dateObj = entry.date?.seconds
            ? new Date(entry.date.seconds * 1000)
            : entry.date
              ? new Date(entry.date)
              : new Date();

          let label = 'Activity';
          let points = 0;

          if (entry.type === 'purchase') {
            label = 'Purchase';
            points = entry.pointsAdded || 0;
          } else if (entry.type === 'redeem') {
            label = `Voucher Redeemed`;
            points = -(entry.pointsUsed || 0);
          }

          return {
            label,
            points,
            date: dateObj.toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
          };
        });

      setActivities(formattedActivity);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchUserData(firebaseUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch all available rewards on mount
  useEffect(() => {
    const fetchRewards = async () => {
      const rewardsSnap = await getDocs(collection(db, 'rewards'));
      const fetchedRewards = rewardsSnap.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setAvailableRewards(fetchedRewards);
    };
    fetchRewards();
  }, []);

  const handleRedeem = async (rewardId) => {
    if (!user) return;
    const selected = availableRewards.find(r => r.id === rewardId);
    if (!selected || currentPoints < selected.cost) {
      Alert.alert('Cannot Redeem', 'Insufficient points or invalid reward.');
      return;
    }

    const requestUrl = `http://${ENV.API_BASE_URL}:3000/api/redeem-reward`;
    console.log('Redeem reward API URL:', requestUrl);
    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          rewardId: selected.id,
        }),
      });
      console.log('Redeem reward API response status:', response.status);
      const result = await response.json();
      if (result.success) {
        Alert.alert('Success', `Redeemed: ${selected.name}`);
        // Refetch user data to update points and activity
        await fetchUserData(user.uid);
      } else {
        Alert.alert('Redeem failed', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Network error:', error);
      Alert.alert('Network error', 'Unable to redeem reward.');
    }
  };

  return (
    <ThemedView style={globalStyles.container}>
      <ScrollView
        style={{ flex: 1, backgroundColor }}
        contentContainerStyle={{ paddingVertical: 30, paddingHorizontal: 20 }}
      >
        <ThemedView style={{ width: '100%' }}>
          <View
            style={{
              alignSelf: 'center',
              backgroundColor: Colors[colorScheme].pri,
              padding: 20,
              borderRadius: 200,
            }}
          >
            <AnimatedCircularProgress
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
                    {currentPoints > 1500
                      ? `${currentPoints} pts`
                      : `${currentPoints} / ${pointsToNext + currentPoints} pts`}
                  </ThemedText>
                  <View style={{ height: 10 }} />
                  <ThemedText type="title">{tier} Tier</ThemedText>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>

          <View style={[globalStyles.overlayContent, { width: '100%', marginVertical: 10, marginTop: 20 }]}>
            {showUpgradeMessage ? (
              <ThemedText type="subtitle" style={{ textAlign: 'center', color: '#4CAF50' }}>
                🎉 Congratulations! You've reached the {tier} Tier!
              </ThemedText>
            ) : (
              <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                {pointsToNext > 0
                  ? `Earn ${pointsToNext} more points to reach ${nextTier} Tier!`
                  : `You've reached the highest tier! 🎉`}
              </ThemedText>
            )}
          </View>
          <View style={[globalStyles.overlayContent, { width: '100%', marginVertical: 10 }]}>
            {pointsToNext > 0 && (
              <>
                <ThemedText type="default" style={{ textAlign: 'center' }}>
                  Next Tier: {nextTier}
                </ThemedText>
                <ThemedText type="small" style={{ textAlign: 'center', marginTop: 4 }}>
                  {pointsToNext} pts needed to reach {nextTier} Tier
                </ThemedText>
              </>
            )}
            {formattedExpiryDate && (
              <ThemedText
                type={pointsToNext > 0 ? 'small' : 'defaultSemiBold'}
                style={{ textAlign: 'center', marginTop: 4 }}
              >
                Tier valid until {formattedExpiryDate}
              </ThemedText>
            )}
          </View>

          <View style={{ marginTop: 20 }}>
            <ThemedText type="title">Rewards</ThemedText>
            <View style={{ marginTop: 10 }}>
              {availableRewards.length === 0 && (
                <ThemedText style={{ textAlign: 'left', marginTop: 10 }}>
                  No rewards available.
                </ThemedText>
              )}
              {availableRewards.map((reward, index) => (
                <View
                  key={index}
                  style={[
                    globalStyles.buttonCard,
                    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
                  ]}
                >
                  <ThemedText type="default">
                    🎁 {reward.name} - {reward.cost} pts
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => handleRedeem(reward.id)}
                    disabled={currentPoints < reward.cost}
                    style={[
                      globalStyles.smallPillButton,
                      {
                        backgroundColor:
                          currentPoints >= reward.cost
                            ? Colors[colorScheme].sec
                            : borderColor,
                        borderColor:
                          currentPoints >= reward.cost
                            ? Colors[colorScheme].sec
                            : borderColor,
                        width: '25%',
                      },
                    ]}
                  >
                    <ThemedText
                      type="small"
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

            <ThemedText type="title" style={{ marginTop: 30 }}>
              Redeemed Rewards
            </ThemedText>
            <View style={{ marginTop: 10 }}>
              {redeemedRewards.length === 0 ? (
                <ThemedText style={{ textAlign: 'left', marginTop: 10 }}>
                  No redeemed rewards found.
                </ThemedText>
              ) : (
                redeemedRewards
                  .filter(r => !r.used)
                  .map((r, idx) => {
                    const redeemedDate =
                      r.redeemedAt?.toDate?.() || new Date(r.redeemedAt);
                    const expiryDate = new Date(
                      redeemedDate.getTime() + 30 * 24 * 60 * 60 * 1000,
                    );
                    return (
                      <View key={idx} style={globalStyles.buttonCard}>
                        <View>
                          <ThemedText type="subtitle">🎁 {r.rewardName}</ThemedText>
                          <ThemedText type="small" style={{ marginTop: 4 }}>
                            {r.pointsUsed || r.cost} pts | Expires on{' '}
                            {expiryDate.toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })
              )}
            </View>
          </View>

          {/* Recent Activity */}
          <ThemedText type="title" style={{ marginTop: 30 }}>
            Recent Activities
          </ThemedText>
          <View style={{ marginTop: 10 }}>
            {activities.length === 0 ? (
              <ThemedText type="default">No recent activity found.</ThemedText>
            ) : (
              <>
                {activities.slice(0, 5).map((act, index) => (
                  <View
                    key={index}
                    style={[
                      globalStyles.buttonCard,
                      {
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <View>
                      <ThemedText type="subtitle">{act.label}</ThemedText>
                      {act.date ? (
                        <ThemedText type="small" style={{ marginTop: 4 }}>
                          {act.date}
                        </ThemedText>
                      ) : null}
                    </View>
                    <ThemedText type="subtitle">
                      {act.points < 0 ? `${act.points} pts` : `+${act.points} pts`}
                    </ThemedText>
                  </View>
                ))}
                {activities.length > 5 && (
                  <ThemedText
                    type="subtitle"
                    style={{ textAlign: 'center', marginTop: 10, fontSize: 40, fontWeight: 'bold' }}
                  >
                    ⋮
                  </ThemedText>
                )}
              </>
            )}
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}