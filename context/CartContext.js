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

    // Generate a unique ID for cart items based on product ID, size and color
    const getCartItemId = (item) => {
        return `${item.id}-${item.size}-${item.color}`;
    };

    const addToCart = async (item) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        
        if (!item.size || !item.color) {
            console.error('Missing size or color');
            return;
        }
        
        // Use the composite ID instead of just item.id
        const cartItemId = getCartItemId(item);
        const itemRef = doc(db, 'users', currentUser.uid, 'cart', cartItemId);
        
        // Check if item already exists in cart
        const existingItem = cart.find(cartItem => 
            cartItem.id === item.id && 
            cartItem.size === item.size && 
            cartItem.color === item.color
        );
        
        const newQuantity = existingItem ? existingItem.quantity + item.quantity : item.quantity;
        
        await setDoc(itemRef, {
            ...item,
            price: item.price || 0, // Ensure price exists
            cartItemId,
            createdAt: new Date().toISOString() // Add timestamp for sorting
        }, { merge: true });
        
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

        const result = snapshot.docs.map(doc => ({ 
            id: doc.data().id, // Original product ID
            cartItemId: doc.id, // Composite ID (productId-size-color)
            ...doc.data() 
        }));
        setCart(result);
        return result;
    };

    const removeFromCart = async (cartItemId) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    // 1. Optimistically update local UI first
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    
    // 2. Delete from Firestore
    const itemRef = doc(db, 'users', currentUser.uid, 'cart', cartItemId);
    await deleteDoc(itemRef);
    
    // 3. Optional: Force refresh from server to confirm sync
    const freshCart = await getCart();
    setCart(freshCart);
    
  } catch (error) {
    // If error occurs, revert to server state
    console.error("Failed to remove item:", error);
    const currentCart = await getCart();
    setCart(currentCart);
  }
};

    const updateCartItemQuantity = async (cartItemId, quantity) => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
  
        const itemRef = doc(db, 'users', currentUser.uid, 'cart', cartItemId);
        await setDoc(itemRef, { quantity }, { merge: true });
  
  // Update local state by composite ID
        setCart(prev => prev.map(item => 
            item.cartItemId === cartItemId ? {...item, quantity} : item
        ));
        };

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            getCart, 
            removeFromCart, 
            updateCartItemQuantity 
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);