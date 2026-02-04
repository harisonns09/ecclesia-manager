import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Importante
import { LayoutDashboard, Users, Wallet, Calendar, LogOut, X, MapPin, Music, Home, HeartHandshake, ArrowLeft } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
  currentUser: { name: string; email: string; role: string } | null;
  onExitChurch: () => void;
  activeTab?: string; // Mantido para compatibilidade, mas usaremos location
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, setIsOpen, onLogout, currentUser, onExitChurch 
}) => {
  const navigate = useNavigate();
  const location = useLocation(); // Pega a URL atual

  const menuItems = [
    { id: '/admin/dashboard', label: 'Painel Geral', icon: <LayoutDashboard size={20} /> },
    { id: '/admin/members', label: 'Membros', icon: <Users size={20} /> },
    { id: '/admin/ministries', label: 'Ministérios', icon: <Music size={20} /> },
    { id: '/admin/small-groups', label: 'Células / Grupos', icon: <Home size={20} /> },
    { id: '/admin/events', label: 'Eventos', icon: <Calendar size={20} /> },
    { id: '/admin/financials', label: 'Financeiro', icon: <Wallet size={20} /> },
    { id: '/admin/prayer-wall', label: 'Mural de Oração', icon: <HeartHandshake size={20} /> },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsOpen(false)} />}
      
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* ... Header e User Info iguais ... */}
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.id); // Navegação Real
                setIsOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === item.id 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer com Navegação */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0 space-y-2">
          <button onClick={onExitChurch} className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="mr-3" /> Trocar Igreja
          </button>
          <button onClick={onLogout} className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
            <LogOut size={20} className="mr-3" /> Sair
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;