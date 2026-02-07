import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wallet, Calendar, LogOut, X, Music, Home, HeartHandshake, ArrowLeft } from 'lucide-react';

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
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0f172a]/80 z-[60] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#1e3a8a] text-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col md:relative md:translate-x-0 md:z-0 md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        {/* Header do Usuário */}
        <div className="p-6 border-b border-[#3b82f6]/20 bg-[#172554]/50">
          <div className="flex justify-between items-center mb-6 md:hidden">
            <span className="font-bold text-white text-lg tracking-wide">Menu</span>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-lg border border-white/10 shadow-lg">
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-tight">{currentUser?.name}</p>
              <p className="text-xs text-blue-200 truncate mt-0.5">{currentUser?.email}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                {currentUser?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.id;
            return (
                <button
                key={item.id}
                onClick={() => {
                    navigate(item.id);
                    setIsOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                    ? 'bg-white text-[#1e3a8a] shadow-lg font-bold translate-x-1'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
                >
                <span className={`mr-3 transition-colors ${isActive ? 'text-[#1e3a8a]' : 'text-blue-300 group-hover:text-white'}`}>
                    {item.icon}
                </span>
                {item.label}
                </button>
            );
          })}
        </nav>

        {/* Footer com Ações */}
        <div className="p-4 border-t border-[#3b82f6]/20 bg-[#172554]/30 space-y-2">
          <button 
            onClick={onExitChurch} 
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-blue-200 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} className="mr-3" /> Trocar Igreja
          </button>
          <button 
            onClick={onLogout} 
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-300 rounded-xl hover:bg-red-500/10 hover:text-red-200 transition-colors"
          >
            <LogOut size={18} className="mr-3" /> Sair do Sistema
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;