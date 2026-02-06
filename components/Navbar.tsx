import React, { useState } from 'react';
import { Menu, X, Home, Calendar, LogIn, ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  isAuthenticated: boolean;
  onLoginClick: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  churchName: string;
  onChangeChurch: () => void;
  onSidebarToggle?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  isAuthenticated, 
  onLoginClick, 
  activeTab, 
  onLogout, 
  churchName, 
  onChangeChurch,
  onSidebarToggle
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (id: string) => {
    if (id === 'home') navigate('/');
    else if (id === 'events-public') navigate('/eventos');
    setIsOpen(false);
  };

  const navItems = [
    { id: 'home', label: 'Início', icon: <Home size={18} /> },
    { id: 'events-public', label: 'Eventos', icon: <Calendar size={18} /> },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button 
              onClick={onChangeChurch}
              className="mr-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Trocar Igreja"
            >
              <ArrowLeft size={20} />
            </button>

            <div 
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {churchName.charAt(0) || 'E'}
              </div>
              <span className="text-xl font-bold text-gray-800 hidden md:block">
                {churchName}
              </span>
              <span className="text-lg font-bold text-gray-800 md:hidden block truncate max-w-[150px]">
                {churchName}
              </span>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
                >
                  <LayoutDashboard size={18} className="mr-2" />
                  Painel
                </button>

                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center"
                >
                  <LogOut size={18} className="mr-2" />
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="ml-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center shadow-sm"
              >
                <LogIn size={18} className="mr-2" />
                Área Administrativa
              </button>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => {
                if (onSidebarToggle) {
                  onSidebarToggle();
                } else {
                  setIsOpen(!isOpen);
                }
              }}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen && !onSidebarToggle ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && !onSidebarToggle && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center w-full px-3 py-4 rounded-md text-base font-medium ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                        navigate('/admin/dashboard');
                        setIsOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-4 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <LayoutDashboard size={18} className="mr-3" />
                    Ir para o Painel
                  </button>

                  <button
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-4 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut size={18} className="mr-3" />
                    Sair
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onLoginClick();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-4 text-base font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                >
                  <LogIn size={18} className="mr-3" />
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