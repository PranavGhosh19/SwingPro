'use client';

import React from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { FirebaseProvider } from './provider';

export const FirebaseClientProvider: React.FC<{
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  children: React.ReactNode;
}> = ({ firebaseApp, auth, firestore, children }) => {
  return (
    <FirebaseProvider firebaseApp={firebaseApp} auth={auth} firestore={firestore}>
      {children}
    </FirebaseProvider>
  );
};
