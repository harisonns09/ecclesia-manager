import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Components e Pages
import AdminLayout from './layouts/AdminLayout'; // Certifique-se de ter criado este arquivo
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import Ministries from './components/Ministries';
import SmallGroups from './components/SmallGroups';
import Events from './components/Events';
import Financials from './components/Financials';
import PrayerWall from './components/PrayerWall';
import ChurchSelector from './components/ChurchSelector';
import PublicHome from './components/PublicHome';
import Navbar from './components/Navbar'; // Importe a Navbar
import Login from './components/Login';
import EventRegistrationPage from './components/EventRegistrationPage';
import CookieConsent from './components/CookieConsent';

import { Church } from './types';
import { churchApi } from './services/api';

function App() {
  // Estado Global
  const [currentChurch, setCurrentChurch] = useState<Church | null>(() => {
    const saved = localStorage.getItem('selectedChurch');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('church_token');
  });

  const [currentUser, setCurrentUser] = useState<{name: string, email: string, role: string} | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);

  // Carrega Igrejas ao iniciar
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

  // Handlers
  const handleLogin = (user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('church_token');
  };

  const handleChurchSelect = (church: Church) => {
    setCurrentChurch(church);
    localStorage.setItem('selectedChurch', JSON.stringify(church));
  };

  const handleExitChurch = () => {
    setCurrentChurch(null);
    localStorage.removeItem('selectedChurch');
  };

  // CRUD Igreja para o Seletor
  const handleAddChurch = (church: Church) => setChurches([...churches, church]);
  const handleEditChurch = (church: Church) => setChurches(churches.map(c => c.id === church.id ? church : c));
  const handleDeleteChurch = (id: string) => setChurches(churches.filter(c => c.id !== id));

  return (
    <BrowserRouter>
      <Routes>
        {/* ROTA RAIZ: 
           - Se NÃO tem igreja selecionada -> Mostra Seletor (Sem Navbar)
           - Se TEM igreja selecionada -> Mostra Home Pública (COM Navbar)
        */}
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
                onLoginClick={() => window.location.href = '/login'} // Força navegação para login
                activeTab="home"
                setActiveTab={() => {}} // Home é estática aqui
                onLogout={handleLogout}
                churchName={currentChurch.name}
                onChangeChurch={handleExitChurch} 
              />
              
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PublicHome 
                  events={[]} // O componente pode buscar seus próprios eventos se refatorado, ou passamos vazio por enquanto
                  church={currentChurch}
                  onNavigateToEvents={() => window.location.href = '/eventos'} 
                  onNavigateToRegistration={(event) => window.location.href = `/evento/${event.id}/inscricao`}
                />
              </main>
              <CookieConsent />
            </div>
          )
        } />

        <Route path="/eventos" element={
          !currentChurch ? <Navigate to="/" /> : (
            <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
              <Navbar 
                isAuthenticated={isAuthenticated} 
                onLoginClick={() => window.location.href = '/login'} 
                activeTab="events-public" 
                setActiveTab={() => {}} 
                onLogout={handleLogout}
                churchName={currentChurch.name}
                onChangeChurch={handleExitChurch} 
              />
              
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Agenda de Eventos</h1>
                  {/* Reutiliza o componente Events em modo somente leitura (isAdmin=false) */}
                  <Events 
                    isAdmin={false} 
                    churchId={currentChurch.id} 
                    events={[]} 
                    setEvents={() => {}} 
                    onRegisterClick={(event) => window.location.href = `/evento/${event.id}/inscricao`}
                  />
                </div>
              </main>
              <CookieConsent />
            </div>
          )
        } />

        {/* ROTA DE LOGIN */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/admin/dashboard" /> : (
            <Login onLogin={handleLogin} onBack={() => window.location.href = '/'} />
          )
        } />

        {/* ROTA PÚBLICA DE INSCRIÇÃO (Sem sidebar, tela cheia) */}
        <Route path="/evento/:id/inscricao" element={<EventRegistrationPage />} />

        {/* ROTAS ADMINISTRATIVAS (Protegidas) */}
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
          <Route path="members" element={<Members churchId={currentChurch?.id || ''} />} />
          <Route path="ministries" element={<Ministries churchId={currentChurch?.id || ''} />} />
          <Route path="small-groups" element={<SmallGroups churchId={currentChurch?.id || ''} />} />
          <Route path="events" element={<Events isAdmin={true} churchId={currentChurch?.id || ''} events={[]} setEvents={() => {}} />} />
          
          {/* Seus componentes financeiros e de oração devem estar atualizados para receber churchId */}
          {/* <Route path="financials" element={<Financials churchId={currentChurch?.id || ''} />} /> */}
          {/* <Route path="prayer-wall" element={<PrayerWall churchId={currentChurch?.id || ''} />} /> */}
          
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;