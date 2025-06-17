

const admin = require('firebase-admin');

module.exports = (app) => {
    // Process order endpoint (example, assumed to exist)
    // app.post('/api/process-order', async (req, res) => { ... });

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