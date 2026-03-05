import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

interface ProtectedRouteProps {
  requiredPermission?: string; // Mudou de allowedRoles para requiredPermission
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermission }) => {
  const { isAuthenticated, currentChurch, hasPermission } = useApp();

  // 1. Se não estiver logado, manda para o Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Se não tiver igreja selecionada, volta para a tela inicial (seletor)
  if (!currentChurch) {
    return <Navigate to="/" replace />;
  }

  // 3. Se a rota exigir uma permissão específica e o utilizador não a tiver, bloqueia!
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.warn(`Acesso negado. Falta a permissão: ${requiredPermission}`);
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 4. Tudo certo! Renderiza a rota filha
  return <Outlet />;
};

export default ProtectedRoute;