const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Scheduled function runs daily to expire tiers & vouchers
exports.expireTiersAndVouchers = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async () => {
        const usersSnapshot = await db.collection('users').get();

        const batch = db.batch();

        usersSnapshot.forEach(doc => {
            const data = doc.data();
            const userRef = db.collection('users').doc(doc.id);

            // Tier expiry after 1 year
            if (data.tier && data.tierAchievedDate) {
                const achievedDate = new Date(data.tierAchievedDate);
                const expiryDate = new Date(achievedDate);
                expiryDate.setFullYear(achievedDate.getFullYear() + 1);

                if (new Date() > expiryDate) {
                    batch.update(userRef, {
                        tier: 'Basic',
                        tierAchievedDate: '',
                    });
                }
            }

            // Voucher expiry after 1 month
            if (Array.isArray(data.redeemedRewards)) {
                const filteredRewards = data.redeemedRewards.filter(reward => {
                    const redeemedDate = new Date(reward.date);
                    const expiry = new Date(redeemedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                    return new Date() <= expiry;
                });
                batch.update(userRef, { redeemedRewards: filteredRewards });
            }
        });

        await batch.commit();
        console.log('Expired tiers downgraded & vouchers cleaned.');
    });