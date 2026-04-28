import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, firebaseConfigError } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData.map((provider: any) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function assertFirebaseReady() {
  if (firebaseConfigError) {
    throw firebaseConfigError;
  }
  if (!auth || !db) {
    throw new Error('[firebase] Firebase SDK is not initialized.');
  }
}

let pendingGoogleSignIn: Promise<void> | null = null;

export const signInWithGoogle = async () => {
  assertFirebaseReady();
  const authInstance = auth;
  if (!authInstance) {
    throw new Error('[firebase] Auth is not initialized.');
  }

  if (pendingGoogleSignIn) {
    return pendingGoogleSignIn;
  }

  const provider = new GoogleAuthProvider();

  pendingGoogleSignIn = (async () => {
    try {
      await signInWithPopup(authInstance, provider);
    } catch (error: unknown) {
      const code = typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code: unknown }).code)
        : '';

      if (code === 'auth/popup-blocked' || code === 'auth/network-request-failed') {
        await signInWithRedirect(authInstance, provider);
        return;
      }

      // This can happen when multiple popup requests are triggered rapidly.
      // Returning here avoids a noisy surface-level error while in-flight guard handles dedupe.
      if (code === 'auth/cancelled-popup-request') {
        return;
      }

      throw error;
    } finally {
      pendingGoogleSignIn = null;
    }
  })();

  return pendingGoogleSignIn;
};

export const signOutUser = () => {
  if (!auth) return Promise.resolve();
  return signOut(auth);
};

export const onAuthChange = (cb: (u: User | null) => void) => {
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, cb);
};
export const getUserRole = async (uid: string): Promise<'student' | 'admin' | null> => {
  if (!db) {
    console.warn('[firebase] getUserRole skipped: Firestore is not initialized.');
    return null;
  }
  try {
    const s = await getDoc(doc(db, 'users', uid));
    return s.exists() ? s.data().role : null;
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, `users/${uid}`);
    return null;
  }
};
export const createOrUpdateUser = async (u: User) => {
  if (!db) {
    console.warn('[firebase] createOrUpdateUser skipped: Firestore is not initialized.');
    return;
  }
  const d = doc(db, 'users', u.uid);
  try {
    const s = await getDoc(d);
    if (s.exists()) {
      await updateDoc(d, { name: u.displayName || '', email: u.email || '' });
    } else {
      await setDoc(d, { name: u.displayName || '', email: u.email || '', role: 'student' });
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, `users/${u.uid}`);
  }
};
