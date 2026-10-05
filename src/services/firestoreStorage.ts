import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { CompletedOrder } from '../types';

export interface StoredUserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  calibrationScore?: number;
  savedPreferences?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StoredWishlistItem {
  productId: string;
  userId: string;
  productName: string;
  category: string;
  price: number;
  addedAt?: string;
}

export interface StoredOrder {
  orderId: string;
  orderNumber: string;
  userId: string;
  totalAmount: number;
  itemCount: number;
  paymentMethod: string;
  status: 'completed' | 'processing';
  createdAt?: string;
}

export interface StoredSessionState {
  userId: string;
  primaryCategory: string;
  confidence: number;
  totalInteractions: number;
  trendDescription?: string;
  updatedAt?: string;
}

/**
 * Saves or updates user profile in Firestore
 */
export async function saveUserProfileToFirestore(profile: StoredUserProfile): Promise<void> {
  const path = `users/${profile.id}`;
  try {
    const payload: Record<string, unknown> = {
      id: profile.id.slice(0, 128),
      email: profile.email.slice(0, 256),
      displayName: (profile.displayName || 'Fashion Enthusiast').slice(0, 128)
    };

    if (profile.photoURL) {
      payload.photoURL = profile.photoURL.slice(0, 512);
    }
    if (typeof profile.calibrationScore === 'number') {
      payload.calibrationScore = Math.min(100, Math.max(0, Math.round(profile.calibrationScore)));
    }
    if (Array.isArray(profile.savedPreferences)) {
      payload.savedPreferences = profile.savedPreferences.slice(0, 20).map(p => String(p).slice(0, 64));
    }
    payload.updatedAt = new Date().toISOString().slice(0, 64);
    if (profile.createdAt) {
      payload.createdAt = profile.createdAt.slice(0, 64);
    } else {
      payload.createdAt = new Date().toISOString().slice(0, 64);
    }

    await setDoc(doc(db, 'users', profile.id), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches user profile from Firestore
 */
export async function fetchUserProfileFromFirestore(userId: string): Promise<StoredUserProfile | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as StoredUserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Saves a wishlisted item to Firestore
 */
export async function saveWishlistItemToFirestore(
  userId: string, 
  productId: string, 
  productName: string, 
  category: string, 
  price: number
): Promise<void> {
  const cleanProductId = productId.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64);
  const path = `users/${userId}/wishlist/${cleanProductId}`;
  try {
    const payload: StoredWishlistItem = {
      productId: cleanProductId,
      userId,
      productName: productName.slice(0, 128),
      category: category.slice(0, 64),
      price: Math.max(0, parseFloat(price.toFixed(2))),
      addedAt: new Date().toISOString().slice(0, 64)
    };
    await setDoc(doc(db, 'users', userId, 'wishlist', cleanProductId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Removes a wishlisted item from Firestore
 */
export async function removeWishlistItemFromFirestore(userId: string, productId: string): Promise<void> {
  const cleanProductId = productId.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64);
  const path = `users/${userId}/wishlist/${cleanProductId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'wishlist', cleanProductId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes in real-time to the user's wishlist in Firestore
 */
export function subscribeToUserWishlist(
  userId: string,
  onUpdate: (productIds: string[]) => void
): Unsubscribe {
  const path = `users/${userId}/wishlist`;
  return onSnapshot(
    collection(db, 'users', userId, 'wishlist'),
    (snapshot) => {
      const ids = snapshot.docs.map(d => d.id);
      onUpdate(ids);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Saves completed order to Firestore
 */
export async function saveUserOrderToFirestore(
  userId: string, 
  order: CompletedOrder
): Promise<void> {
  const cleanOrderId = order.orderNumber.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64) || `ord-${Date.now()}`;
  const path = `users/${userId}/orders/${cleanOrderId}`;
  try {
    const totalAmount = typeof order.total === 'number' 
      ? Math.max(0, parseFloat(order.total.toFixed(2))) 
      : 0;
    const itemCount = Array.isArray(order.items) 
      ? Math.max(1, order.items.reduce((acc, curr) => acc + (curr.quantity || 1), 0))
      : 1;

    const payload: StoredOrder = {
      orderId: cleanOrderId,
      orderNumber: order.orderNumber.slice(0, 64),
      userId,
      totalAmount,
      itemCount,
      paymentMethod: (order.paymentMethod || 'CARD').slice(0, 64),
      status: 'completed',
      createdAt: (order.timestamp ? new Date(order.timestamp).toISOString() : new Date().toISOString()).slice(0, 64)
    };
    await setDoc(doc(db, 'users', userId, 'orders', cleanOrderId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribes to user's orders from Firestore
 */
export function subscribeToUserOrders(
  userId: string,
  onUpdate: (orders: StoredOrder[]) => void
): Unsubscribe {
  const path = `users/${userId}/orders`;
  return onSnapshot(
    collection(db, 'users', userId, 'orders'),
    (snapshot) => {
      const orders = snapshot.docs.map(d => d.data() as StoredOrder);
      onUpdate(orders);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Persists session state to Firestore
 */
export async function saveUserSessionToFirestore(
  userId: string,
  state: {
    primaryCategory: string;
    confidence: number;
    totalInteractions: number;
    trendDescription?: string;
  }
): Promise<void> {
  const path = `users/${userId}/session/current`;
  try {
    const payload: StoredSessionState = {
      userId,
      primaryCategory: (state.primaryCategory || 'Outerwear').slice(0, 64),
      confidence: Math.min(1, Math.max(0, parseFloat(state.confidence.toFixed(2)))),
      totalInteractions: Math.max(0, state.totalInteractions),
      trendDescription: (state.trendDescription || '').slice(0, 256),
      updatedAt: new Date().toISOString().slice(0, 64)
    };
    await setDoc(doc(db, 'users', userId, 'session', 'current'), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
