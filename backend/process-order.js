const admin = require('firebase-admin');

admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json'))
});

const db = admin.firestore();
const { checkAndUpdateTiers } = require('./point-system');

// Process a single order by ID
async function processOrderById(orderId) {
    const doc = await db.collection('orders').doc(orderId).get();
    if (!doc.exists) throw new Error('Order not found');
    const order = doc.data();
    if (order.rewarded) return;

    const userId = order.userId;
    const points = order.pointsEarned || 0;
    const userRef = db.collection('users').doc(userId);
    // Validate order.items
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
        throw new Error('Order has no items');
    }
    const productRefs = order.items.map(item => {
        if (!item.id) {
            throw new Error(`Invalid item: missing product id`);
        }
        return db.collection('products').doc(item.id);
    });

    // ✅ Pre-check inventory before starting transaction
    const productDocs = await Promise.all(productRefs.map(ref => ref.get()));
    for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        const productDoc = productDocs[i];
        if (!productDoc.exists) throw new Error(`Product ${item.id} not found`);
        const currentInventory = productDoc.data().inventory || [];
        const valid = currentInventory.some(invItem =>
            (!item.size || invItem.size === item.size) &&
            (!item.color || invItem.color === item.color) &&
            (invItem.quantity || 0) >= (item.quantity || 1)
        );
        if (!valid) throw new Error(`Not enough inventory for product ${item.id}`);
    }

    // ✅ If check passes, run transaction for updates and points
    await db.runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists) throw new Error('User not found');

        const productDocsTx = await Promise.all(
            productRefs.map(ref => t.get(ref))
        );

        for (let i = 0; i < order.items.length; i++) {
            const item = order.items[i];
            const productDoc = productDocsTx[i];
            const currentInventory = productDoc.data().inventory || [];
            const updatedInventory = currentInventory.map(invItem => {
                if (
                    (!item.size || invItem.size === item.size) &&
                    (!item.color || invItem.color === item.color)
                ) {
                    return { ...invItem, quantity: invItem.quantity - item.quantity };
                }
                return invItem;
            });
            t.update(productRefs[i], { inventory: updatedInventory });
        }

        const currentPoints = userDoc.data().points || 0;
        const newPoints = currentPoints + points;
        const now = new Date();
        const recentActivityEntry = {
            type: 'purchase',
            date: now,
            orderId,
            pointsAdded: points,
        };

        t.update(userRef, {
            points: newPoints,
            recentActivity: admin.firestore.FieldValue.arrayUnion(recentActivityEntry),
        });

        // Pass already fetched user data to avoid extra reads
        await checkAndUpdateTiers(t, userRef, newPoints, userDoc.data());

        t.update(doc.ref, { rewarded: true });
        const lastUpdateRef = db.collection('lastupdate').doc('lastupdate');
        t.set(lastUpdateRef, { updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
}

module.exports = (app) => {
    const bodyParser = require('body-parser');
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

    // Create a new order
    app.post('/api/create-order', async (req, res) => {
        const { userId, items, pickup, voucherId } = req.body;

        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid order data' });
        }

        try {
            // Calculate subtotal, tax, total, and points (example logic)
            let subtotal = 0;
            for (const item of items) {
                subtotal += (item.price || 0) * (item.quantity || 1);
            }
            const gst = Math.round(subtotal * 0.1); // 10% GST rounded
            const total = subtotal + gst;
            const pointsEarned = Math.round(subtotal * 5); // total * 5 points

            // Pre-check inventory before creating order
            const productRefs = items.map(item => {
                if (!item.id) {
                    throw new Error(`Invalid item: missing product id`);
                }
                return db.collection('products').doc(item.id);
            });

            const productDocs = await Promise.all(productRefs.map(ref => ref.get()));
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const productDoc = productDocs[i];
                if (!productDoc.exists) throw new Error(`Product ${item.id} not found`);
                const currentInventory = productDoc.data().inventory || [];
                const valid = currentInventory.some(invItem =>
                    (!item.size || invItem.size === item.size) &&
                    (!item.color || invItem.color === item.color) &&
                    (invItem.quantity || 0) >= (item.quantity || 1)
                );
                if (!valid) throw new Error(`Not enough inventory for product ${item.id}`);
            }

            const orderRef = db.collection('orders').doc();
            const orderNumber = `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
            await orderRef.set({
                userId,
                items,
                pickup,
                subtotal,
                gst,
                total,
                pointsEarned,
                rewarded: false,
                status: 'pending',
                voucherId: voucherId || null,
                orderNumber,
                paymentMethod: 'ApplePay',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            await processOrderById(orderRef.id);

            // Mark voucher as used if voucherId is provided
            if (voucherId) {
                const userRef = db.collection('users').doc(userId);
                const userDoc = await userRef.get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const redeemedRewards = userData.redeemedRewards || [];
                    const updatedRedeemedRewards = redeemedRewards.map(r => {
                        if (r.voucherId === voucherId) {
                            return { ...r, used: true };
                        }
                        return r;
                    });
                    await userRef.update({ redeemedRewards: updatedRedeemedRewards });
                }
            }

            res.json({
                success: true,
                orderId: orderRef.id,
                orderNumber,
                subtotal,
                gst,
                total,
                pointsEarned
            });
        } catch (err) {
            console.error('❌ Failed to create order:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });
    // Add item to cart
    app.post('/api/cart/add', async (req, res) => {
        const { userId, item } = req.body;

        if (!userId || !item || !item.id || !item.color || !item.category) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const category = (item.category || '').toString().trim().toLowerCase();
        const isSouvenir = category === 'souvenirs';

        console.log('🛒 Incoming item:', item);
        console.log('🧪 Category:', category, '| isSouvenir:', isSouvenir);

        if (!isSouvenir && (!item.size || item.size === '')) {
            return res.status(400).json({ success: false, message: 'Size is required for non-souvenir items' });
        }
        try {
            const cartItemId = `${item.id}-${item.size}-${item.color}`;
            const itemRef = db.collection('users').doc(userId).collection('cart').doc(cartItemId);
            await itemRef.set({
                ...item,
                cartItemId,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    // Update cart item quantity
    app.post('/api/cart/update', async (req, res) => {
        const { userId, cartItemId, quantity } = req.body;
        if (!userId || !cartItemId || typeof quantity !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }
        try {
            const itemRef = db.collection('users').doc(userId).collection('cart').doc(cartItemId);
            await itemRef.set({ quantity }, { merge: true });
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    // Remove cart item
    app.post('/api/cart/remove', async (req, res) => {
        const { userId, cartItemId } = req.body;
        if (!userId || !cartItemId) {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }
        try {
            const itemRef = db.collection('users').doc(userId).collection('cart').doc(cartItemId);
            await itemRef.delete();
            res.json({ success: true });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    // Get cart items
    app.get('/api/cart', async (req, res) => {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Missing userId' });
        }
        try {
            const snapshot = await db.collection('users').doc(userId).collection('cart').get();
            const items = snapshot.docs.map(doc => ({ cartItemId: doc.id, ...doc.data() }));
            res.json({ success: true, items });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    // Clear the entire cart
    app.post('/api/cart/clear', async (req, res) => {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'Missing userId' });
        }
        try {
            const cartRef = db.collection('users').doc(userId).collection('cart');
            const snapshot = await cartRef.get();
            const deletions = snapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletions);
            res.json({ success: true });
        } catch (err) {
            console.error('Failed to clear cart:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });

    // Move item quantity (increment or decrement) by delta (+1 or -1)
    app.post('/api/cart/change-quantity', async (req, res) => {
        const { userId, cartItemId, delta } = req.body;
        if (!userId || !cartItemId || typeof delta !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }
        try {
            const itemRef = db.collection('users').doc(userId).collection('cart').doc(cartItemId);
            const itemDoc = await itemRef.get();
            if (!itemDoc.exists) {
                return res.status(404).json({ success: false, message: 'Cart item not found' });
            }
            const currentQuantity = itemDoc.data().quantity || 1;
            const newQuantity = currentQuantity + delta;
            if (newQuantity < 1) {
                return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
            }
            await itemRef.set({ quantity: newQuantity }, { merge: true });
            res.json({ success: true, newQuantity });
        } catch (err) {
            console.error('Failed to change cart quantity:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });
};