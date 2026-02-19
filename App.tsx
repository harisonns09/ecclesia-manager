import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { Toaster } from 'sonner'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Loader } from 'lucide-react'; // Ícone para o loading

// --- COMPONENTES LEVES (Carregamento Imediato) ---
// Mantemos layouts e seletores base com import direto para evitar "piscadas" na UI inicial
import AdminLayout from './layouts/AdminLayout';
import Navbar from './components/Navbar';
import CookieConsent from './components/CookieConsent';

// --- COMPONENTES PESADOS (Lazy Loading) ---
// O Vite/Webpack criará arquivos .js separados para cada um destes
const Dashboard = lazy(() => import('./components/Dashboard'));
const MembersListPage = lazy(() => import('./components/MembersListPage'));
const MemberFormPage = lazy(() => import('./components/MemberFormPage'));
const Ministries = lazy(() => import('./components/Ministries'));
const SmallGroups = lazy(() => import('./components/SmallGroups'));
const Events = lazy(() => import('./components/Events'));
const Financials = lazy(() => import('./components/Financials'));
const ChurchSelector = lazy(() => import('./components/ChurchSelector'));
const PublicHome = lazy(() => import('./components/PublicHome'));
const Login = lazy(() => import('./components/Login'));
const EventRegistrationPage = lazy(() => import('./components/EventRegistrationPage'));
const EventFormPage = lazy(() => import('./components/EventFormPage'));
const EventAttendeesPage = lazy(() => import('./components/EventAttendeesPage'));
const RegistrationStatusPage = lazy(() => import('./components/RegistrationStatusPage'));
const Visitors = lazy(() => import('./components/Visitors'));
const VisitorRegistrationPage = lazy(() => import('./components/VisitorRegistrationPage'));
const MemberRegistrationPublic = lazy(() => import('./components/MemberRegistrationPublic'));
const KidsCheckInPage = lazy(() => import('./components/KidsCheckInPage'));
const KidsDashboardPage = lazy(() => import('./components/KidsDashboardPage'));

// Componente de carregamento elegante
const PageLoader = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
    <Loader className="animate-spin text-blue-600 mb-4" size={40} />
    <p className="text-gray-500 font-medium animate-pulse">Carregando módulo...</p>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentChurch, isAuthenticated, selectChurch, exitChurch, addChurchList, updateChurchList, removeChurchList, churches } = useApp();

  return (
    // O Suspense é obrigatório para envolver componentes Lazy
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* --- ROTA PÚBLICA / LANDING PAGE --- */}
        <Route path="/" element={
          !currentChurch ? (
            <>
              <ChurchSelector 
                churches={churches} onSelect={selectChurch} onAdd={addChurchList} 
                onEdit={updateChurchList} onDelete={removeChurchList} 
              />
              <CookieConsent />
            </>
          ) : (
            <div className="min-h-screen bg-gray-50">
              <Navbar activeTab="home" setActiveTab={() => { }} />
              <main className="max-w-7xl mx-auto px-4 py-8">
                <PublicHome />
              </main>
              <CookieConsent />
            </div>
          )
        } />

        {/* --- LOGIN --- */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/admin/dashboard" /> : <Login onBack={() => exitChurch()} />
        } />

        {/* --- CADASTROS PÚBLICOS --- */}
        <Route path="/cadastro" element={!currentChurch ? <Navigate to="/" /> : <MemberRegistrationPublic />} />
        <Route path="/visitor" element={!currentChurch ? <Navigate to="/" /> : <VisitorRegistrationPage />} />

        {/* --- EVENTOS PÚBLICOS --- */}
        <Route path="/eventos" element={
          !currentChurch ? <Navigate to="/" /> : (
            <div className="min-h-screen bg-gray-50">
              <Navbar activeTab="events-public" setActiveTab={() => { }} />
              <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Agenda de Eventos</h1>
                  <Events isAdmin={false} onRegisterClick={(event) => navigate(`/evento/${event.id}/inscricao`)} />
                </div>
              </main>
              <CookieConsent />
            </div>
          )
        } />

        <Route path="/evento/:id/inscricao" element={<EventRegistrationPage />} />
        <Route path="/minha-inscricao/:id" element={<RegistrationStatusPage />} />

        {/* --- ÁREA ADMINISTRATIVA (PROTEGIDA) --- */}
        <Route path="/admin" element={
          !currentChurch ? <Navigate to="/" /> : !isAuthenticated ? <Navigate to="/login" /> : <AdminLayout />
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<MembersListPage />} />
          <Route path="members/new" element={<MemberFormPage />} />
          <Route path="members/edit/:id" element={<MemberFormPage />} />
          <Route path="ministries" element={<Ministries />} />
          <Route path="small-groups" element={<SmallGroups />} />
          <Route path="events" element={<Events isAdmin={true} />} />
          <Route path="events/new" element={<EventFormPage />} />
          <Route path="events/edit/:id" element={<EventFormPage />} />
          <Route path="events/:id/attendees" element={<EventAttendeesPage />} />
          <Route path="financials" element={<Financials />} />
          <Route path="visitors" element={<Visitors/>} />
          <Route path="kids/checkin" element={<KidsCheckInPage />} />
          <Route path="kids/dashboard" element={<KidsDashboardPage />} />
          <Route index element={<Navigate to="dashboard" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </AppProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;