import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import './App.css';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Users from './pages/Users';
import { SnackbarProvider } from './context/SnackbarContext';
import { AnimatePresence } from 'framer-motion';
import { SidebarProvider } from './context/SidebarContext';
import PageTransition from './components/PageTransition';

function DashboardRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="productos" element={
          <PageTransition>
            <Products />
          </PageTransition>
        } />
        <Route path="users" element={
          <PageTransition>
            <AdminRoute>
              <Users />
            </AdminRoute>
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route path="/*" element={<DashboardRoutes />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <SnackbarProvider>
      <AuthProvider>
        <SidebarProvider>
          <Router>
            <AppRoutes />
          </Router>
        </SidebarProvider>
      </AuthProvider>
    </SnackbarProvider>
  );
}

export default App;
