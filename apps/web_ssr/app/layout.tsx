import type { Metadata } from 'next';
import { SettingsProvider } from '../context/SettingsContext';
import { CartProvider } from '../context/CartContext';
import { RecentlyViewedProvider } from '../context/RecentlyViewedContext';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Toaster } from '../components/ui/sonner';
import '../index.css';
import '../i18n/config';

export const metadata: Metadata = {
  title: 'Minimart',
  description: 'Your trusted minimart for quality products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>
          <CartProvider>
            <RecentlyViewedProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster position="top-right" />
              </div>
            </RecentlyViewedProvider>
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
