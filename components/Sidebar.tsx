import React from 'react';
import { LayoutDashboard, Users, Wallet, Calendar, LogOut, X, Sparkles, MapPin, Music, Home, HeartHandshake } from 'lucide-react';
import { Church } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: () => void;
  currentChurch: Church | null;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isMobileOpen, 
  setIsMobileOpen,
  onLogout,
  currentChurch
}) => {
  
  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: <LayoutDashboard size={20} /> },
    { id: 'members', label: 'Membros', icon: <Users size={20} /> },
    { id: 'ministries', label: 'Ministérios', icon: <Music size={20} /> },
    { id: 'small-groups', label: 'Células / Grupos', icon: <Home size={20} /> }, // New
    { id: 'prayer-wall', label: 'Mural de Oração', icon: <HeartHandshake size={20} /> }, // New
    { id: 'financial', label: 'Financeiro', icon: <Wallet size={20} /> },
    { id: 'events', label: 'Eventos', icon: <Calendar size={20} /> },
    { id: 'ai-assistant', label: 'Assistente Pastoral', icon: <Sparkles size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:translate-x-0
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: currentChurch?.themeColor || '#2563eb' }}
            >
              {currentChurch?.name.charAt(0) || 'E'}
            </div>
            <span className="text-sm font-bold text-gray-800 leading-tight">
              {currentChurch?.name || 'Sistema'}
            </span>
          </div>
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-gray-50">
           <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
             <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">
               A
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-bold text-gray-800 truncate">Administrador</p>
               <div className="flex items-center text-xs text-gray-500">
                 <MapPin size={10} className="mr-1" />
                 <span className="truncate">{currentChurch?.city}</span>
               </div>
             </div>
           </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false);
              }}
              className={`
                flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Sair da Gestão
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;