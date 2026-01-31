import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Financials from './components/Financials';
import Events from './components/Events';
import PublicHome from './components/PublicHome';
import Login from './components/Login';
import CookieConsent from './components/CookieConsent';
// import AIAssistant from './components/AIAssistant';
import EventRegistrationPage from './components/EventRegistrationPage';
import ChurchSelector from './components/ChurchSelector';
import Ministries from './components/Ministries';
import SmallGroups from './components/SmallGroups'; // New
import PrayerWall from './components/PrayerWall'; // New
import { Menu } from 'lucide-react';
import { Member, MemberStatus, Transaction, TransactionType, TransactionCategory, Event, EventRegistration, Church, Ministry, Scale, SmallGroup, PrayerRequest } from './types';

// --- MOCK DATA FOR MULTI-TENANCY ---

const INITIAL_CHURCHES: Church[] = [
  { 
    id: 'c1', 
    name: 'Igreja Central da Cidade', 
    slug: 'central', 
    address: 'Av. Paulista, 1000', 
    city: 'São Paulo - SP',
    themeColor: '#2563eb' // Blue
  },
  { 
    id: 'c2', 
    name: 'Comunidade da Paz', 
    slug: 'paz', 
    address: 'Rua das Flores, 45', 
    city: 'Rio de Janeiro - RJ',
    themeColor: '#059669' // Emerald
  },
  { 
    id: 'c3', 
    name: 'Igreja Batista Renovada', 
    slug: 'renovada', 
    address: 'Av. Afonso Pena, 300', 
    city: 'Belo Horizonte - MG',
    themeColor: '#7c3aed' // Violet
  }
];

