import React, { useEffect, useState } from 'react';
import { Users, Calendar, Gift, Loader, MapPin, Clock, RefreshCw, PartyPopper } from 'lucide-react';
import { Member, Event } from '../types';
import { memberApi, eventApi } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { currentChurch: church } = useApp();

  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (church) {
      loadDashboardData();
    }
  }, [church]);

  const loadDashboardData = async () => {
    if (!church) return;
    
    setIsLoading(true);
    try {
      const [membersResult, eventsResult] = await Promise.allSettled([
        memberApi.getByChurch(church.id),
        eventApi.getByChurch(church.id)
      ]);

      if (membersResult.status === 'fulfilled') {
        setMembers(membersResult.value);
      } else {
          console.error("Erro ao carregar membros", membersResult.reason);
      }

      if (eventsResult.status === 'fulfilled') {
        setEvents(eventsResult.value);
      } else {
          console.error("Erro ao carregar eventos", eventsResult.reason);
      }
      
    } catch (error) {
      console.error("Erro geral no dashboard:", error);
      toast.error("Erro ao carregar dados do painel.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!church) return null;

  const activeMembers = members.length;
  
  const upcomingEvents = events
    .filter(e => new Date(e.dataEvento) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime())
    .slice(0, 5);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();

  const birthdaysThisMonth = members.filter(m => {
    if (!m.dataNascimento) return false;
    const dateStr = m.dataNascimento.includes('T') ? m.dataNascimento : `${m.dataNascimento}T00:00:00`;
    const birthMonth = new Date(dateStr).getMonth();
    return birthMonth === currentMonth;
  }).sort((a, b) => {
      const dateA = a.dataNascimento!.includes('T') ? a.dataNascimento! : `${a.dataNascimento}T00:00:00`;
      const dateB = b.dataNascimento!.includes('T') ? b.dataNascimento! : `${b.dataNascimento}T00:00:00`;
      return new Date(dateA).getDate() - new Date(dateB).getDate();
  });

  const birthdaysToday = members.filter(m => {
    if (!m.dataNascimento) return false;
    const dateStr = m.dataNascimento.includes('T') ? m.dataNascimento : `${m.dataNascimento}T00:00:00`;
    const d = new Date(dateStr);
    return d.getMonth() === currentMonth && d.getDate() === currentDay;
  });

  // --- COMPONENTE INTERNO ---
  const StatCard = ({ title, value, icon, colorClass, subtext }: any) => {
    const colors = {
        blue: { bg: 'bg-[#eff6ff]', text: 'text-[#1e3a8a]', iconBg: 'bg-[#dbeafe]' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-900', iconBg: 'bg-purple-100' },
    }[colorClass as 'blue' | 'purple'] || { bg: 'bg-gray-50', text: 'text-gray-900', iconBg: 'bg-gray-200' };

    return (
        <div className="premium-card p-6 flex items-center justify-between group hover:border-blue-300">
            <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className={`text-3xl font-bold mt-1 ${colors.text}`}>{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-2 font-medium">{subtext}</p>}
            </div>
            <div className={`p-4 rounded-2xl ${colors.iconBg} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
        </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 animate-pulse">
        <Loader className="animate-spin text-[#1e3a8a]" size={48} />
        <p className="text-gray-400 font-medium">Carregando indicadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      <div className="flex justify-between items-end border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Painel de Controle</h2>
            <p className="text-gray-500 text-sm mt-1">Visão geral da sua comunidade hoje.</p>
        </div>
        <button 
          onClick={loadDashboardData} 
          className="flex items-center px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:text-[#1e3a8a] transition-colors text-sm font-medium shadow-sm"
        >
          <RefreshCw size={16} className="mr-2" />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Membros Ativos" 
          value={activeMembers} 
          icon={<Users size={28} className="text-[#1e3a8a]" />}
          colorClass="blue"
          subtext="Pessoas cadastradas no sistema"
        />
        <StatCard 
          title="Eventos Futuros" 
          value={upcomingEvents.length} 
          icon={<Calendar size={28} className="text-purple-700" />}
          colorClass="purple"
          subtext="Agendados para os próximos dias"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 premium-card p-0 overflow-hidden flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
             <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Calendar className="mr-2 text-[#1e3a8a]" size={20} />
                Agenda Recente
             </h3>
             <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Próximos 5
             </span>
          </div>
          
          <div className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} className="group flex flex-col sm:flex-row items-start p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200">
                    <div className="flex sm:flex-col items-center justify-center bg-[#eff6ff] p-3 rounded-lg border border-blue-100 text-center min-w-[70px] mb-3 sm:mb-0 sm:mr-5">
                      <div className="text-xs font-bold text-blue-600 uppercase">
                        {new Date(event.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                      </div>
                      <div className="text-2xl font-extrabold text-[#1e3a8a] ml-2 sm:ml-0">
                        {new Date(event.dataEvento + 'T00:00:00').getDate()}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#0f172a] text-lg group-hover:text-blue-700 transition-colors truncate">
                        {event.nomeEvento}
                      </h4>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded"><Clock size={14} className="mr-1.5 text-blue-500" /> {event.horario}</span>
                        <span className="flex items-center bg-gray-50 px-2 py-1 rounded"><MapPin size={14} className="mr-1.5 text-blue-500" /> {event.local}</span>
                      </div>
                      {event.descricao && (
                        <p className="text-sm text-gray-400 mt-2 line-clamp-1 italic">{event.descricao}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <Calendar size={48} className="mb-3 opacity-20 text-[#1e3a8a]" />
                <p className="font-medium text-gray-500">Nenhum evento agendado</p>
                <p className="text-xs">Clique em "Eventos" para criar um novo.</p>
              </div>
            )}
          </div>
        </div>

        <div className="premium-card p-0 flex flex-col h-full max-h-[700px]">
          <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-pink-50/50 to-white flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center">
                <Gift size={20} className="mr-2 text-pink-500" />
                Aniversariantes
              </h3>
              <span className="text-xs font-bold bg-pink-100 text-pink-700 px-2.5 py-1 rounded-full border border-pink-200">
                Mês {currentMonth + 1}
              </span>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            
            {birthdaysToday.length > 0 && (
                <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <PartyPopper size={64} className="text-orange-500"/>
                    </div>
                    <h4 className="text-sm font-bold text-orange-700 flex items-center mb-3 relative z-10">
                        <PartyPopper size={16} className="mr-2 animate-bounce" />
                        Hoje é dia de festa! 🎉
                    </h4>
                    <div className="space-y-2 relative z-10">
                        {birthdaysToday.map(m => (
                            <div key={m.id} className="flex items-center bg-white/80 p-2 rounded-xl backdrop-blur-sm shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs mr-2 border border-orange-200">
                                    {m.nome.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-800 truncate">{m.nome}</p>
                                    <p className="text-[10px] text-gray-500">Parabéns!</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">Próximos do Mês</h4>
            {birthdaysThisMonth.length > 0 ? (
              <div className="space-y-3">
                {birthdaysThisMonth.map(m => {
                   const dateStr = m.dataNascimento ? (m.dataNascimento.includes('T') ? m.dataNascimento : `${m.dataNascimento}T00:00:00`) : new Date().toISOString();
                   const day = new Date(dateStr).getDate();
                   const isToday = day === currentDay;
                   
                   return (
                    <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors border group ${isToday ? 'bg-yellow-50 border-yellow-200' : 'hover:bg-pink-50/50 border-transparent hover:border-pink-100'}`}>
                      <div className="flex items-center min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 font-bold text-sm shrink-0 border-2 border-white shadow-sm ${isToday ? 'bg-yellow-200 text-yellow-800' : 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700'}`}>
                          {m.nome.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-800 truncate group-hover:text-pink-700 transition-colors">{m.nome}</p>
                          <p className="text-xs text-gray-500 truncate">{m.ministerio || 'Membro'}</p>
                        </div>
                      </div>
                      <div className={`text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm shrink-0 ${isToday ? 'bg-yellow-400 text-white border-yellow-500' : 'text-pink-600 bg-white border-pink-100'}`}>
                        Dia {day}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Gift size={32} className="opacity-30 text-pink-400" />
                </div>
                <p className="text-sm font-medium">Sem mais aniversários este mês.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;