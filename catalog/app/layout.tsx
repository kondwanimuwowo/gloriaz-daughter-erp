import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Gloria's Daughter | Premium Fashion & Tailoring",
  description: "Bespoke fashion and premium tailoring, crafted to perfection for the modern individual.",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="min-h-screen flex flex-col font-sans antialiased" suppressHydrationWarning>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
