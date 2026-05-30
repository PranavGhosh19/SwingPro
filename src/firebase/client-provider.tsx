'use client';

import React, { useEffect, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { getFirebase } from './init';

export const FirebaseClientProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { app, auth, firestore } = useMemo(() => getFirebase(), []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (reg) => console.log('SW registered'),
        (err) => console.log('SW failed', err)
      );
    }
  }, []);

  if (!app || !auth || !firestore) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider firebaseApp={app} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
};
