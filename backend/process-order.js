const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json'))
});

const db = admin.firestore();

// Process a single order by ID
async function processOrderById(orderId) {
    const doc = await db.collection('orders').doc(orderId).get();
    if (!doc.exists) throw new Error('Order not found');
    const order = doc.data();

    if (order.rewarded) return; // already processed

    const userId = order.userId;
    const points = order.pointsEarned || 0;
    const userRef = db.collection('users').doc(userId);

    await db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) throw new Error('User not found');

        for (const item of order.items || []) {
            const productRef = db.collection('products').doc(item.id);
            const productDoc = await t.get(productRef);
            if (!productDoc.exists) throw new Error(`Product ${item.id} not found`);
            const currentInventory = productDoc.data().inventory || [];

            const updatedInventory = currentInventory.map(invItem => {
                if (
                    (item.size && invItem.size === item.size) &&
                    (item.color ? invItem.color === item.color : true)
                ) {
                    if ((invItem.quantity || 0) < (item.quantity || 1)) {
                        throw new Error(`Not enough inventory for product ${item.id}`);
                    }
                    return { ...invItem, quantity: invItem.quantity - item.quantity };
                }
                return invItem;
            });

            t.update(productRef, { inventory: updatedInventory });
        }

        const currentPoints = userDoc.data().points || 0;
        const now = new Date();
        const recentActivityEntry = {
            type: 'purchase',
            date: now,
            orderId,
            pointsAdded: points,
        };

        t.update(userRef, {
            points: currentPoints + points,
            recentActivity: admin.firestore.FieldValue.arrayUnion(recentActivityEntry),
        });

        t.update(doc.ref, { rewarded: true });

        const lastUpdateRef = db.collection('lastupdate').doc('lastupdate');
        t.set(lastUpdateRef, { updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
}

const app = express();
app.use(bodyParser.json());

app.post('/api/process-order', async (req, res) => {
    const { orderId } = req.body;
    try {
        await processOrderById(orderId);
        console.log(`✅ Processed order ${orderId}`);
        res.json({ success: true, message: `Order ${orderId} processed successfully.` });
    } catch (err) {
        console.error(`❌ Failed to process order ${orderId}`, err);
        res.status(400).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});