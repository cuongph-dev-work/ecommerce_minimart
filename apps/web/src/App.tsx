import { useRoutes } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
// import { Chatbot } from './components/Chatbot';
import { CartProvider } from './context/CartContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { Toaster } from './components/ui/sonner';
import { routes } from './routes';

export default function App() {
  const element = useRoutes(routes);

  return (
    <CartProvider>
      <RecentlyViewedProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{element}</main>
          <Footer />
          {/* <Chatbot /> */}
          <Toaster position="top-right" />
        </div>
      </RecentlyViewedProvider>
    </CartProvider>
  );
}