const MOCK_MEMBERS: Member[] = [
  // Church 1
  { id: '1', churchId: 'c1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-0000', role: 'Diácono', status: MemberStatus.ACTIVE, joinDate: '2023-01-15', birthDate: '1985-10-15' },
  { id: '2', churchId: 'c1', name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 98888-1111', role: 'Membro', status: MemberStatus.ACTIVE, joinDate: '2023-03-20', birthDate: '1990-05-22' },
  { id: '5', churchId: 'c1', name: 'Lucas Pereira', email: 'lucas@email.com', phone: '(11) 97777-6666', role: 'Músico', status: MemberStatus.ACTIVE, joinDate: '2022-01-10', birthDate: '1995-10-28' }, 
  // Church 2
  { id: '3', churchId: 'c2', name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(21) 97777-2222', role: 'Pastor', status: MemberStatus.ACTIVE, joinDate: '2022-11-05', birthDate: '1978-12-01' },
  { id: '4', churchId: 'c2', name: 'Ana Costa', email: 'ana@email.com', phone: '(21) 96666-3333', role: 'Membro', status: MemberStatus.INACTIVE, joinDate: '2023-05-10' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  // Church 1
  { id: '1', churchId: 'c1', description: 'Dízimos Culto Domingo', amount: 3500.00, type: TransactionType.INCOME, category: TransactionCategory.TITHE, date: '2023-10-01' },
  { id: '2', churchId: 'c1', description: 'Conta de Luz', amount: 450.00, type: TransactionType.EXPENSE, category: TransactionCategory.UTILITIES, date: '2023-10-05' },
  // Church 2
  { id: '3', churchId: 'c2', description: 'Ofertas Missões', amount: 1200.00, type: TransactionType.INCOME, category: TransactionCategory.OFFERING, date: '2023-10-08' },
  { id: '4', churchId: 'c2', description: 'Aluguel Equipamento Som', amount: 200.00, type: TransactionType.EXPENSE, category: TransactionCategory.MAINTENANCE, date: '2023-10-10' },
];

const MOCK_EVENTS: Event[] = [
  // Church 1
  { 
    id: '1', 
    churchId: 'c1',
    title: 'Culto da Família', 
    date: '2023-10-29', 
    time: '19:00', 
    description: 'Culto especial com Santa Ceia', 
    location: 'Templo Principal',
    price: 0,
    registrations: []
  },
  // Church 2
  { 
    id: '2', 
    churchId: 'c2',
    title: 'Retiro Espiritual', 
    date: '2023-11-15', 
    time: '08:00', 
    description: 'Retiro de 3 dias no sítio.', 
    location: 'Sítio Vale das Bênçãos',
    price: 250.00,
    registrations: []
  },
];

const MOCK_MINISTRIES: Ministry[] = [
  { id: 'm1', churchId: 'c1', name: 'Louvor', leaderName: 'Lucas Pereira', description: 'Equipe de música', color: '#8B5CF6' },
  { id: 'm2', churchId: 'c1', name: 'Recepção', leaderName: 'João Silva', description: 'Equipe de boas-vindas', color: '#F59E0B' },
];

const MOCK_SCALES: Scale[] = [
  { id: 's1', churchId: 'c1', ministryId: 'm1', date: '2023-10-29', title: 'Culto da Família', volunteers: ['5', '2'] }
];

const MOCK_GROUPS: SmallGroup[] = [
  { id: 'g1', churchId: 'c1', name: 'Célula Morumbi', leaderName: 'Carlos Souza', hostName: 'Família Souza', address: 'Rua A, 123', dayOfWeek: 'Quarta-feira', time: '20:00', neighborhood: 'Morumbi' },
  { id: 'g2', churchId: 'c1', name: 'GC Jovens', leaderName: 'Lucas Pereira', hostName: 'Salão da Igreja', address: 'Av. Paulista, 1000', dayOfWeek: 'Sábado', time: '17:00', neighborhood: 'Centro' }
];

const MOCK_REQUESTS: PrayerRequest[] = [
  { id: 'p1', churchId: 'c1', authorName: 'Maria Santos', request: 'Peço oração pela saúde da minha mãe que fará uma cirurgia.', category: 'Saúde', date: '2023-10-25', prayedCount: 5, isAnonymous: false },
  { id: 'p2', churchId: 'c1', authorName: 'Anônimo', request: 'Orem por uma porta de emprego.', category: 'Financeiro', date: '2023-10-26', prayedCount: 12, isAnonymous: true }
];

const App: React.FC = () => {
  // Application State
  const [churchesList, setChurchesList] = useState<Church[]>(INITIAL_CHURCHES);
  const [currentChurch, setCurrentChurch] = useState<Church | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Navigation State
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Global Data State
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [ministries, setMinistries] = useState<Ministry[]>(MOCK_MINISTRIES);
  const [scales, setScales] = useState<Scale[]>(MOCK_SCALES);
  const [smallGroups, setSmallGroups] = useState<SmallGroup[]>(MOCK_GROUPS);
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>(MOCK_REQUESTS);

  // --- FILTERED DATA FOR CURRENT CHURCH ---
  const currentMembers = useMemo(() => members.filter(m => m.churchId === currentChurch?.id), [members, currentChurch]);
  const currentTransactions = useMemo(() => transactions.filter(t => t.churchId === currentChurch?.id), [transactions, currentChurch]);
  const currentEvents = useMemo(() => events.filter(e => e.churchId === currentChurch?.id), [events, currentChurch]);
  const currentMinistries = useMemo(() => ministries.filter(m => m.churchId === currentChurch?.id), [ministries, currentChurch]);
  const currentScales = useMemo(() => scales.filter(s => s.churchId === currentChurch?.id), [scales, currentChurch]);
  const currentGroups = useMemo(() => smallGroups.filter(g => g.churchId === currentChurch?.id), [smallGroups, currentChurch]);
  const currentRequests = useMemo(() => prayerRequests.filter(r => r.churchId === currentChurch?.id), [prayerRequests, currentChurch]);

  // Auth Handling
  const handleLogin = (status: boolean) => {
    if (status) {
      setIsAuthenticated(true);
      setActiveTab('dashboard'); 
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('home'); 
  };

  // Church Management Handlers
  const handleAddChurch = (church: Church) => {
    setChurchesList([...churchesList, church]);
  };

  const handleEditChurch = (church: Church) => {
    setChurchesList(churchesList.map(c => c.id === church.id ? church : c));
    if (currentChurch?.id === church.id) {
      setCurrentChurch(church);
    }
  };

  const handleDeleteChurch = (id: string) => {
    setChurchesList(churchesList.filter(c => c.id !== id));
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
    if (selectedEvent) {
      const updatedEvents = events.map(ev => {
        if (ev.id === selectedEvent.id) {
          return {
            ...ev,
            registrations: [...(ev.registrations || []), registration]
          };
        }
        return ev;
      });
      setEvents(updatedEvents);
    }
  };

  // Data Update Handlers (Simulated Backend)
  const handleUpdateMembers = (newMembers: React.SetStateAction<Member[]>) => {
    if (typeof newMembers !== 'function') {
      const otherChurchMembers = members.filter(m => m.churchId !== currentChurch?.id);
      const validNewMembers = newMembers.map(m => ({...m, churchId: currentChurch?.id || ''}));
      setMembers([...otherChurchMembers, ...validNewMembers]);
    }
  };
  
  const handleUpdateTransactions = (newTransactions: React.SetStateAction<Transaction[]>) => {
    if (typeof newTransactions !== 'function') {
       const otherChurchTrans = transactions.filter(t => t.churchId !== currentChurch?.id);
       const validNewTrans = newTransactions.map(t => ({...t, churchId: currentChurch?.id || ''}));
       setTransactions([...otherChurchTrans, ...validNewTrans]);
    }
  };

  const handleUpdateEvents = (newEvents: React.SetStateAction<Event[]>) => {
    if (typeof newEvents !== 'function') {
       const otherChurchEvents = events.filter(e => e.churchId !== currentChurch?.id);
       const validNewEvents = newEvents.map(e => ({...e, churchId: currentChurch?.id || ''}));
       setEvents([...otherChurchEvents, ...validNewEvents]);
    }
  };

  const handleUpdateMinistries = (newMinistries: Ministry[]) => {
      const other = ministries.filter(m => m.churchId !== currentChurch?.id);
      setMinistries([...other, ...newMinistries]);
  };

  const handleUpdateScales = (newScales: Scale[]) => {
      const other = scales.filter(s => s.churchId !== currentChurch?.id);
      setScales([...other, ...newScales]);
  };

  const handleUpdateGroups = (newGroups: SmallGroup[]) => {
    const other = smallGroups.filter(g => g.churchId !== currentChurch?.id);
    setSmallGroups([...other, ...newGroups]);
  };

  const handleUpdateRequests = (newRequests: PrayerRequest[]) => {
    const other = prayerRequests.filter(r => r.churchId !== currentChurch?.id);
    setPrayerRequests([...other, ...newRequests]);
  };

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
              {activeTab === 'dashboard' && <Dashboard members={currentMembers} transactions={currentTransactions} eventsCount={currentEvents.length} />}
              {activeTab === 'members' && <Members members={currentMembers} setMembers={handleUpdateMembers} />}
              {activeTab === 'ministries' && (
                <Ministries 
                  ministries={currentMinistries} 
                  setMinistries={handleUpdateMinistries}
                  scales={currentScales}
                  setScales={handleUpdateScales}
                  members={currentMembers}
                  churchId={currentChurch.id}
                />
              )}
              {activeTab === 'small-groups' && (
                <SmallGroups 
                  groups={currentGroups} 
                  setGroups={handleUpdateGroups} 
                  churchId={currentChurch.id} 
                />
              )}
              {activeTab === 'prayer-wall' && (
                <PrayerWall 
                  requests={currentRequests} 
                  setRequests={handleUpdateRequests} 
                  churchId={currentChurch.id} 
                />
              )}
              {activeTab === 'financial' && <Financials transactions={currentTransactions} setTransactions={handleUpdateTransactions} />}
              {activeTab === 'events' && <Events events={currentEvents} setEvents={handleUpdateEvents} isAdmin={true} />}
              
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
              events={currentEvents} 
              onNavigateToEvents={() => { setActiveTab('events'); window.scrollTo(0,0); }}
              onNavigateToRegistration={handleNavigateToRegistration}
            />
          )}
          
          {activeTab === 'events' && (
            <Events 
              events={currentEvents} 
              setEvents={handleUpdateEvents} 
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