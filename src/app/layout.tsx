
"use client"

import { useEffect } from 'react';
import './globals.css';
import { FirebaseClientProvider, initializeFirebase } from '@/firebase';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { firebaseApp, firestore, auth } = initializeFirebase();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered: ', registration);
          },
          (registrationError) => {
            console.log('SW registration failed: ', registrationError);
          }
        );
      });
    }
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <title>SwingStats Pro | Elite Golf Analytics</title>
        <meta name="description" content="Serious analytics for serious golfers. Track handicap, strokes gained, and performance insights." />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='48' fill='white' stroke='%23e2e8f0' stroke-width='2'/><circle cx='30' cy='30' r='4' fill='%23cbd5e1'/><circle cx='50' cy='25' r='4' fill='%23cbd5e1'/><circle cx='70' cy='30' r='4' fill='%23cbd5e1'/><circle cx='25' cy='50' r='4' fill='%23cbd5e1'/><circle cx='50' cy='50' r='4' fill='%23cbd5e1'/><circle cx='75' cy='50' r='4' fill='%23cbd5e1'/><circle cx='30' cy='70' r='4' fill='%23cbd5e1'/><circle cx='50' cy='75' r='4' fill='%23cbd5e1'/><circle cx='70' cy='70' r='4' fill='%23cbd5e1'/></svg>" />
        <meta name="theme-color" content="#171F1C" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SwingStats Pro" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-white">
        <FirebaseClientProvider firebaseApp={firebaseApp} firestore={firestore} auth={auth}>
          {children}
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
