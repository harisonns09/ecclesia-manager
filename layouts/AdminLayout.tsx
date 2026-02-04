import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Church } from '../types';

interface AdminLayoutProps {
  isAuthenticated: boolean;
  currentChurch: Church | null;
  onLogout: () => void;
  onExitChurch: () => void;
  currentUser: any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  isAuthenticated, 
  currentChurch, 
  onLogout, 
  onExitChurch,
  currentUser
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  // Proteção de Rota: Se não tiver igreja ou não estiver logado, joga para fora
  if (!currentChurch) return <Navigate to="/" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onLogout={onLogout}
        currentUser={currentUser}
        onExitChurch={onExitChurch}
        activeTab={window.location.pathname} // Highlight baseado na URL
      />

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          onLoginClick={() => {}} 
          activeTab={window.location.pathname}
          setActiveTab={() => {}}
          onLogout={onLogout}
          churchName={currentChurch.name}
          onChangeChurch={onExitChurch} 
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* O Outlet é onde as "páginas" filhas serão renderizadas */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;