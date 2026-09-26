import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { 
  saveUserProfileToFirestore, 
  fetchUserProfileFromFirestore,
  StoredUserProfile 
} from '../services/firestoreStorage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  provider: 'google';
  savedPreferences: string[];
  recommendationHistoryCount: number;
  lastLogin: string;
  calibrationScore?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isSignInModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserPreferences: (prefs: string[]) => Promise<void>;
  updateCalibrationScore: (score: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState<boolean>(false);

  // Sync Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          // Attempt to load existing user profile from Firestore
          const existing = await fetchUserProfileFromFirestore(fbUser.uid);
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          if (existing) {
            setUser({
              id: fbUser.uid,
              name: existing.displayName || fbUser.displayName || 'Google User',
              email: fbUser.email || existing.email || 'user@example.com',
              avatarUrl: existing.photoURL || fbUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`,
              provider: 'google',
              savedPreferences: existing.savedPreferences || ['Outerwear', 'Tailoring', 'Minimalist Aesthetics'],
              recommendationHistoryCount: 42,
              lastLogin: nowStr,
              calibrationScore: existing.calibrationScore ?? 94
            });
          } else {
            // New user bootstrap in Firestore
            const newStored: StoredUserProfile = {
              id: fbUser.uid,
              email: fbUser.email || 'user@example.com',
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Fashion Enthusiast',
              photoURL: fbUser.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`,
              calibrationScore: 94,
              savedPreferences: ['Outerwear', 'Tailoring', 'Minimalist Aesthetics'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            await saveUserProfileToFirestore(newStored);

            setUser({
              id: newStored.id,
              name: newStored.displayName,
              email: newStored.email,
              avatarUrl: newStored.photoURL || '',
              provider: 'google',
              savedPreferences: newStored.savedPreferences || [],
              recommendationHistoryCount: 1,
              lastLogin: nowStr,
              calibrationScore: 94
            });
          }
        } catch (err) {
          console.error('Error synchronizing user profile with Firestore:', err);
          // Fallback to in-memory profile from fbUser
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName || 'Google User',
            email: fbUser.email || 'user@example.com',
            avatarUrl: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            provider: 'google',
            savedPreferences: ['Outerwear', 'Minimalism'],
            recommendationHistoryCount: 1,
            lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      
      const storedProfile: StoredUserProfile = {
        id: fbUser.uid,
        email: fbUser.email || 'user@example.com',
        displayName: fbUser.displayName || 'Google User',
        photoURL: fbUser.photoURL || undefined,
        calibrationScore: user?.calibrationScore ?? 94,
        savedPreferences: user?.savedPreferences || ['Outerwear', 'Tailoring'],
        updatedAt: new Date().toISOString()
      };
      await saveUserProfileToFirestore(storedProfile);

      setIsSignInModalOpen(false);
    } catch (error: unknown) {
      console.error('Google Sign-In failed:', error);
      const msg = error instanceof Error ? error.message : 'Authentication failed';
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserPreferences = async (prefs: string[]): Promise<void> => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, savedPreferences: prefs } : null);
    try {
      await saveUserProfileToFirestore({
        id: user.id,
        email: user.email,
        displayName: user.name,
        savedPreferences: prefs,
        photoURL: user.avatarUrl,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to update preferences in Firestore:', e);
    }
  };

  const updateCalibrationScore = async (score: number): Promise<void> => {
    if (!user) return;
    setUser(prev => prev ? { ...prev, calibrationScore: score } : null);
    try {
      await saveUserProfileToFirestore({
        id: user.id,
        email: user.email,
        displayName: user.name,
        calibrationScore: score,
        photoURL: user.avatarUrl,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Failed to update calibration in Firestore:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        isLoading,
        authError,
        isSignInModalOpen,
        openSignInModal: () => setIsSignInModalOpen(true),
        closeSignInModal: () => setIsSignInModalOpen(false),
        signInWithGoogle,
        signOut,
        updateUserPreferences,
        updateCalibrationScore
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
