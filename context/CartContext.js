import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/firebaseConfig';
import { doc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const CartContext = createContext();

export function CartProvider({ children }) {
    const auth = getAuth();
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);
    useEffect(() => {
        const fetchCart = async () => {
            if (user) {
                const cartItems = await getCart();
                setCart(cartItems);
            } else {
                setCart([]);
            }
        };
        fetchCart();
    }, [user]);

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
        const updatedCart = await getCart();
        setCart(updatedCart);
    };

    const getCart = async (clear = false) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return [];
        const cartRef = collection(db, 'users', currentUser.uid, 'cart');
        const snapshot = await getDocs(cartRef);

        if (clear) {
            const deletions = snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref));
            await Promise.all(deletions);
            return [];
        }

        const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCart(result);
        return result;
    };

    const removeFromCart = async (productId) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const itemRef = doc(db, 'users', currentUser.uid, 'cart', productId);
        await deleteDoc(itemRef);
        const updatedCart = await getCart();
        setCart(updatedCart);
    };

    const updateCartItemQuantity = async (productId, quantity) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const itemRef = doc(db, 'users', currentUser.uid, 'cart', productId);
        await setDoc(itemRef, { quantity }, { merge: true });
        const updatedCart = await getCart();
        setCart(updatedCart);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, getCart, removeFromCart, updateCartItemQuantity }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);