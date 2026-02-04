import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Users, Calendar, DollarSign, BookOpen, MessageCircle, LogOut, Settings, Shield } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Ministries from './components/Ministries';
import SmallGroups from './components/SmallGroups';
import Events from './components/Events';
import Financials from './components/Financials';
import PrayerWall from './components/PrayerWall';
import ChurchSelector from './components/ChurchSelector';
import PublicHome from './components/PublicHome';
import Login from './components/Login';
import CookieConsent from './components/CookieConsent';
import EventRegistrationPage from './components/EventRegistrationPage';

// Types & Services
import { Church, Event } from './types';
import { churchApi } from './services/api';

function App() {
  // --- 1. ESTADO DE PERSISTÊNCIA E CONFIGURAÇÃO ---
  
  // Tenta recuperar a igreja salva no localStorage ao iniciar
  const [currentChurch, setCurrentChurch] = useState<Church | null>(() => {
    const saved = localStorage.getItem('selectedChurch');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('church_token');
  });

  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{name: string, email: string, role: string} | null>(null);
  
  // Estado para lista de igrejas (usado no seletor)
  const [churches, setChurches] = useState<Church[]>([]);

  // Carrega lista de igrejas ao iniciar (para o seletor)
  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      const data = await churchApi.getAll();
      setChurches(data);
    } catch (error) {
      console.error("Erro ao carregar igrejas:", error);
    }
  };

  // --- 2. HANDLERS DE AÇÃO ---

  const handleLogin = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    // Se já tiver igreja selecionada, vai para o dashboard, senão o fluxo normal pedirá a igreja
    setActiveTab('dashboard'); 
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('church_token');
    setActiveTab('home'); // Volta para a home pública da igreja selecionada
  };

  const handleChurchSelect = (church: Church) => {
    setCurrentChurch(church);
    // Salva a seleção para persistir após F5
    localStorage.setItem('selectedChurch', JSON.stringify(church));
    setActiveTab('home');
  };

  // Função para "Sair da Igreja" e voltar ao seletor
  const handleExitChurch = () => {
    setCurrentChurch(null);
    localStorage.removeItem('selectedChurch');
    setActiveTab('home');
  };

  // Funções de Gerenciamento do Seletor (CRUD Igreja)
  const handleAddChurch = (church: Church) => setChurches([...churches, church]);
  const handleEditChurch = (church: Church) => setChurches(churches.map(c => c.id === church.id ? church : c));
  const handleDeleteChurch = (id: string) => setChurches(churches.filter(c => c.id !== id));

  // Navegação para registro público de eventos (Rota Especial)
  const handleNavigateToRegistration = (event: Event) => {
    window.history.pushState({}, '', `/event/${event.id}/register`);
    // Força re-render para pegar a nova URL (simples routing)
    setActiveTab('event-registration'); 
  };

  // --- 3. ROTEAMENTO SIMPLES (URL CHECK) ---
  
  // Verifica se estamos na rota de inscrição de evento
  const isEventRegistration = window.location.pathname.includes('/event/') && window.location.pathname.includes('/register');
  
  if (isEventRegistration) {
    const pathParts = window.location.pathname.split('/');
    const eventId = pathParts[2];
    // Nota: Em uma app real, você buscaria o evento pelo ID aqui ou dentro do componente
    // Para simplificar, assumimos que o componente lidará com o fetch se necessário
    return <EventRegistrationPage eventId={eventId} onBack={() => {
        window.history.pushState({}, '', '/');
        setActiveTab('home');
    }} />;
  }

  // --- 4. RENDERIZAÇÃO PRINCIPAL ---

  // CASO 1: Nenhuma Igreja Selecionada -> Mostra o Seletor
  if (!currentChurch) {
    return (
      <>
        <ChurchSelector 
          churches={churches} 
          onSelect={handleChurchSelect}
          onAdd={handleAddChurch}
          onEdit={handleEditChurch}
          onDelete={handleDeleteChurch}
        />
        <CookieConsent />
      </>
    );
  }

  // CASO 2: Igreja Selecionada, mas NÃO Logado -> Área Pública ou Login
  if (!isAuthenticated) {
    if (activeTab === 'login') {
      return (
        <Login 
          onLogin={handleLogin} 
          onBack={() => setActiveTab('home')} 
        />
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navbar 
          isAuthenticated={false} 
          onLoginClick={() => setActiveTab('login')}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          churchName={currentChurch.name}
          // Passamos a função para permitir trocar de igreja mesmo na home pública
          onChangeChurch={handleExitChurch} 
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PublicHome 
            // Precisamos buscar os eventos aqui ou dentro do PublicHome. 
            // Para simplificar, o PublicHome deve fazer o fetch baseado no church.id
            events={[]} 
            church={currentChurch}
            onNavigateToEvents={() => setActiveTab('events-public')}
            onNavigateToRegistration={handleNavigateToRegistration}
          />
        </main>
        <CookieConsent />
      </div>
    );
  }

  // CASO 3: Logado e Igreja Selecionada -> Área Administrativa (Multi-tenant)
  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      {/* Sidebar - Menu Lateral */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        currentUser={currentUser}
        onExitChurch={handleExitChurch} // Permite trocar de igreja pelo menu
      />

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Navbar Administrativa */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <Menu size={24} />
              </button>
              <div className="ml-4 md:ml-0 font-semibold text-xl text-gray-800 truncate">
                {currentChurch.name} <span className="text-sm font-normal text-gray-500">| Painel Administrativo</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
               <button 
                 onClick={handleExitChurch}
                 className="text-sm text-gray-500 hover:text-red-600 transition-colors hidden md:block"
                 title="Trocar de Igreja"
               >
                 Trocar Igreja
               </button>
               <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                 {currentUser?.name?.charAt(0) || 'A'}
               </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            
            {/* === ROTEAMENTO DAS ABAS === */}
            {/* Passamos churchId para TODOS os componentes que precisam de dados isolados */}
            
            {activeTab === 'dashboard' && (
              <Dashboard churchId={currentChurch.id} />
            )}
            
            {activeTab === 'members' && (
              <Members churchId={currentChurch.id} />
            )}
            
            {activeTab === 'ministries' && (
              <Ministries churchId={currentChurch.id} />
            )}
            
            {activeTab === 'small-groups' && (
              <SmallGroups churchId={currentChurch.id} />
            )}
            
            {activeTab === 'events' && (
              <Events 
                events={[]} // O componente Events agora carrega seus próprios dados se passar array vazio, ou você pode mover o fetch para cá
                setEvents={() => {}} // Dummy function se o componente gerenciar estado interno
                isAdmin={true} 
                churchId={currentChurch.id} 
              />
            )}
            
            {activeTab === 'financials' && (
              <Financials churchId={currentChurch.id} />
            )}
            
            {activeTab === 'prayer-wall' && (
              <PrayerWall churchId={currentChurch.id} isAdmin={true} />
            )}

          </div>
        </main>
      </div>
      <CookieConsent />
    </div>
  );
}

export default App;