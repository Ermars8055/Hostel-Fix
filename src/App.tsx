import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

// Public Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Protected Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTickets from './pages/admin/Tickets';
import AdminSettings from './pages/admin/Settings';
import AdminStats from './pages/admin/Stats';

import BoysDashboard from './pages/boys/Dashboard';
import BoysNewTicket from './pages/boys/NewTicket';
import BoysTickets from './pages/boys/Tickets';
import BoysProfile from './pages/boys/Profile';

import GirlsDashboard from './pages/girls/Dashboard';
import GirlsNewTicket from './pages/girls/NewTicket';
import GirlsTickets from './pages/girls/Tickets';
import GirlsProfile from './pages/girls/Profile';

// Route Protection Components
import ProtectedRoute from './components/common/ProtectedRoute';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #e2e8f0',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
            success: {
              icon: '✅',
              style: {
                border: '1px solid #d1fae5',
              },
            },
            error: {
              icon: '❌',
              style: {
                border: '1px solid #fee2e2',
              },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tickets"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stats"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminStats />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Boys Routes */}
          <Route
            path="/boys/dashboard"
            element={
              <ProtectedRoute allowedRoles={['boys']}>
                <BoysDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boys/new-ticket"
            element={
              <ProtectedRoute allowedRoles={['boys']}>
                <BoysNewTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boys/tickets"
            element={
              <ProtectedRoute allowedRoles={['boys']}>
                <BoysTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boys/profile"
            element={
              <ProtectedRoute allowedRoles={['boys']}>
                <BoysProfile />
              </ProtectedRoute>
            }
          />

          {/* Girls Routes */}
          <Route
            path="/girls/dashboard"
            element={
              <ProtectedRoute allowedRoles={['girls']}>
                <GirlsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/girls/new-ticket"
            element={
              <ProtectedRoute allowedRoles={['girls']}>
                <GirlsNewTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/girls/tickets"
            element={
              <ProtectedRoute allowedRoles={['girls']}>
                <GirlsTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/girls/profile"
            element={
              <ProtectedRoute allowedRoles={['girls']}>
                <GirlsProfile />
              </ProtectedRoute>
            }
          />

          {/* Redirect Root */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;