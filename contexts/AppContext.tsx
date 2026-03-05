import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Church, User } from '../types'; // <-- Agora importamos o User do types.ts
import { churchApi, authApi, api } from '../services/api';

// Interface para mapear o que vem de dentro do Token JWT do Quarkus
interface DecodedToken {
  sub: string; // E-mail
  id: string;  // O ID do usuário
  nome: string;
  groups: string[]; // <-- Trocamos 'role' por 'groups' (onde vêm os perfis e permissões)
  exp: number;
}

interface AppContextData {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentChurch: Church | null;
  churches: Church[];
  isLoadingChurches: boolean;

  login: (email: string, pass: string) => Promise<void>; 
  logout: () => void;
  selectChurch: (church: Church) => void;
  exitChurch: () => void;
  
  addChurchList: (church: Church) => void;
  updateChurchList: (church: Church) => void;
  removeChurchList: (id: string) => void;

  // 🔥 Nova função mágica para verificar permissões
  hasPermission: (permission: string) => boolean; 
}

const AppContext = createContext<AppContextData>({} as AppContextData);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [currentChurch, setCurrentChurch] = useState<Church | null>(() => {
    const saved = localStorage.getItem('selectedChurch');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  const [churches, setChurches] = useState<Church[]>([]);
  const [isLoadingChurches, setIsLoadingChurches] = useState(true);

  // --- NOVA FUNÇÃO DE PERMISSÕES ---
  const hasPermission = (permission: string) => {
    if (!currentUser) return false;

    if (currentUser.perfil === 'ADMIN') return true;

    return currentUser.permissions.includes(permission);
  };

  // Função auxiliar para processar o token (evita repetição de código no login e no init)
  const processToken = (token: string) => {
    const decoded = jwtDecode<DecodedToken>(token);
    
    // No Quarkus, enviamos o Perfil e as Permissões no array 'groups'.
    // Geralmente o Perfil é o primeiro item ou segue um padrão.
    // Se o seu backend envia o perfil no início, fazemos assim:
    const allGroups = decoded.groups || [];
    const perfilBase = allGroups[0] || 'MEMBRO'; 
    const permissoes = allGroups; // O front trata o array todo como permissões para o hasPermission

    return {
      id: String(decoded.id),
      user: decoded.nome,
      igrejaId: currentChurch?.id || '',
      perfil: perfilBase, 
      permissions: permissoes
    };
  };

  // --- EFEITOS DE INICIALIZAÇÃO ---
  useEffect(() => {
    loadChurches();
    
    const savedToken = localStorage.getItem('church_token');
    if (savedToken) {
      try {
        if (jwtDecode(savedToken).exp! * 1000 < Date.now()) {
          logout();
        } else {
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          setCurrentUser(processToken(savedToken)); // Usa a função auxiliar
          setIsAuthenticated(true);
        }
      } catch (error) {
        logout(); 
      }
    }
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

  const login = async (email: string, pass: string) => {
    try {
      const response = await authApi.login(email, pass);
      const token = response.token; 

      if (!token) throw new Error("Token não recebido da API");

      localStorage.setItem('church_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setCurrentUser(processToken(token)); // Usa a função auxiliar
      setIsAuthenticated(true);
      
      const state = location.state as { from?: Location };
      navigate(state?.from?.pathname ? (state.from.pathname + state.from.search) : '/admin/dashboard');
    } catch (error) {
      console.error("Erro na autenticação:", error);
      throw error; 
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('church_token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const selectChurch = (church: Church) => {
    setCurrentChurch(church);
    localStorage.setItem('selectedChurch', JSON.stringify(church));

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
      removeChurchList,
      hasPermission // <-- Função exportada com sucesso
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);