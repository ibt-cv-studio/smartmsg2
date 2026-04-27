import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Compose from './pages/Compose';
import Messages from './pages/Messages';
import EditMessage from './pages/EditMessage';
import Logs from './pages/Logs';
import Contacts from './pages/Contacts';
import WhatsApp from './pages/WhatsApp';
import './index.css';

function PrivateLayout({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"     element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register"  element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/"          element={<PrivateLayout><Dashboard /></PrivateLayout>} />
          <Route path="/compose"   element={<PrivateLayout><Compose /></PrivateLayout>} />
          <Route path="/contacts"  element={<PrivateLayout><Contacts /></PrivateLayout>} />
          <Route path="/messages"  element={<PrivateLayout><Messages /></PrivateLayout>} />
          <Route path="/edit/:id"  element={<PrivateLayout><EditMessage /></PrivateLayout>} />
          <Route path="/logs"      element={<PrivateLayout><Logs /></PrivateLayout>} />
          <Route path="/whatsapp"  element={<PrivateLayout><WhatsApp /></PrivateLayout>} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
