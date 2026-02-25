import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Church } from '../types';
import { churchApi, authApi, api } from '../services/api'; // Adicionamos o authApi

// Interface para mapear o que vem de dentro do Token JWT (Ajustado para bater com seu TokenService)
interface DecodedToken {
  sub: string; // E-mail
  id: string;  // O ID do usuário (pode vir como número do Java, tratamos no código)
  nome: string;
  role: string;
  exp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AppContextData {
  isAuthenticated: boolean;
  currentUser: User | null;
  currentChurch: Church | null;
  churches: Church[];
  isLoadingChurches: boolean;

  // Login agora pede email e senha de volta!
  login: (email: string, pass: string) => Promise<void>; 
  logout: () => void;
  selectChurch: (church: Church) => void;
  exitChurch: () => void;
  
  addChurchList: (church: Church) => void;
  updateChurchList: (church: Church) => void;
  removeChurchList: (id: string) => void;
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

  // --- EFEITOS DE INICIALIZAÇÃO ---
  useEffect(() => {
    loadChurches();
    
    const savedToken = localStorage.getItem('church_token');
    if (savedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(savedToken);
        
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          setCurrentUser({
            id: String(decoded.id), // Garante que é string
            name: decoded.nome,
            email: decoded.sub,
            role: decoded.role
          });
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

  // Agora o Contexto é quem chama o Backend!
  const login = async (email: string, pass: string) => {
    try {
      // 1. Chama a API do Spring Boot
      const response = await authApi.login(email, pass);
      const token = response.token; // Pega o token do LoginResponseDTO do Java

      if (!token) {
          throw new Error("Token não recebido da API");
      }

      // 2. Salva o token
      localStorage.setItem('church_token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 3. Lê quem é o usuário de dentro do token
      const decoded = jwtDecode<DecodedToken>(token);
      
      setCurrentUser({
        id: String(decoded.id),
        name: decoded.nome,
        email: decoded.sub,
        role: decoded.role
      });
      setIsAuthenticated(true);
      
      // 4. Redirecionamento Inteligente
      const state = location.state as { from?: Location };
      if (state?.from?.pathname) {
          navigate(state.from.pathname + state.from.search);
      } else {
          navigate('/admin/dashboard');
      }
    } catch (error) {
      // O erro 'cai' aqui se a senha estiver errada, e nós repassamos para a tela de Login exibir
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
      login, // Exporta a função que faz tudo
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

export const useApp = () => useContext(AppContext);