import React, { useEffect, useState } from 'react';
import { Users, Calendar, Gift, Loader, MapPin, Clock } from 'lucide-react';
import { Member, Event } from '../types';
import { memberApi, eventApi } from '../services/api';

interface DashboardProps {
  churchId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ churchId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (churchId) {
      loadDashboardData();
    }
  }, [churchId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Carrega membros e eventos em paralelo
      const [membersResult, eventsResult] = await Promise.allSettled([
        memberApi.getByChurch(churchId),
        eventApi.getByChurch(churchId)
      ]);

      if (membersResult.status === 'fulfilled') {
        setMembers(membersResult.value);
      } else {
        console.warn("Falha ao carregar membros:", membersResult.reason);
      }

      if (eventsResult.status === 'fulfilled') {
        setEvents(eventsResult.value);
      } else {
        console.warn("Falha ao carregar eventos:", eventsResult.reason);
      }

    } catch (error) {
      console.error("Erro geral no dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- LÓGICA DE CÁLCULO ---

  const activeMembers = members.length;
  
  // Filtra e ordena eventos futuros
  const upcomingEvents = events
    .filter(e => new Date(e.dataEvento) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime())
    .slice(0, 5); // Pega apenas os 5 primeiros

  // Lógica de Aniversariantes
  const currentMonth = new Date().getMonth(); // 0-indexed
  const birthdaysThisMonth = members.filter(m => {
    if (!m.dataNascimento) return false;
    const dateStr = m.dataNascimento.includes('T') ? m.dataNascimento : `${m.dataNascimento}T00:00:00`;
    const birthMonth = new Date(dateStr).getMonth();
    return birthMonth === currentMonth;
  }).sort((a, b) => {
      const dateA = a.dataNascimento!.includes('T') ? a.dataNascimento! : `${a.dataNascimento}T00:00:00`;
      const dateB = b.dataNascimento!.includes('T') ? b.dataNascimento! : `${b.dataNascimento}T00:00:00`;
      const dayA = new Date(dateA).getDate();
      const dayB = new Date(dateB).getDate();
      return dayA - dayB;
  });

  const StatCard = ({ title, value, icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="text-gray-500">Carregando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
        <button 
          onClick={loadDashboardData} 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Atualizar Dados
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Membros Ativos" 
          value={activeMembers} 
          icon={<Users size={24} className="text-blue-600" />}
          color="bg-blue-100"
          subtext={`Total: ${members.length} cadastrados`}
        />
        <StatCard 
          title="Próximos Eventos" 
          value={upcomingEvents.length}
          icon={<Calendar size={24} className="text-purple-600" />}
          color="bg-purple-100"
          subtext="Agendados para breve"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Próximos Eventos */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="mr-2 text-purple-600" size={20} />
            Agenda de Eventos
          </h3>
          
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event.id} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-purple-200 transition-colors">
                  <div className="bg-white p-3 rounded-lg border border-gray-200 text-center min-w-[70px] mr-4">
                    <div className="text-xs font-bold text-gray-500 uppercase">
                      {new Date(event.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                    </div>
                    <div className="text-xl font-bold text-purple-700">
                      {new Date(event.dataEvento + 'T00:00:00').getDate()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{event.nomeEvento}</h4>
                    <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
                      <span className="flex items-center"><Clock size={14} className="mr-1" /> {event.horario}</span>
                      <span className="flex items-center"><MapPin size={14} className="mr-1" /> {event.local}</span>
                    </div>
                    {event.descricao && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-1">{event.descricao}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Calendar size={32} className="mb-2 opacity-50" />
              <p>Nenhum evento futuro agendado.</p>
            </div>
          )}
        </div>

        {/* Aniversariantes */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-full max-h-[500px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between rounded-t-xl">
             <h3 className="font-semibold text-gray-800 flex items-center">
               <Gift size={18} className="mr-2 text-pink-500" />
               Aniversariantes do Mês
             </h3>
             <span className="text-xs font-bold bg-pink-100 text-pink-600 px-2 py-1 rounded-full">{birthdaysThisMonth.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            {birthdaysThisMonth.length > 0 ? (
              <div className="space-y-3">
                {birthdaysThisMonth.map(m => {
                   const dateStr = m.dataNascimento ? (m.dataNascimento.includes('T') ? m.dataNascimento : `${m.dataNascimento}T00:00:00`) : new Date().toISOString();
                   const day = new Date(dateStr).getDate();
                   
                   return (
                    <div key={m.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-3 font-bold text-xs shrink-0">
                          {m.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">{m.nome}</p>
                          <p className="text-xs text-gray-500">{m.ministerio || 'Membro'}</p>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded shrink-0">
                        Dia {day}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                <Gift size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Nenhum aniversariante neste mês.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;