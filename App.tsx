import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './components/Dashboard';
import MembersListPage from './components/MembersListPage';
import MemberFormPage from './components/MemberFormPage';
import Ministries from './components/Ministries';
import SmallGroups from './components/SmallGroups';
import Events from './components/Events';
import Financials from './components/Financials';
import PrayerWall from './components/PrayerWall';
import ChurchSelector from './components/ChurchSelector';
import PublicHome from './components/PublicHome';
import Navbar from './components/Navbar';
import Login from './components/Login';
import EventRegistrationPage from './components/EventRegistrationPage';
import CookieConsent from './components/CookieConsent';
import EventFormPage from './components/EventFormPage';
import EventAttendeesPage from './components/EventAttendeesPage';
import RegistrationStatusPage from './components/RegistrationStatusPage';
import Visitors from './components/Visitors';
import VisitorRegistrationPage from './components/VisitorRegistrationPage'; // <--- Importe aqui

import { Church, Transaction, Event } from './types';
import { churchApi } from './services/api';

function App() {
  const navigate = useNavigate();

  const [currentChurch, setCurrentChurch] = useState<Church | null>(() => {
    const saved = localStorage.getItem('selectedChurch');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('church_token');
  });

  const [currentUser, setCurrentUser] = useState<{ name: string, email: string, role: string } | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);

  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

  const handleLogin = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    navigate('/admin/dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('church_token');
    navigate('/login');
  };

  const handleChurchSelect = (church: Church) => {
    setCurrentChurch(church);
    localStorage.setItem('selectedChurch', JSON.stringify(church));
  };

  const handleExitChurch = () => {
    setCurrentChurch(null);
    localStorage.removeItem('selectedChurch');
    navigate('/');
  };

  const handleAddChurch = (church: Church) => setChurches([...churches, church]);
  const handleEditChurch = (church: Church) => setChurches(churches.map(c => c.id === church.id ? church : c));
  const handleDeleteChurch = (id: string) => setChurches(churches.filter(c => c.id !== id));

  return (
    <Routes>
      {/* ROTA PÚBLICA / LANDING PAGE */}
      <Route path="/" element={
        !currentChurch ? (
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
        ) : (
          <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar
              isAuthenticated={isAuthenticated}
              onLoginClick={() => navigate('/login')}
              activeTab="home"
              setActiveTab={() => { }}
              onLogout={handleLogout}
              churchName={currentChurch.name}
              onChangeChurch={handleExitChurch}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <PublicHome
                events={events} // Passando estado
                church={currentChurch}
                onNavigateToEvents={() => navigate('/eventos')}
                onNavigateToRegistration={(event) => navigate(`/evento/${event.id}/inscricao`)}
              />
            </main>
            <CookieConsent />
          </div>
        )
      } />

      {/* ROTA PÚBLICA DE EVENTOS */}
      <Route path="/eventos" element={
        !currentChurch ? <Navigate to="/" /> : (
          <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <Navbar
              isAuthenticated={isAuthenticated}
              onLoginClick={() => navigate('/login')}
              activeTab="events-public"
              setActiveTab={() => { }}
              onLogout={handleLogout}
              churchName={currentChurch.name}
              onChangeChurch={handleExitChurch}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Agenda de Eventos</h1>
                <Events
                  isAdmin={false}
                  churchId={currentChurch.id}
                  events={events}
                  setEvents={setEvents}
                  onRegisterClick={(event) => navigate(`/evento/${event.id}/inscricao`)}
                />
              </div>
            </main>
            <CookieConsent />
          </div>
        )
      } />

      <Route path="/visitor" element={
          !currentChurch ? <Navigate to="/" /> : (
             <VisitorRegistrationPage church={currentChurch} />
          )
        } />

      {/* LOGIN */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/admin/dashboard" /> : (
          <Login onLogin={handleLogin} onBack={() => navigate('/')} />
        )
      } />

      {/* ROTAS PÚBLICAS DE INSCRIÇÃO */}
      <Route path="/evento/:id/inscricao" element={<EventRegistrationPage />} />
      <Route path="/minha-inscricao/:id" element={<RegistrationStatusPage />} />

      {/* ÁREA ADMINISTRATIVA (PROTEGIDA) */}
      <Route path="/admin" element={
        <AdminLayout
          isAuthenticated={isAuthenticated}
          currentChurch={currentChurch}
          onLogout={handleLogout}
          onExitChurch={handleExitChurch}
          currentUser={currentUser}
        />
      }>
        <Route path="dashboard" element={<Dashboard churchId={currentChurch?.id || ''} />} />
        {/* Listagem (A rota principal /members agora aponta para a lista) */}
        <Route path="members" element={<MembersListPage churchId={currentChurch?.id || ''} />} />
        
        {/* Cadastro Novo */}
        <Route path="members/new" element={<MemberFormPage churchId={currentChurch?.id || ''} />} />
        
        {/* Edição (Usa o mesmo componente do form, mas captura o ID) */}
        <Route path="members/edit/:id" element={<MemberFormPage churchId={currentChurch?.id || ''} />} />
        <Route path="ministries" element={<Ministries churchId={currentChurch?.id || ''} />} />
        <Route path="small-groups" element={<SmallGroups churchId={currentChurch?.id || ''} />} />
        <Route path="events" element={
          <Events
            isAdmin={true}
            churchId={currentChurch?.id || ''}
            events={events}
            setEvents={setEvents}
          />
        } />
        <Route path="events/new" element={<EventFormPage churchId={currentChurch?.id || ''} />} />
        <Route path="events/edit/:id" element={<EventFormPage churchId={currentChurch?.id || ''} />} />
        <Route path="events/:id/attendees" element={<EventAttendeesPage churchId={currentChurch?.id || ''} />} />
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="financials" element={
            <Financials 
                churchId={currentChurch?.id || ''} 
                transactions={transactions} 
                setTransactions={setTransactions} 
            />
          } />
        <Route path="visitors" element={<Visitors churchId={currentChurch?.id || ''} />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;