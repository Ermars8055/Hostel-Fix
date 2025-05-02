import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NotFound: React.FC = () => {
  const { user } = useAuth();
  
  const getDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'boys':
        return '/boys/dashboard';
      case 'girls':
        return '/girls/dashboard';
      default:
        return '/login';
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-error-100 text-error-600 rounded-full flex items-center justify-center">
            <AlertTriangle size={48} />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Page Not Found</h2>
        
        <p className="text-neutral-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Link
          to={getDashboardLink()}
          className="btn-primary inline-flex items-center"
        >
          <Home size={18} className="mr-2" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;