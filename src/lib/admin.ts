import * as admin from 'firebase-admin';
if (!admin.apps.length) {
  const config: admin.AppOptions = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try { 
      const parsedKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      config.credential = admin.credential.cert(parsedKey); 
    } catch(e: any) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
    }
  }
  admin.initializeApp(config);
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const isAdmin = async (uid: string) => {
  try {
    const doc = await adminDb.collection('users').doc(uid).get();
    return doc.data()?.role === 'admin';
  } catch (err: any) {
    console.error('Error in isAdmin check:', err.message);
    return false;
  }
};
export const verifyAuth = async (req: Request) => {
  const token = req.headers.get('Authorization')?.split('Bearer ')[1];
  if (!token) return null;
  try {
    const d = await adminAuth.verifyIdToken(token);
    return { uid: d.uid, role: (await isAdmin(d.uid)) ? 'admin' : 'student' };
  } catch (err: any) { 
    console.error('Error verifying auth:', err.message);
    return null; 
  }
};
