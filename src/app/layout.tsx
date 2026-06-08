import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Metadata, Viewport } from 'next';
import { PersistentShell } from '@/components/PersistentShell';

export const metadata: Metadata = {
  title: 'SwingStats Pro | Elite Golf Analytics',
  description: 'Serious analytics for serious golfers. Track handicap, strokes gained, and performance insights.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SwingStats Pro',
  },
};

export const viewport: Viewport = {
  themeColor: '#040911',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <PersistentShell>
              {children}
            </PersistentShell>
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
