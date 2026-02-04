import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Financials from './components/Financials';
import Events from './components/Events';
import PublicHome from './components/PublicHome';
import Login from './components/Login';
import CookieConsent from './components/CookieConsent';
import EventRegistrationPage from './components/EventRegistrationPage';
import ChurchSelector from './components/ChurchSelector';
import Ministries from './components/Ministries';
import SmallGroups from './components/SmallGroups'; 
import PrayerWall from './components/PrayerWall'; 
import { Menu } from 'lucide-react';
import { Member, Transaction, Event, EventRegistration, Church, Ministry, Scale, SmallGroup, PrayerRequest } from './types';

// Importando sua API configurada
import { 
  churchApi, 
  memberApi, 
  transactionApi, 
  eventApi, 
  ministryApi, 
  scaleApi, 
  smallGroupApi, 
  prayerRequestApi 
} from './services/api';

const App: React.FC = () => {
  // --- APPLICATION STATE ---
  const [churchesList, setChurchesList] = useState<Church[]>([]);
  const [currentChurch, setCurrentChurch] = useState<Church | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA STATE (Agora armazenam apenas os dados da igreja atual) ---
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [scales, setScales] = useState<Scale[]>([]);
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>([]);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);

  // Navigation State
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // 1. EFEITO: CARREGAR LISTA DE IGREJAS AO INICIAR
  useEffect(() => {
    loadChurches();
  }, []);

  const loadChurches = async () => {
    try {
      const data = await churchApi.getAll();
      setChurchesList(data);
    } catch (error) {
      console.error("Erro ao carregar igrejas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. EFEITO: CARREGAR DADOS DA IGREJA SELECIONADA (Se autenticado)
  useEffect(() => {
    if (currentChurch && isAuthenticated) {
      loadChurchData(currentChurch.id);
    }
  }, [currentChurch, isAuthenticated]);

  // 3. EFEITO: CARREGAR EVENTOS PÚBLICOS (Mesmo sem login)
  useEffect(() => {
    if (currentChurch && !isAuthenticated) {
      // Carrega apenas eventos para a Home Pública
      eventApi.getByChurch(currentChurch.id)
        .then(data => setEvents(data))
        .catch(err => console.error("Erro ao carregar eventos públicos", err));
    }
  }, [currentChurch, isAuthenticated]);

  const loadChurchData = async (churchId: string) => {
    try {
      const [membrosData, transData, eventosData, minData, escalasData, celulasData, oracoesData] = await Promise.all([
        memberApi.getByChurch(churchId),
        transactionApi.getByChurch(churchId),
        eventApi.getByChurch(churchId),
        ministryApi.getByChurch(churchId),
        scaleApi.getByChurch(churchId),
        smallGroupApi.getByChurch(churchId),
        prayerRequestApi.getByChurch(churchId)
      ]);

      setMembers(membrosData);
      setTransactions(transData);
      setEvents(eventosData);
      setMinistries(minData);
      setScales(escalasData);
      setSmallGroups(celulasData);
      setPrayerRequests(oracoesData);

    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      // Se der erro (ex: token inválido), talvez deslogar
      if ((error as any).response?.status === 403) {
        handleLogout();
      }
    }
  };

  // --- HANDLERS ---

  const handleLogin = (status: boolean) => {
    if (status) {
      setIsAuthenticated(true);
      setActiveTab('dashboard'); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('church_token'); // Remove token
    setIsAuthenticated(false);
    setActiveTab('home'); 
    // Limpa estados sensíveis
    setMembers([]);
    setTransactions([]);
  };

  // Manipulação de Igrejas
  const handleAddChurch = async (church: Church) => {
    try {
      // O ChurchSelector já chama a API, aqui só atualizamos a lista local
      await loadChurches(); 
    } catch (error) {
      console.error("Erro ao atualizar lista de igrejas", error);
    }
  };

  const handleEditChurch = async (church: Church) => {
    await loadChurches();
    if (currentChurch?.id === church.id) {
      setCurrentChurch(church);
    }
  };

  const handleDeleteChurch = async (id: string) => {
    await loadChurches();
    if (currentChurch?.id === id) {
      setCurrentChurch(null);
    }
  };

  // Event Registration Logic
  const handleNavigateToRegistration = (event: Event) => {
    setSelectedEvent(event);
    setActiveTab('event-registration');
    window.scrollTo(0, 0);
  };

  const handleRegisterUser = (registration: EventRegistration) => {
    // A lógica de API para registrar deve estar dentro do componente EventRegistrationPage
    // Aqui apenas atualizamos o estado local para refletir na UI se necessário
    if (selectedEvent && currentChurch) {
        // Recarrega eventos para mostrar contagem atualizada
        eventApi.getByChurch(currentChurch.id).then(setEvents);
    }
  };

  // --- RENDER: LOADING ---
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">Carregando sistema...</div>;
  }

  // --- RENDER: CHURCH SELECTOR (PORTAL) ---
  if (!currentChurch) {
    return (
      <ChurchSelector 
        churches={churchesList} 
        onSelect={(church) => {
          setCurrentChurch(church);
          setActiveTab('home'); 
        }}
        onAdd={handleAddChurch}
        onEdit={handleEditChurch}
        onDelete={handleDeleteChurch}
      />
    );
  }

  // --- RENDER: ADMIN SYSTEM ---
  if (isAuthenticated) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          onLogout={handleLogout}
          currentChurch={currentChurch}
        />

        <div className="flex-1 flex flex-col overflow-hidden w-full relative">
          <header className="md:hidden flex items-center p-4 bg-white border-b border-gray-200 shadow-sm z-10">
            <button onClick={() => setIsMobileSidebarOpen(true)} className="text-gray-600 mr-4">
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg text-gray-800">{currentChurch.name}</span>
          </header>

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto h-full animate-in fade-in duration-300">
              {activeTab === 'dashboard' && <Dashboard members={members} transactions={transactions} eventsCount={events.length} />}
              
              {/* Note: Passamos setMembers para manter compatibilidade, mas idealmente os componentes filhos chamariam a API e depois atualizariam o estado */}
              {activeTab === 'members' && <Members members={members} setMembers={setMembers} />}
              
              {activeTab === 'ministries' && (
                <Ministries 
                  ministries={ministries} 
                  setMinistries={setMinistries}
                  scales={scales}
                  setScales={setScales}
                  members={members}
                  churchId={currentChurch.id}
                />
              )}
              
              {activeTab === 'small-groups' && (
                <SmallGroups 
                  groups={smallGroups} 
                  setGroups={setSmallGroups} 
                  churchId={currentChurch.id} 
                />
              )}
              
              {activeTab === 'prayer-wall' && (
                <PrayerWall 
                  requests={prayerRequests} 
                  setRequests={setPrayerRequests} 
                  churchId={currentChurch.id} 
                />
              )}
              
              {activeTab === 'financial' && <Financials transactions={transactions} setTransactions={setTransactions} />}
              
              {activeTab === 'events' && <Events events={events} setEvents={setEvents} isAdmin={true} />}
              
            </div>
          </main>
        </div>
        <CookieConsent />
      </div>
    );
  }

  // --- RENDER: PUBLIC WEBSITE (For Specific Church) ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentChurch={currentChurch}
        onExitChurch={() => {
          setCurrentChurch(null);
          setIsAuthenticated(false);
          setActiveTab('home');
        }}
      />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
          {activeTab === 'home' && (
  <PublicHome 
    events={events} 
    church={currentChurch} // <--- ADICIONE ESTA LINHA
    onNavigateToEvents={() => { setActiveTab('events'); window.scrollTo(0,0); }}
    onNavigateToRegistration={handleNavigateToRegistration}
  />
)}
          
          {activeTab === 'events' && (
            <Events 
              events={events} 
              setEvents={setEvents} 
              isAdmin={false} 
              onRegisterClick={handleNavigateToRegistration} 
            />
          )}

          {activeTab === 'event-registration' && selectedEvent && (
            <EventRegistrationPage 
              event={selectedEvent} 
              onBack={() => { setActiveTab('events'); window.scrollTo(0,0); }}
              onRegister={handleRegisterUser}
            />
          )}
          
          {activeTab === 'login' && <Login onLogin={handleLogin} />}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; 2024 Ecclesia Manager. Todos os direitos reservados.</p>
          <p className="mt-2 text-gray-400">Sistema de Gestão para {currentChurch.name}.</p>
        </div>
      </footer>

      <CookieConsent />
    </div>
  );
};

export default App;