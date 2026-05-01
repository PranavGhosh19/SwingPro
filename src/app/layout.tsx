import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SwingStats Pro | Elite Golf Analytics',
  description: 'Serious analytics for serious golfers. Track handicap, strokes gained, and performance insights.',
  manifest: '/manifest.json',
  themeColor: '#171F1C',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SwingStats Pro',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className="font-body antialiased selection:bg-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}