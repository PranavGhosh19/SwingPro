'use client';

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { 
  initializeFirestore, 
  getFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  type Firestore 
} from 'firebase/firestore';
import { firebaseConfig } from './config';

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

/**
 * Initializes Firebase and Firestore with tactical persistence settings.
 * Uses the modern persistentLocalCache API with persistentMultipleTabManager
 * to prevent internal assertion failures in WatchChangeAggregator when the
 * application is open in multiple browser sectors.
 */
export function getFirebase() {
  if (typeof window === 'undefined') return { app: null, auth: null, firestore: null };

  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    // Initialize Firestore with modern persistence configuration
    firestore = initializeFirestore(app, {
      cache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
  } else {
    app = getApps()[0];
    try {
      firestore = getFirestore(app);
    } catch (e) {
      // In case of race conditions during initialization, fall back to default getter
      firestore = getFirestore(app);
    }
  }

  auth = getAuth(app);

  return { app, auth, firestore };
}
