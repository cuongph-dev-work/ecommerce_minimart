import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProductsPage } from '@/pages/ProductsPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { BannersPage } from '@/pages/BannersPage';
// Tạm thời comment do chưa implement
// import { FlashSalesPage } from '@/pages/FlashSalesPage';
// import { VouchersPage } from '@/pages/VouchersPage';
// import { ReviewsPage } from '@/pages/ReviewsPage';
import { StoresPage } from '@/pages/StoresPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { UsersPage } from '@/pages/UsersPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="banners" element={<BannersPage />} />
        {/* Tạm thời comment do chưa implement */}
        {/* <Route path="flash-sales" element={<FlashSalesPage />} /> */}
        {/* <Route path="vouchers" element={<VouchersPage />} /> */}
        <Route path="stores" element={<StoresPage />} />
        <Route path="orders" element={<OrdersPage />} />
        {/* Tạm thời comment do chưa implement */}
        {/* <Route path="reviews" element={<ReviewsPage />} /> */}
        <Route path="users" element={<UsersPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
