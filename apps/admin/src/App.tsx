import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { BannersPage } from '@/pages/BannersPage';
import { FlashSalesPage } from '@/pages/FlashSalesPage';
import { VouchersPage } from '@/pages/VouchersPage';
import { StoresPage } from '@/pages/StoresPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { ReviewsPage } from '@/pages/ReviewsPage';
import { UsersPage } from '@/pages/UsersPage';
import { SettingsPage } from '@/pages/SettingsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="banners" element={<BannersPage />} />
        <Route path="flash-sales" element={<FlashSalesPage />} />
        <Route path="vouchers" element={<VouchersPage />} />
        <Route path="stores" element={<StoresPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
