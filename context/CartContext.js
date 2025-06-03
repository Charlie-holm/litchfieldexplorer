import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/firebaseConfig';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const CartContext = createContext();

export function CartProvider({ children }) {
    const auth = getAuth();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            setUser(u);
        });
        return () => unsubscribe();
    }, []);

    const addToCart = async (item) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const itemRef = doc(db, 'users', currentUser.uid, 'cart', item.id);
        await setDoc(itemRef, item, { merge: true });
    };

    const getCart = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return [];
        const cartRef = collection(db, 'users', currentUser.uid, 'cart');
        const snapshot = await getDocs(cartRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    };

    const removeFromCart = async (productId) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const itemRef = doc(db, 'users', currentUser.uid, 'cart', productId);
        await deleteDoc(itemRef);
    };

    return (
        <CartContext.Provider value={{ addToCart, getCart, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);