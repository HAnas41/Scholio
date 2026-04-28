'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthChange, getUserRole, createOrUpdateUser, signInWithGoogle, signOutUser } from '@/lib/auth';
import { User } from 'firebase/auth';

const AuthContext = createContext<{user: User|null, loading: boolean, role: string|null, signIn: ()=>Promise<void>, signOut: ()=>Promise<void>}>({} as any);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User|null>(null);
  const [role, setRole] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthChange(async u => {
      if (!isMounted) return;
      setUser(u);
      if (u) {
        await createOrUpdateUser(u);
        if (!isMounted) return;
        if (u.email === 'muhammadanaas334@gmail.com') {
          setRole('admin');
        } else {
          setRole(await getUserRole(u.uid));
        }
      } else {
        setRole(null);
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signOut = useCallback(async () => {
    await signOutUser();
  }, []);

  const value = useMemo(
    () => ({ user, loading, role, signIn, signOut }),
    [user, loading, role, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
