import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/components/Layout/MainLayout';
import { authService } from '@/services/authService';

// Placeholder components for new pages
const TransactionsPage = () => (
  <MainLayout>
    <div className="p-8">
      <h1 className="text-2xl font-bold">Transactions Page - Coming Soon</h1>
    </div>
  </MainLayout>
);

const ProductsPage = () => (
  <MainLayout>
    <div className="p-8">
      <h1 className="text-2xl font-bold">Products Page - Coming Soon</h1>
    </div>
  </MainLayout>
);

const CategoriesPage = () => (
  <MainLayout>
    <div className="p-8">
      <h1 className="text-2xl font-bold">Categories Page - Coming Soon</h1>
    </div>
  </MainLayout>
);

function App() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/dashboard" replace /> : 
              <Login />
          } 
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <TransactionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;