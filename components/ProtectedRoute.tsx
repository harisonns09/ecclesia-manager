import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, currentUser, currentChurch } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!currentChurch) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && currentUser) {
    if (!allowedRoles.includes(currentUser.role as UserRole)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;