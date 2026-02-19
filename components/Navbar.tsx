import React, { useState } from 'react';
import { Menu, X, Home, Calendar, LogIn, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext'; // Importe o Hook

// Interface de props agora é opcional ou vazia, pois tudo vem do contexto
// Mantive onSidebarToggle pois é uma ação de UI local entre Navbar e Layout
interface NavbarProps {
  onSidebarToggle?: () => void;
  activeTab: string; // Mantido pois é controle de UI da página atual
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSidebarToggle,
  activeTab,
  setActiveTab
}) => {
  // Consumindo do Contexto Global
  const { 
    isAuthenticated, 
    currentChurch, 
    logout, 
    exitChurch 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (id: string) => {
    if (id === 'home') navigate('/');
    else if (id === 'events-public') navigate('/eventos');
    setActiveTab(id);
    setIsOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Início', icon: <Home size={18} /> },
    { id: 'events-public', label: 'Eventos', icon: <Calendar size={18} /> },
  ];

  const churchName = currentChurch?.name || 'Ecclesia Manager';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20"> 
          
          {/* LADO ESQUERDO */}
          <div className="flex items-center">
            {currentChurch && (
                <button 
                onClick={exitChurch} // Usa a função do contexto
                className="mr-4 p-2 rounded-full text-gray-400 hover:text-primary-900 hover:bg-primary-50 transition-all duration-200 group"
                title="Trocar Igreja"
                >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                </button>
            )}

            <div 
              className="flex-shrink-0 flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              <div className="w-10 h-10 rounded-xl bg-primary-900 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:bg-primary-800 transition-colors">
                {churchName.charAt(0)}
              </div>
              
              <div className="flex flex-col justify-center">
                <span className="text-lg font-bold text-gray-900 leading-none group-hover:text-primary-900 transition-colors hidden md:block">
                  {churchName}
                </span>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider hidden md:block">
                  Portal de Membros
                </span>
                <span className="text-lg font-bold text-gray-900 md:hidden block truncate max-w-[150px]">
                  {churchName}
                </span>
              </div>
            </div>
          </div>

          {/* CENTRO/DIREITA */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-primary-50 text-primary-900 shadow-sm ring-1 ring-primary-100' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`mr-2 ${activeTab === item.id ? 'text-primary-700' : 'text-gray-400'}`}>
                    {item.icon}
                </span>
                {item.label}
              </button>
            ))}

            <div className="h-6 w-px bg-gray-200 mx-4"></div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-5 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-bold hover:bg-primary-800 transition-all shadow-md hover:shadow-lg flex items-center"
                >
                  <LayoutDashboard size={18} className="mr-2" />
                  Painel
                </button>

                <button
                  onClick={logout} // Usa logout do contexto
                  className="px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors flex items-center"
                  title="Sair do sistema"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2.5 rounded-lg bg-primary-900 text-white text-sm font-bold hover:bg-primary-800 transition-all shadow-md hover:shadow-lg flex items-center hover:-translate-y-0.5"
              >
                <LogIn size={18} className="mr-2" />
                Área Administrativa
              </button>
            )}
          </div>

          {/* MENU MOBILE TOGGLE */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => {
                if (onSidebarToggle) {
                  onSidebarToggle();
                } else {
                  setIsOpen(!isOpen);
                }
              }}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-primary-900 hover:bg-primary-50 focus:outline-none transition-colors"
            >
              {isOpen && !onSidebarToggle ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE EXPANDIDO */}
      {isOpen && !onSidebarToggle && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="px-4 pt-3 pb-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center w-full px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary-50 text-primary-900 border border-primary-100'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={`mr-3 ${activeTab === item.id ? 'text-primary-700' : 'text-gray-400'}`}>
                    {item.icon}
                </span>
                {item.label}
              </button>
            ))}
            
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                        navigate('/admin/dashboard');
                        setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-3.5 text-base font-bold text-white bg-primary-900 hover:bg-primary-800 rounded-xl shadow-md"
                  >
                    <LayoutDashboard size={20} className="mr-2" />
                    Ir para o Painel
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-3.5 text-base font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-100"
                  >
                    <LogOut size={20} className="mr-2" />
                    Sair da Conta
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center px-4 py-3.5 text-base font-bold text-white bg-primary-900 hover:bg-primary-800 rounded-xl shadow-md"
                >
                  <LogIn size={20} className="mr-2" />
                  Área Administrativa
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;