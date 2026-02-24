import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, currentUser, currentChurch } = useApp();

  // 1. Se não tá logado, manda pro login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se não tem igreja selecionada, manda pra seleção
  if (!currentChurch) {
    return <Navigate to="/" replace />;
  }

  // 3. Se a rota exige papéis específicos e o usuário não tem, manda pro dashboard
  if (allowedRoles && currentUser) {
    if (!allowedRoles.includes(currentUser.role as UserRole)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Se passou por todas as barreiras, renderiza a página filha
  return <Outlet />;
};

export default ProtectedRoute;