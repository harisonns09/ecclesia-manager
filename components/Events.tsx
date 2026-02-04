import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, UserPlus, Loader, AlertCircle } from 'lucide-react';
import { Event } from '../types';
import { eventApi } from '../services/api';

interface EventsProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  isAdmin: boolean;
  churchId?: string;
  onRegisterClick?: (event: Event) => void;
}

const Events: React.FC<EventsProps> = ({ events, setEvents, isAdmin, churchId, onRegisterClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Admin State
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    description: '',
    location: 'Templo Principal',
    price: 0
  });

  // --- Admin Handlers ---
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!churchId) {
      setError("Erro crítico: ID da igreja não identificado. Recarregue a página.");
      return;
    }

    setIsLoading(true);

    try {
      // Preparar payload para o Java
      // O 'price' precisa ser number, e garantimos o churchId/igrejaId
      const eventPayload = { 
        ...newEvent,
        price: Number(newEvent.price), 
        // A API service já injeta o igrejaId, mas passar limpo ajuda
      };

      const createdEvent = await eventApi.create(churchId, eventPayload);

      // Atualiza a lista localmente para parecer instantâneo, mas usando o dado real do server
      const updatedEvents = [...events, createdEvent].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      setEvents(updatedEvents);

      // Reset Form
      setNewEvent({ 
        title: '', 
        date: new Date().toISOString().split('T')[0], 
        time: '19:00', 
        description: '', 
        location: 'Templo Principal', 
        price: 0 
      });
      
    } catch (err) {
      console.error("Erro ao criar evento:", err);
      setError("Falha ao salvar evento. Verifique se todos os campos estão preenchidos corretamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!churchId) return;

    if (window.confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      try {
        setIsLoading(true); // Opcional: mostrar loading global ou no card
        await eventApi.delete(churchId, id);
        setEvents(events.filter(e => e.id !== id));
      } catch (err) {
        console.error("Erro ao excluir:", err);
        alert("Erro ao excluir o evento. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 animate-in fade-in duration-500`}>
      
      {/* Admin: Create Event Form */}
      {isAdmin && (
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Plus size={20} className="mr-2 text-purple-600" />
              Agendar Evento
            </h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Culto da Família"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    value={newEvent.date}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    value={newEvent.time}
                    onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={newEvent.location}
                  onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={newEvent.price}
                  onChange={e => setNewEvent({...newEvent, price: parseFloat(e.target.value)})}
                />
                <p className="text-xs text-gray-400 mt-1">Deixe 0 para eventos gratuitos.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Salvando...
                  </>
                ) : (
                  'Adicionar ao Calendário'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Event List */}
      <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-1 max-w-5xl mx-auto w-full'} space-y-4`}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-800">
            {isAdmin ? 'Gerenciamento de Eventos' : 'Próximos Eventos'}
          </h2>
          {!isAdmin && events.length > 0 && (
             <span className="text-sm text-gray-500">{events.length} evento(s) encontrado(s)</span>
          )}
        </div>
        
        {events.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-gray-300" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhum evento agendado</h3>
            <p className="text-gray-500 mt-1">
              {isAdmin 
                ? 'Utilize o formulário ao lado para criar o primeiro evento.' 
                : 'Fique atento! Em breve teremos novidades aqui.'}
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-purple-300 transition-all hover:shadow-md group">
              <div className="flex-1">
                <div className="flex flex-wrap items-center mb-3 gap-y-2">
                  <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mr-3 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {/* Safe Date Parsing */}
                    {new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mr-4">{event.title}</h3>
                  
                  {(event.price || 0) > 0 ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md text-xs font-bold flex items-center border border-emerald-200">
                      R$ {Number(event.price).toFixed(2)}
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md text-xs font-bold border border-gray-200">
                      Gratuito
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap text-sm text-gray-500 gap-x-6 gap-y-2 mt-2">
                  <span className="flex items-center hover:text-purple-600 transition-colors">
                    <Clock size={16} className="mr-1.5 text-purple-400" /> 
                    {event.time}
                  </span>
                  <span className="flex items-center hover:text-purple-600 transition-colors">
                    <MapPin size={16} className="mr-1.5 text-purple-400" /> 
                    {event.location}
                  </span>
                  {isAdmin && event.registrations && (
                      <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        <UserPlus size={16} className="mr-1.5" /> 
                        {event.registrations.length} inscritos
                      </span>
                  )}
                </div>
                
                {event.description && (
                  <p className="mt-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {event.description}
                  </p>
                )}
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-8 flex items-center flex-shrink-0">
                {isAdmin ? (
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2.5 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                    title="Excluir evento"
                  >
                    <Trash2 size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => onRegisterClick && onRegisterClick(event)}
                    className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition-colors text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center transform hover:-translate-y-0.5"
                  >
                    Inscrever-se
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;