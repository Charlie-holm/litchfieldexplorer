const admin = require('firebase-admin');

module.exports = (app) => {
    // Redeem reward endpoint (existing)
    app.post('/api/redeem-reward', async (req, res) => {
        const { userId, rewardId, rewardName, pointsRequired } = req.body;
        if (!userId || !rewardId || !rewardName || typeof pointsRequired !== 'number') {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const db = admin.firestore();
        const userRef = db.collection('users').doc(userId);
        try {
            await db.runTransaction(async (t) => {
                const userDoc = await t.get(userRef);
                if (!userDoc.exists) {
                    throw new Error('User not found');
                }
                const userData = userDoc.data();
                const currentPoints = userData.points || 0;
                if (currentPoints < pointsRequired) {
                    throw new Error('Not enough points');
                }
                // Deduct points
                t.update(userRef, {
                    points: currentPoints - pointsRequired,
                    lastupdate: admin.firestore.FieldValue.serverTimestamp(),
                });

                // Add to redeemedRewards
                const prevRedeemed = Array.isArray(userData.redeemedRewards) ? userData.redeemedRewards : [];
                const redeemedReward = {
                    rewardId,
                    rewardName,
                    pointsUsed: pointsRequired,
                    redeemedAt: admin.firestore.FieldValue.serverTimestamp(),
                };
                t.update(userRef, {
                    redeemedRewards: admin.firestore.FieldValue.arrayUnion(redeemedReward),
                });
                // Update recentActivity
                const activity = {
                    type: 'redeem-reward',
                    rewardId,
                    rewardName,
                    pointsUsed: pointsRequired,
                    timestamp: admin.firestore.FieldValue.serverTimestamp(),
                };
                t.update(userRef, {
                    recentActivity: admin.firestore.FieldValue.arrayUnion(activity),
                });
            });
            res.json({ success: true, message: 'Reward redeemed successfully.' });
        } catch (err) {
            res.status(400).json({ error: err.message || 'Failed to redeem reward' });
        }
    });

};

// Background tier check function
async function checkAndUpdateTiers() {
    // Inlined getTier function from tierHelpers
    function getTier(points) {
        if (points >= 1500) {
            return 'Platinum';
        } else if (points >= 1000) {
            return 'Gold';
        } else if (points >= 500) {
            return 'Silver';
        } else {
            return 'Basic';
        }
    }

    const db = admin.firestore();
    const usersSnapshot = await db.collection('users').get();
    const now = new Date();

    const batch = db.batch();

    usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data();
        const currentTier = userData.tier || 'Basic';
        const tierAchievedDate = userData.tierAchievedDate ? (userData.tierAchievedDate.toDate ? userData.tierAchievedDate.toDate() : new Date(userData.tierAchievedDate._seconds * 1000)) : null;
        const currentPoints = userData.points || 0;

        const newTier = getTier(currentPoints);

        const userRef = db.collection('users').doc(userDoc.id);

        // If new tier is higher -> upgrade immediately
        const tiers = ['Basic', 'Silver', 'Gold', 'Platinum'];
        if (tiers.indexOf(newTier) > tiers.indexOf(currentTier)) {
            batch.update(userRef, {
                tier: newTier,
                tierAchievedDate: admin.firestore.FieldValue.serverTimestamp(),
            });
            return; // already handled
        }

        if (!tierAchievedDate) return; // no tier date, skip downgrade logic

        const expiry = new Date(tierAchievedDate);
        expiry.setFullYear(expiry.getFullYear() + 1);

        if (now >= expiry && newTier !== currentTier) {
            batch.update(userRef, {
                tier: newTier,
                tierAchievedDate: newTier === 'Basic' ? null : admin.firestore.FieldValue.serverTimestamp(),
            });
        }
    });

    if (batch._ops.length === 0) {
        console.log('No tier changes necessary.');
        return;
    }

    await batch.commit();
    console.log('Tier statuses updated.');
}

// Schedule tier checking every 5 minutes
setInterval(() => {
    console.log('Running scheduled tier update check...');
    checkAndUpdateTiers().catch(console.error);
}, 5 * 60 * 1000);

module.exports.checkAndUpdateTiers = checkAndUpdateTiers;