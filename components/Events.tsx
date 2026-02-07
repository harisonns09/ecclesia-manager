import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, Edit2, UserPlus, Loader, Users, Search, X, ArrowRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types'; 
import { eventApi } from '../services/api';

interface EventsProps {
  events: Event[]; 
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>; 
  isAdmin: boolean;
  churchId: string;
  onRegisterClick?: (event: Event) => void;
}

const Events: React.FC<EventsProps> = ({ isAdmin, churchId, onRegisterClick }) => {
  const navigate = useNavigate();
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    if (churchId) {
      loadEvents();
    }
  }, [churchId]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventApi.getByChurch(churchId);
      const sorted = data.sort((a: any, b: any) => 
        new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime()
      );
      setLocalEvents(sorted);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!churchId) return;
    if (confirm('Tem certeza que deseja excluir permanentemente este evento?')) {
      try {
        setIsLoading(true);
        await eventApi.delete(churchId, id);
        setLocalEvents(prev => prev.filter(e => String(e.id) !== id));
      } catch (err) {
        alert("Erro ao excluir evento.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSearchRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
        navigate(`/minha-inscricao/${searchId.trim()}`);
        setIsSearchModalOpen(false);
        setSearchId('');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-[#0f172a]">Consultar Inscrição</h3>
                    <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={24} />
                    </button>
                </div>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                    Digite o número da sua inscrição (recebido por e-mail ou na tela de confirmação) para verificar o status e acessar o pagamento.
                </p>
                <form onSubmit={handleSearchRegistration} className="flex gap-3">
                    <input 
                        type="text" 
                        placeholder="Ex: 12345"
                        className="input-field flex-1 text-center font-mono tracking-wider text-lg"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="btn-primary px-6 !rounded-lg shadow-lg">
                        <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">
            {isAdmin ? 'Gerenciamento de Eventos' : 'Próximos Eventos'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Confira a agenda e participe das atividades.</p>
        </div>
        
        <div className="flex gap-3">
            {isAdmin && (
            <button 
                onClick={() => navigate('/admin/events/new')}
                className="btn-primary shadow-md"
            >
                <Plus size={18} />
                Novo Evento
            </button>
            )}

            {!isAdmin && (
                <button 
                    onClick={() => setIsSearchModalOpen(true)}
                    className="btn-secondary shadow-sm hover:shadow-md"
                >
                    <Search size={18} />
                    Minha Inscrição
                </button>
            )}
        </div>
      </div>

      {isLoading && localEvents.length === 0 ? (
        <div className="flex justify-center py-20"><Loader className="animate-spin text-[#1e3a8a]" size={40} /></div>
      ) : localEvents.length === 0 ? (
        <div className="bg-gray-50 p-16 rounded-2xl border border-dashed border-gray-300 text-center">
          <Calendar className="mx-auto text-gray-300 mb-4 opacity-50" size={48} />
          <h3 className="text-xl font-bold text-gray-800">Nenhum evento agendado</h3>
          <p className="text-gray-500 mt-2">A agenda está livre por enquanto.</p>
          {isAdmin && <p className="text-blue-600 mt-4 text-sm font-semibold cursor-pointer hover:underline" onClick={() => navigate('/admin/events/new')}>Criar o primeiro evento</p>}
        </div>
      ) : (
        <div className="grid gap-6">
          {localEvents.map((event: any) => (
            <div key={event.id} className="premium-card p-0 flex flex-col md:flex-row overflow-hidden group hover:border-blue-300">
              
              <div className="bg-[#eff6ff] md:w-32 flex flex-col items-center justify-center p-6 text-center border-b md:border-b-0 md:border-r border-blue-100 group-hover:bg-blue-50 transition-colors">
                 <span className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">
                    {new Date(event.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' })}
                 </span>
                 <span className="text-4xl font-extrabold text-[#1e3a8a]">
                    {new Date(event.dataEvento + 'T00:00:00').getDate()}
                 </span>
                 <span className="text-xs text-gray-500 mt-2 font-medium">
                    {new Date(event.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short' })}
                 </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-center">
                <div className="flex flex-wrap items-center mb-3 gap-2">
                  {event.ministerioResponsavel && (
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border border-gray-200">
                        {event.ministerioResponsavel}
                      </span>
                  )}
                  
                  {event.preco > 0 ? (
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-100 flex items-center">
                      <DollarSign size={12} className="mr-0.5" />
                      R$ {Number(event.preco).toFixed(2)}
                    </span>
                  ) : (
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold border border-blue-100">Gratuito</span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-[#0f172a] mb-2 group-hover:text-[#1e3a8a] transition-colors">{event.nomeEvento}</h3>
                
                <div className="flex flex-wrap text-sm text-gray-500 gap-x-6 gap-y-2 mb-4">
                  <span className="flex items-center"><Clock size={16} className="mr-2 text-blue-400" /> {event.horario}</span>
                  <span className="flex items-center"><MapPin size={16} className="mr-2 text-blue-400" /> {event.local}</span>
                  {isAdmin && event.inscricoes && (
                      <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-medium">
                        <Users size={14} className="mr-1.5" /> {event.inscricoes.length} inscritos
                      </span>
                  )}
                </div>
                
                {event.descricao && <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{event.descricao}</p>}
              </div>
              
              <div className="p-6 bg-gray-50/50 border-t md:border-t-0 md:border-l border-gray-100 flex items-center justify-end md:justify-center">
                {isAdmin ? (
                  <div className="flex items-center gap-2">
                    <button 
                        onClick={() => navigate(`/admin/events/${event.id}/attendees`)}
                        className="p-2.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:shadow-sm transition-all"
                        title="Ver Inscritos"
                    >
                      <Users size={20} />
                    </button>

                    <button 
                        onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                        className="p-2.5 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#1e3a8a] hover:border-blue-300 transition-all"
                        title="Editar"
                    >
                      <Edit2 size={20} />
                    </button>
                    
                    <button 
                        onClick={() => handleDeleteEvent(String(event.id))} 
                        className="p-2.5 text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-200 transition-all"
                        title="Excluir"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => onRegisterClick && onRegisterClick(event)} className="w-full md:w-auto btn-primary shadow-md hover:shadow-lg">
                    Inscrever-se <ArrowRight size={18} className="ml-1" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        )}     
    </div>
  );
};

export default Events;