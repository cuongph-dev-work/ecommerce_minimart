import { RouteObject } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import ContactPage from '../pages/ContactPage';
import StoresPage from '../pages/StoresPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import NotFoundPage from '../pages/NotFoundPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/products',
    element: <ProductsPage />,
  },
  {
    path: '/products/:id',
    element: <ProductDetailPage />,
  },
  {
    path: '/cart',
    element: <CartPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/stores',
    element: <StoresPage />,
  },
  {
    path: '/order-tracking',
    element: <OrderTrackingPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
