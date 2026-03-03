import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Activity, Shield, Users, Wallet, Calendar, LogOut, X, Music, Home, HeartHandshake, ArrowLeft, Baby, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  roles?: UserRole[];
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser, logout, exitChurch } = useApp();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const menuItems: MenuItem[] = useMemo(() => [
    {
      id: 'dashboard',
      label: 'Painel Geral',
      icon: <LayoutDashboard size={20} />,
      path: '/admin/dashboard'
    },
    {
      id: 'people',
      label: 'Pessoas',
      icon: <Users size={20} />,
      children: [
        { id: 'members', label: 'Membros', icon: <Users size={18} />, path: '/admin/members' },
        { id: 'visitors', label: 'Visitantes', icon: <HeartHandshake size={18} />, path: '/admin/visitors' },
      ]
    },
    {
      id: 'groups',
      label: 'Grupos & Eventos',
      icon: <Calendar size={20} />,
      children: [
        { id: 'ministries', label: 'Ministérios', icon: <Music size={18} />, path: '/admin/ministries' },
        { id: 'small-groups', label: 'Células / Grupos', icon: <Home size={18} />, path: '/admin/small-groups' },
        { id: 'events', label: 'Eventos', icon: <Calendar size={18} />, path: '/admin/events' },
      ]
    },
    {
      id: 'financial',
      label: 'Financeiro',
      icon: <Wallet size={20} />,
      path: '/admin/financials',
      roles: ['ADMIN', 'TESOUREIRO'] as UserRole[]
    },
    {
      id: 'kids',
      label: 'Kids',
      icon: <Baby size={20} />,
      roles: ['ADMIN', 'KIDS'] as UserRole[],
      children: [
        { id: 'kids-checkin', label: 'Check-in', icon: <Baby size={18} />, path: '/admin/kids/checkin' },
        { id: 'kids-dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/admin/kids/dashboard' },
      ]
    },
    {
      id: 'system',
      label: 'Administração',
      icon: <Settings size={20} />,
      roles: ['ADMIN'] as UserRole[],
      children: [
        { id: 'users', label: 'Usuários', icon: <Shield size={18} />, path: '/admin/users' },
        { id: 'audit', label: 'Auditoria', icon: <Activity size={18} />, path: '/admin/audit-log' },
      ]
    }
  ], []);

  const filterItems = (items: MenuItem[]): MenuItem[] => {
    if (!currentUser) return [];
    
    return items.reduce((acc: MenuItem[], item) => {
      if (item.roles && !item.roles.includes(currentUser.role as UserRole)) {
        return acc;
      }

      if (item.children) {
        const filteredChildren = filterItems(item.children);
        if (filteredChildren.length > 0) {
          acc.push({ ...item, children: filteredChildren });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, []);
  };

  const visibleMenuItems = useMemo(() => {
    return filterItems(menuItems);
  }, [menuItems, currentUser]);

  useEffect(() => {
    const activeParent = visibleMenuItems.find(item => 
      item.children?.some(child => child.path === location.pathname)
    );
    if (activeParent) {
      setExpandedMenus(prev => {
        if (!prev.includes(activeParent.id)) return [...prev, activeParent.id];
        return prev;
      });
    }
  }, [location.pathname, visibleMenuItems]);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
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

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {visibleMenuItems.map((item) => {
            const isActive = item.path === location.pathname;
            const isParentActive = item.children?.some(child => child.path === location.pathname);
            const isOpenMenu = expandedMenus.includes(item.id);

            if (item.children) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group justify-between ${
                      isParentActive ? 'text-white bg-white/10' : 'text-blue-100 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className={`mr-3 transition-colors ${isParentActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </div>
                    {isOpenMenu ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                  
                  {isOpenMenu && (
                    <div className="pl-4 space-y-1 animate-in slide-in-from-top-1 duration-200">
                      {item.children.map(child => {
                         const isChildActive = location.pathname === child.path;
                         return (
                           <button
                             key={child.id}
                             onClick={() => {
                               navigate(child.path!);
                               setIsOpen(false);
                             }}
                             className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                               isChildActive 
                                 ? 'bg-white text-[#1e3a8a] shadow-sm font-bold' 
                                 : 'text-blue-200 hover:bg-white/5 hover:text-white'
                             }`}
                           >
                             <span className="mr-3 opacity-70">{child.icon}</span>
                             {child.label}
                           </button>
                         );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path!);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
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