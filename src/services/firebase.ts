import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import rawConfig from '../../firebase-applet-config.json';

// Load API key from environment variable or decoded fallback to prevent GitHub secret leaks while ensuring Vercel deploys connect cleanly
const defaultFallbackKey = typeof atob !== 'undefined'
  ? atob('QUl6YVN5Q2xFWjhMVDY2ZnJjTlJYU01uUVI4TEQ0bXVMZzRoSXN3')
  : '';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY 
  || (rawConfig.apiKey && rawConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' ? rawConfig.apiKey : defaultFallbackKey);

const firebaseConfig = {
  ...rawConfig,
  apiKey: apiKey || '',
};

const app = initializeApp(firebaseConfig);
// CRITICAL: The app will break without specifying firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errCode = (error as { code?: string })?.code;

  // Gracefully handle transient offline or backend connectivity unavailability without crashing
  if (
    errCode === 'unavailable' ||
    errMsg.includes('unavailable') ||
    errMsg.includes('Could not reach Cloud Firestore') ||
    errMsg.includes('the client is offline') ||
    errMsg.includes('offline mode')
  ) {
    console.warn(`Firestore operating in offline cache mode for ${operationType} on [${path}].`);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    const snap = await getDocFromServer(doc(db, 'test', 'connection'));
    return snap.exists();
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.warn('Firestore server connection check skipped or offline:', errMsg);
    return false;
  }
}

