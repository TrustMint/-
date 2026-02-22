import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useStore } from './store';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Categories } from './pages/Categories';
import { Settings } from './pages/Settings';
import { Auth } from './pages/Auth';
import { Icon } from './components/ui/Icons';
import { ModalProvider } from './components/ModalProvider';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useStore();

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center text-primary bg-black">
            <div className="animate-spin text-[#0A84FF]"><Icon name="dollar" size={32} /></div>
        </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <Layout>{children}</Layout>;
};

function AppRoutes() {
  const { session } = useStore();

  return (
      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" replace />} />
        
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <ModalProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </ModalProvider>
    </AppProvider>
  );
}

export default App;
