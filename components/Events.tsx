import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, Edit2, UserPlus, Loader, Users, Search, X, ArrowRight } from 'lucide-react';
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

  // Estados para o Modal de Busca de Inscrição
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
        // Redireciona para a página de status pública
        navigate(`/minha-inscricao/${searchId.trim()}`);
        setIsSearchModalOpen(false);
        setSearchId('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* MODAL DE BUSCA (Apenas Público) */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Consultar Inscrição</h3>
                    <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                <p className="text-gray-500 text-sm mb-4">
                    Digite o seu cpf para verificar o status e acessar o pagamento.
                </p>
                <form onSubmit={handleSearchRegistration} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Ex: 12345"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center">
                        <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {isAdmin ? 'Gerenciamento de Eventos' : 'Próximos Eventos'}
        </h2>
        
        <div className="flex gap-3">
            {/* Botão para Admin: Criar Evento */}
            {isAdmin && (
            <button 
                onClick={() => navigate('/admin/events/new')}
                className="flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-all"
            >
                <Plus size={20} className="mr-2" />
                Novo Evento
            </button>
            )}

            {/* Botão para Público: Consultar Inscrição */}
            {!isAdmin && (
                <button 
                    onClick={() => setIsSearchModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2.5 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 font-medium shadow-sm transition-all"
                >
                    <Search size={18} className="mr-2" />
                    Minha Inscrição
                </button>
            )}
        </div>
      </div>

      {/* Lista */}
      {isLoading && localEvents.length === 0 ? (
        <div className="flex justify-center py-12"><Loader className="animate-spin text-blue-600" size={32} /></div>
      ) : localEvents.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
          <Calendar className="mx-auto text-gray-300 mb-4" size={40} />
          <h3 className="text-lg font-medium text-gray-900">Nenhum evento agendado</h3>
          {isAdmin && <p className="text-gray-500 mt-1">Clique em "Novo Evento" para começar.</p>}
        </div>
      ) : (
        <div className="grid gap-4">
          {localEvents.map((event: any) => (
            <div key={event.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between group">
              <div className="flex-1">
                <div className="flex flex-wrap items-center mb-3 gap-y-2">
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mr-3 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {new Date(event.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </div>
                  
                  {event.ministerioResponsavel && (
                      <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-semibold mr-3 border border-gray-200">
                        {event.ministerioResponsavel}
                      </div>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 mr-4">{event.nomeEvento}</h3>
                  
                  {event.preco > 0 ? (
                    <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md text-xs font-bold border border-emerald-100">
                      R$ {Number(event.preco).toFixed(2)}
                    </span>
                  ) : (
                    <span className="bg-gray-50 text-gray-600 px-2.5 py-0.5 rounded-md text-xs font-bold border border-gray-200">Gratuito</span>
                  )}
                </div>

                <div className="flex flex-wrap text-sm text-gray-500 gap-x-6 gap-y-2 mt-2">
                  <span className="flex items-center"><Clock size={16} className="mr-1.5 text-blue-400" /> {event.horario}</span>
                  <span className="flex items-center"><MapPin size={16} className="mr-1.5 text-blue-400" /> {event.local}</span>
                  {isAdmin && event.inscricoes && (
                      <span className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        <UserPlus size={16} className="mr-1.5" /> {event.inscricoes.length} inscritos
                      </span>
                  )}
                </div>
                {event.descricao && <p className="mt-4 text-gray-600 text-sm border-t border-gray-100 pt-3 line-clamp-2">{event.descricao}</p>}
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-8 flex items-center flex-shrink-0 gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                {isAdmin ? (
                  <>
                    <button 
                        onClick={() => navigate(`/admin/events/${event.id}/attendees`)}
                        className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 flex items-center transition-colors"
                        title="Ver Inscritos"
                    >
                      <Users size={16} className="mr-2" /> Inscritos
                    </button>

                    <button 
                        onClick={() => navigate(`/admin/events/edit/${event.id}`)}
                        className="p-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        title="Editar"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                        onClick={() => handleDeleteEvent(String(event.id))} 
                        className="p-2 text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        title="Excluir"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => onRegisterClick && onRegisterClick(event)} className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-sm">
                    Inscrever-se
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