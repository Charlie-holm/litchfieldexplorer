import admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
    });
}

const db = admin.firestore();

export default function setupRewardRoutes(app) {
    // Middleware to verify Firebase ID token
    async function verifyToken(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const idToken = authHeader.split('Bearer ')[1];
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            req.uid = decodedToken.uid;
            next();
        } catch (error) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
    }

    // Helper to check if reward is still valid (last 30 days)
    function isRewardValid(redeemedAt) {
        const now = Date.now();
        const redeemedTime = redeemedAt.toMillis ? redeemedAt.toMillis() : redeemedAt;
        const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
        return now - redeemedTime <= THIRTY_DAYS_MS;
    }

    // GET /api/rewards/valid
    app.get('/api/rewards/valid', verifyToken, async (req, res) => {
        const uid = req.uid;

        try {
            const userDocRef = db.collection('users').doc(uid);
            const userDoc = await userDocRef.get();
            if (!userDoc.exists) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            const userData = userDoc.data();

            // Use Promise.all to fetch product images for each redeemed reward asynchronously
            const validRewards = await Promise.all(
                (userData.redeemedRewards || [])
                    .filter(reward => isRewardValid(reward.redeemedAt) && !reward.used)
                    .map(async ({ rewardName, voucherId, redeemedAt, productId }) => {
                        const redeemedTime = redeemedAt.toMillis ? redeemedAt.toMillis() : redeemedAt;
                        const expiryDate = new Date(redeemedTime + 30 * 24 * 60 * 60 * 1000);

                        return {
                            rewardName,
                            voucherId,
                            expiryDate: expiryDate.toISOString(),
                            productId,
                        };
                    })
            );

            res.json({ success: true, redeemedRewards: validRewards });
        } catch (error) {
            console.error('Error fetching user data:', error);
            res.status(500).json({ success: false, error: 'Failed to fetch user data' });
        }
    });

    // POST /api/rewards/apply
    app.post('/api/rewards/apply', verifyToken, async (req, res) => {
        const { cartItems, voucherId } = req.body;
        const uid = req.uid;

        if (!Array.isArray(cartItems) || !voucherId) {
            return res.status(400).json({ error: 'Invalid request payload' });
        }

        try {
            // Fetch user document
            const userDocRef = db.collection('users').doc(uid);
            const userDoc = await userDocRef.get();
            if (!userDoc.exists) {
                return res.status(404).json({ error: 'User not found' });
            }
            const userData = userDoc.data();

            // Find redeemed reward matching voucherId
            const redeemedReward = (userData.redeemedRewards || []).find(r => r.voucherId === voucherId);
            if (!redeemedReward) {
                return res.status(400).json({ error: 'Voucher not found or expired' });
            }
            if (redeemedReward.used) {
                return res.status(400).json({ error: 'Voucher already used' });
            }

            const rewardId = redeemedReward.rewardId;

            // Fetch reward document
            const rewardDoc = await db.collection('rewards').doc(rewardId).get();
            if (!rewardDoc.exists) {
                return res.status(400).json({ error: 'Reward not found' });
            }
            const rewardData = rewardDoc.data();

            // Calculate cart total
            const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            let updatedCartItems = [...cartItems];
            let discountValue = 0;

            if (rewardData.type === 'discount') {
                discountValue = (rewardData.discount / 100) * cartTotal;
                // Remove any free reward item if present
                updatedCartItems = updatedCartItems.filter(item => !item.freeRewardAdded);
            } else if (rewardData.type === 'free') {
                const freeProductId = rewardData.productId;
                const productDoc = await db.collection('products').doc(freeProductId).get();
                if (!productDoc.exists) {
                    return res.status(400).json({ error: 'Free reward product not found' });
                }
                const productInfo = productDoc.data();
                const freeItemInCart = updatedCartItems.find(item => item.productId === freeProductId);
                if (!freeItemInCart) {
                    updatedCartItems.push({
                        productId: freeProductId,
                        quantity: 1,
                        price: 0,
                        freeRewardAdded: true,
                        name: productInfo.name,
                        image: productInfo.imageUrl || '',
                    });
                }
                discountValue = 0; // Cancel discount because item is free
            }

            return res.json({ updatedCartItems, discountValue });

        } catch (error) {
            console.error('Error applying reward:', error);
            return res.status(500).json({ error: 'Failed to apply reward' });
        }
    });
}
