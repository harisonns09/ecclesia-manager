import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Church } from '../types';
import { churchApi } from '../services/api';

// Tipagem do Usuário (baseada no seu App.tsx)
interface User {
  name: string;
  email: string;
  role: string;
}

// O que nosso Contexto vai expor para o resto do app
interface AppContextData {
  // Estados
  isAuthenticated: boolean;
  currentUser: User | null;
  currentChurch: Church | null;
  churches: Church[];
  isLoadingChurches: boolean;

  // Ações
  login: (user: User) => void;
  logout: () => void;
  selectChurch: (church: Church) => void;
  exitChurch: () => void;
  
  // Gestão de Igrejas (CRUD local)
  addChurchList: (church: Church) => void;
  updateChurchList: (church: Church) => void;
  removeChurchList: (id: string) => void;
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- ESTADOS GLOBAIS ---
  const [currentChurch, setCurrentChurch] = useState<Church | null>(() => {
    const saved = localStorage.getItem('selectedChurch');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('church_token');
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoadingChurches, setIsLoadingChurches] = useState(true);

  // --- EFEITOS ---
  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      setIsLoadingChurches(true);
      const data = await churchApi.getAll();
      setChurches(data);
    } catch (error) {
      console.error("Erro ao carregar igrejas:", error);
    } finally {
        setIsLoadingChurches(false);
    }
  };

  // --- AÇÕES ---

  const login = (user: User) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    
    // Redirecionamento Inteligente (Deep Linking)
    const state = location.state as { from?: Location };
    if (state?.from?.pathname) {
        navigate(state.from.pathname + state.from.search);
    } else {
        navigate('/admin/dashboard');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('church_token');
    navigate('/login');
  };

  const selectChurch = (church: Church) => {
    setCurrentChurch(church);
    localStorage.setItem('selectedChurch', JSON.stringify(church));

    // Redirecionamento Inteligente
    const state = location.state as { from?: Location };
    if (state?.from?.pathname) {
        navigate(state.from.pathname + state.from.search);
    }
  };

  const exitChurch = () => {
    setCurrentChurch(null);
    localStorage.removeItem('selectedChurch');
    navigate('/');
  };

  // Helpers para atualizar a lista de igrejas sem refetch
  const addChurchList = (church: Church) => setChurches([...churches, church]);
  const updateChurchList = (church: Church) => setChurches(churches.map(c => c.id === church.id ? church : c));
  const removeChurchList = (id: string) => setChurches(churches.filter(c => c.id !== id));

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      currentUser,
      currentChurch,
      churches,
      isLoadingChurches,
      login,
      logout,
      selectChurch,
      exitChurch,
      addChurchList,
      updateChurchList,
      removeChurchList
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para facilitar o uso
export const useApp = () => useContext(AppContext);