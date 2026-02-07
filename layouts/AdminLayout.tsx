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

  // Proteção de Rota
  if (!currentChurch) return <Navigate to="/" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-[#0f172a] overflow-hidden">
      
      {/* Sidebar (Menu Lateral) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onLogout={onLogout} 
        currentUser={currentUser}
        onExitChurch={onExitChurch}
        activeTab={window.location.pathname}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          onLoginClick={() => {}} 
          activeTab={window.location.pathname}
          setActiveTab={() => {}}
          onLogout={onLogout}
          churchName={currentChurch.name}
          onChangeChurch={onExitChurch} 
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;