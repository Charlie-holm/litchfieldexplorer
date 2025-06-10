import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/firebaseConfig';
import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '@/firebaseConfig';
import { Colors } from '@/constants/Colors';
import { useThemeContext } from '@/context/ThemeProvider';
import { useGlobalStyles } from '@/constants/globalStyles';
import { getTierDisplayDetails } from '@/scripts/pointsSystem';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

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

  const { theme: colorScheme } = useThemeContext();
  const backgroundColor = Colors[colorScheme].background;
  const textColor = Colors[colorScheme].tri;
  const borderColor = Colors[colorScheme].for;

  const { nextTier, pointsToNext, formattedExpiryDate, newTier } =
    getTierDisplayDetails(tier, currentPoints, tierAchievedDate);

  const progressColor = Colors.tier[tier] || Colors.tier.Basic;

  const rewards = [
    { name: 'Free Coffee', cost: 200 },
    { name: '10% Off Coupon', cost: 500 },
    { name: 'Exclusive Mug', cost: 800 },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        fetchData(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (user) => {
    if (!user?.uid) return;
    console.log("Current User UID:", user.uid);
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("User document data:", docSnap.data());
      const data = docSnap.data();
      const oldTier = data.tier || 'Basic';
      const points = data.points || 0;

      setCurrentPoints(points);
      setTier(oldTier);
      setTierAchievedDate(data.tierAchievedDate || '');
      const achievedDate = new Date(data.tierAchievedDate?.seconds ? data.tierAchievedDate.seconds * 1000 : data.tierAchievedDate);
      const expiryDate = new Date(achievedDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      const { newTier } = getTierDisplayDetails(oldTier, points, data.tierAchievedDate || '');

      if (newTier !== oldTier) {
        setShowUpgradeMessage(true);
        await updateDoc(docRef, {
          tier: newTier,
          tierAchievedDate: new Date().toISOString(),
        });
        setTier(newTier);
        setTierAchievedDate(new Date().toISOString());
      }

      const allOrdersSnap = await getDocs(collection(db, 'orders'));
      const userOrders = allOrdersSnap.docs.filter(doc => doc.data().userId === user.uid);
      const orderActivities = userOrders.map(doc => {
        const data = doc.data();
        return {
          points: Math.round((data.total || 0) * 10),
          label: `Order - ${data.items?.length || 0} item(s)`,
          date: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : '',
        };
      });
      console.log("Fetched All Orders:", allOrdersSnap.docs.map(doc => doc.data()));
      console.log("Filtered User Orders:", userOrders.map(doc => doc.data()));
      console.log("Order Activities:", orderActivities);
      setActivities(orderActivities);

      const allRewards = Array.isArray(data.redeemedRewards) ? data.redeemedRewards : [];
      console.log("Setting redeemed rewards with:", allRewards);
      setRedeemedRewards(allRewards);
    }
  };

  const handleRedeem = async (rewardName) => {
    const selected = rewards.find(r => r.name === rewardName);
    if (!selected || currentPoints < selected.cost) return;

    const newPoints = currentPoints - selected.cost;
    const newReward = {
      name: selected.name,
      cost: selected.cost,
      date: new Date().toISOString(),
    };

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      points: newPoints,
      redeemedRewards: [...redeemedRewards, newReward],
    });

    setCurrentPoints(newPoints);
    const updatedDocSnap = await getDoc(userRef);
    const updatedData = updatedDocSnap.data();
    setRedeemedRewards(Array.isArray(updatedData.redeemedRewards) ? updatedData.redeemedRewards : []);
    alert(`Redeemed: ${selected.name}`);
  };

  console.log("RedeemedRewards state before render:", redeemedRewards, Array.isArray(redeemedRewards));

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
                    {currentPoints} / {pointsToNext + currentPoints} pts
                  </ThemedText>
                  <View style={{ height: 10 }} />
                  <ThemedText type="title">{tier} Tier</ThemedText>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>

          <View style={[globalStyles.overlayContent, { width: '100%', marginVertical: 10, marginTop: 20 }]}>
            {showUpgradeMessage ? (
              <>
                <ThemedText type="title" style={{ textAlign: 'center', color: '#4CAF50' }}>
                  🎉 Congratulations! You've reached the {tier} Tier!
                </ThemedText>
              </>
            ) : (
              <ThemedText type="default" style={{ textAlign: 'center' }}>
                {pointsToNext > 0
                  ? `Earn ${pointsToNext} more points to reach ${nextTier} Tier!`
                  : `You've reached the highest tier! 🎉`}
              </ThemedText>
            )}
          </View>
          <View style={[globalStyles.overlayContent, { width: '100%', marginVertical: 10 }]}>
            <ThemedText type="default" style={{ textAlign: 'center' }}>
              Next Tier: {nextTier}
            </ThemedText>
            <ThemedText type="small" style={{ textAlign: 'center', marginTop: 4 }}>
              {pointsToNext} pts needed to reach {nextTier} Tier
            </ThemedText>
            {formattedExpiryDate && (
              <ThemedText type="small" style={{ textAlign: 'center', marginTop: 4 }}>
                Tier valid until {formattedExpiryDate}
              </ThemedText>
            )}
          </View>

          <View style={{ marginTop: 20 }}>
            <ThemedText type="title">Rewards</ThemedText>
            <View style={{ marginTop: 10 }}>
              {rewards.map((reward, index) => (
                <View key={index} style={[globalStyles.buttonCard, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                  <ThemedText type="default">
                    🎁 {reward.name} - {reward.cost} pts
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => handleRedeem(reward.name)}
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
              {redeemedRewards.map((r, idx) => {
                console.log("Rendering reward:", r);
                const redeemedDate = new Date(r.date);
                const expiryDate = new Date(redeemedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                return (
                  <View key={idx} style={globalStyles.buttonCard}>
                    <View>
                      <ThemedText type="subtitle">
                        🎁 {r.name}
                      </ThemedText>
                      <ThemedText type="small" style={{ marginTop: 4 }}>
                        {r.cost} pts | Redeemed on {redeemedDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} | Expires on {expiryDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>


          </View>

          {/* Recent Activity */}
          <ThemedText type="title" style={{ marginTop: 30 }}>
            Recent Activity
          </ThemedText>
          <View style={{ marginTop: 10 }}>
            {activities.length === 0 ? (
              <ThemedText type="default">No recent activity found.</ThemedText>
            ) : (
              activities.map((act, index) => (
                <View key={index} style={globalStyles.buttonCard}>
                  <ThemedText type="subtitle">+{act.points} pts</ThemedText>
                  <ThemedText type="small" style={{ marginTop: 4 }}>
                    {act.label} {act.date ? `| ${act.date}` : ''}
                  </ThemedText>
                </View>
              ))
            )}
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
