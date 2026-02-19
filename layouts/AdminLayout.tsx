import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom'; // Adicionado useLocation
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useApp } from '../contexts/AppContext'; // Importe o Contexto

// Nenhuma prop é necessária agora, o Layout é autossuficiente
const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation(); // Hook correto para pegar a rota atual
  
  // Consumindo do Contexto Global
  const { 
    isAuthenticated, 
    currentChurch, 
    logout, 
    exitChurch,
    currentUser 
  } = useApp();

  // Proteção de Rota (Embora o App.tsx já faça, é bom manter como dupla segurança ou remover se redundante)
  if (!currentChurch) return <Navigate to="/" replace />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-[#0f172a] overflow-hidden">
      
      {/* Sidebar (Menu Lateral) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        // Não precisa passar props de user/logout, a Sidebar já usa o contexto internamente
        // Mas se sua Sidebar AINDA espera props (versão antiga), você teria que passar aqui.
        // Assumindo que você usou a Sidebar corrigida que enviei anteriormente:
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        <Navbar 
          // Navbar também já consome contexto, só passamos props de controle de UI
          activeTab={location.pathname} // Usando location.pathname do hook
          setActiveTab={() => {}}
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