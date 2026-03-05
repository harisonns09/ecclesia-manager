import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Activity, Shield, Users, Wallet, Calendar, 
  LogOut, X, Music, Home, HeartHandshake, ArrowLeft, Baby, 
  ChevronDown, ChevronRight, Settings, UsersRound
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

type MenuItem = {
  id: string;
  label: string;
  icon: JSX.Element;
  requiredPermission?: string;
  subItems?: MenuItem[];
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout, exitChurch, hasPermission } = useApp();

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const menuItems: MenuItem[] = useMemo(() => [
    { 
      id: '/admin/dashboard', 
      label: 'Painel Geral', 
      icon: <LayoutDashboard size={20} /> 
    },
    {
      id: 'pessoas',
      label: 'Pessoas',
      icon: <UsersRound size={20} />,
      subItems: [
        { 
          id: '/admin/members', 
          label: 'Membros', 
          icon: <Users size={18} />,
          requiredPermission: 'GERENCIAR_MEMBROS'
        },
        { id: '/admin/visitors', 
          label: 'Visitantes', 
          icon: <HeartHandshake size={18} />,
          requiredPermission: 'GERENCIAR_VISITANTES'},
      ]
    },
    {
      id: 'gestao',
      label: 'Organização',
      icon: <Home size={20} />,
      subItems: [
        { id: '/admin/ministries', label: 'Ministérios', icon: <Music size={18} />, requiredPermission: 'GERENCIAR_MINISTERIOS' },
        { id: '/admin/small-groups', label: 'Células / Grupos', icon: <Home size={18} />, requiredPermission: 'GERENCIAR_GRUPOS' },
        { id: '/admin/events', label: 'Eventos', icon: <Calendar size={18} />, requiredPermission: 'GERENCIAR_EVENTOS' },
      ]
    },
    {
      id: 'kids',
      label: 'Ministério Infantil',
      icon: <Baby size={20} />,
      requiredPermission: 'ACESSAR_KIDS',
      subItems: [
        { id: '/admin/kids/dashboard', label: 'Painel Kids', icon: <LayoutDashboard size={18} />, requiredPermission: 'GERENCIAR_KIDS' },
        { id: '/admin/kids/checkin', label: 'Check-in Kids', icon: <Baby size={18} />, requiredPermission: 'GERENCIAR_KIDS' },
      ]
    },
    {
      id: 'admin',
      label: 'Administrativo',
      icon: <Settings size={20} />,
      subItems: [
        { id: '/admin/financials', label: 'Financeiro', icon: <Wallet size={18} />, requiredPermission: 'VER_FINANCEIRO' },
        { id: '/admin/users', label: 'Usuários & Acessos', icon: <Shield size={18} />, requiredPermission: 'GERENCIAR_ACESSOS' },
        { id: '/admin/audit-log', label: 'Log de Auditoria', icon: <Activity size={18} />, requiredPermission: 'VER_AUDITORIA' },
      ]
    }
  ], []);

  const visibleMenuItems = useMemo(() => {
    if (!currentUser) return [];

    return menuItems.map(item => {
      if (item.requiredPermission && !hasPermission(item.requiredPermission)) return null;

      if (item.subItems) {
        const filteredSubs = item.subItems.filter(sub => 
          !sub.requiredPermission || hasPermission(sub.requiredPermission)
        );
        
        if (filteredSubs.length === 0) return null;
        
        return { ...item, subItems: filteredSubs };
      }

      return item;
    }).filter(Boolean) as MenuItem[];
  }, [menuItems, currentUser, hasPermission]);

  useEffect(() => {
    const currentGroup = visibleMenuItems.find(item => 
      item.subItems?.some(sub => location.pathname === sub.id)
    );

    if (currentGroup) {
      setExpandedGroups(prev => ({ ...prev, [currentGroup.id]: true }));
    }
  }, [location.pathname, visibleMenuItems]);

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#0f172a]/80 z-[60] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[#1e3a8a] text-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col md:relative md:translate-x-0 md:z-0 md:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="p-6 border-b border-[#3b82f6]/20 bg-[#172554]/50">
          <div className="flex justify-between items-center mb-6 md:hidden">
            <span className="font-bold text-white text-lg tracking-wide">Menu</span>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white font-bold text-lg border border-white/10 shadow-lg">
              {currentUser?.user?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate leading-tight">{currentUser?.user}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">
                {currentUser?.perfil || 'Usuário'}
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {visibleMenuItems.map((item) => {
            const isGroup = !!item.subItems;
            const isExpanded = expandedGroups[item.id];
            
            const isActive = !isGroup && location.pathname === item.id;
            
            const isGroupActive = isGroup && item.subItems?.some(sub => location.pathname === sub.id);

            return (
              <div key={item.id} className="flex flex-col">
                <button
                  onClick={() => {
                    if (isGroup) {
                      toggleGroup(item.id);
                    } else {
                      navigate(item.id);
                      setIsOpen(false);
                    }
                  }}
                  className={`flex items-center justify-between w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-white text-[#1e3a8a] shadow-lg font-bold translate-x-1' 
                      : isGroupActive
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`mr-3 transition-colors ${isActive ? 'text-[#1e3a8a]' : 'text-blue-300 group-hover:text-white'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  
                  {isGroup && (
                    <span className="text-blue-300 group-hover:text-white transition-transform duration-200">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </span>
                  )}
                </button>

                {isGroup && isExpanded && (
                  <div className="mt-1 ml-4 pl-4 border-l border-[#3b82f6]/30 space-y-1 animate-in slide-in-from-top-2 duration-200">
                    {item.subItems!.map((sub) => {
                      const isSubActive = location.pathname === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            navigate(sub.id);
                            setIsOpen(false);
                          }}
                          className={`flex items-center w-full px-3 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                            isSubActive
                              ? 'bg-blue-500/20 text-white font-bold border border-blue-400/30'
                              : 'text-blue-200 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className={`mr-2 ${isSubActive ? 'text-white' : 'text-blue-400'}`}>
                            {sub.icon}
                          </span>
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#3b82f6]/20 bg-[#172554]/30 space-y-2">
          <button
            onClick={exitChurch}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-blue-200 rounded-xl hover:bg-white/5 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} className="mr-3" /> Trocar Igreja
          </button>
          <button
            onClick={logout}
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