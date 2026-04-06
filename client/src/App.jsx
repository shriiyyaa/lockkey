import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateLock from './pages/CreateLock';
import UnlockFlow from './pages/UnlockFlow';

import { useState } from 'react';
import { motion } from 'framer-motion';

function AuthRedirect({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-mono-950 flex flex-col items-center justify-center space-y-6">
        <div className="text-ivory font-black text-[10px] tracking-[0.3em] uppercase animate-pulse">
          AUTHENTICATING_CRYPTO_PROTOCOL...
        </div>
        <div className="w-48 h-1 bg-mono-900 border border-mono-800 overflow-hidden relative">
          <motion.div 
            className="h-full bg-ivory"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }
  
  if (user) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={
            <AuthRedirect><Login /></AuthRedirect>
          } />
          <Route path="/signup" element={
            <AuthRedirect><Signup /></AuthRedirect>
          } />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateLock />} />
            <Route path="/unlock/:id" element={<UnlockFlow />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
