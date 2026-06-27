'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

/**
 * Initializes Firebase and Firestore with tactical persistence settings.
 * Uses Multi-Tab persistence to prevent internal assertion failures in WatchChangeAggregator
 * when the application is open in multiple browser sectors.
 */
export function getFirebase() {
  if (typeof window === 'undefined') return { app: null, auth: null, firestore: null };

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  firestore = getFirestore(app);

  // Initialize persistence layer to resolve internal synchronization conflicts
  if (typeof window !== 'undefined') {
    enableMultiTabIndexedDbPersistence(firestore).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Synchronization failure: Multiple tabs are competing for persistence.
        // The SDK will fallback to memory-only mode for this specific instance.
        console.warn('Vigilance Hub: Persistence restricted to single tab protocol.');
      } else if (err.code === 'unimplemented') {
        // Environment failure: Browser does not support IndexedDB protocols.
        console.warn('Vigilance Hub: Offline telemetry is not supported in this environment.');
      }
    });
  }

  return { app, auth, firestore };
}
