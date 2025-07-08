import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import { Sprout } from 'lucide-react';

export const metadata: Metadata = {
  title: 'CropWise Nutrition',
  description: 'Intelligent crop recommendations for a healthier harvest.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex flex-col min-h-screen">
          <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-background sticky top-0 z-50">
            <Link href="/" className="flex items-center justify-center">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="ml-3 text-2xl font-headline font-bold text-primary">
                CropWise Nutrition
              </span>
            </Link>
          </header>
          <main className="flex-grow">{children}</main>
          <footer className="flex items-center justify-center py-6 border-t bg-background">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CropWise Nutrition</p>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
