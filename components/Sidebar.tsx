import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, Calendar, LogOut, X, MapPin, Music, Home, HeartHandshake, ArrowLeft } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onLogout: () => void;
  currentUser: { name: string; email: string; role: string } | null;
  onExitChurch: () => void;
  activeTab?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen, setIsOpen, onLogout, currentUser, onExitChurch
}) => {
  const navigate = useNavigate();
  const location = useLocation();

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

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}


      <div className={`fixed inset-y-0 left-0 z-[70] w-64 bg-white border-r border-gray-200 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col md:relative md:translate-x-0 md:z-0 md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="p-4 border-b border-gray-200 flex flex-col bg-gray-50">
          <div className="flex justify-between items-center mb-4 md:hidden">
            <span className="font-bold text-gray-700">Menu</span>
            <button onClick={() => setIsOpen(false)} className="text-gray-500">
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.id);
                setIsOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${location.pathname === item.id
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