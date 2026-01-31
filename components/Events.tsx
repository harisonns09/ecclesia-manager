import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, UserPlus, DollarSign } from 'lucide-react';
import { Event } from '../types';

interface EventsProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  isAdmin: boolean;
  onRegisterClick?: (event: Event) => void;
}

const Events: React.FC<EventsProps> = ({ events, setEvents, isAdmin, onRegisterClick }) => {
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
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Add churchId property (will be populated correctly in App.tsx)
    const event: Event = {
      id: Math.random().toString(36).substr(2, 9),
      churchId: '',
      title: newEvent.title || 'Evento',
      date: newEvent.date || '',
      time: newEvent.time || '',
      description: newEvent.description || '',
      location: newEvent.location || 'Templo Principal',
      price: newEvent.price || 0,
      registrations: []
    };
    const updatedEvents = [...events, event].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setEvents(updatedEvents);
    setNewEvent({ title: '', date: '', time: '19:00', description: '', location: 'Templo Principal', price: 0 });
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  return (
    <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
      
      {/* Admin: Create Event Form */}
      {isAdmin && (
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Plus size={20} className="mr-2 text-purple-600" />
              Agendar Evento
            </h3>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço da Inscrição (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={newEvent.price}
                  onChange={e => setNewEvent({...newEvent, price: parseFloat(e.target.value)})}
                />
                <p className="text-xs text-gray-500 mt-1">Deixe 0 para eventos gratuitos.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Adicionar ao Calendário
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Event List (Public & Admin) */}
      <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-1 max-w-5xl mx-auto w-full'} space-y-4`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {isAdmin ? 'Gerenciamento de Eventos' : 'Próximos Eventos'}
        </h2>
        
        {events.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
            {isAdmin 
              ? 'Nenhum evento agendado. Utilize o formulário para criar um.' 
              : 'Não há eventos programados para os próximos dias.'}
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between hover:border-purple-300 transition-colors group">
              <div className="flex-1">
                <div className="flex items-center mb-2 justify-between md:justify-start">
                  <div className="flex items-center">
                     <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mr-3">
                      {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                  </div>
                  {(event.price || 0) > 0 && (
                    <span className="md:ml-4 bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md text-xs font-bold flex items-center">
                      R$ {event.price?.toFixed(2)}
                    </span>
                  )}
                  {(event.price === 0 || !event.price) && (
                    <span className="md:ml-4 bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold">
                      Gratuito
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap text-sm text-gray-500 gap-4 mt-2">
                  <span className="flex items-center"><Clock size={16} className="mr-1" /> {event.time}</span>
                  <span className="flex items-center"><MapPin size={16} className="mr-1" /> {event.location}</span>
                  {isAdmin && event.registrations && (
                     <span className="flex items-center text-blue-600 bg-blue-50 px-2 rounded-full">
                       <UserPlus size={16} className="mr-1" /> {event.registrations.length} inscritos
                     </span>
                  )}
                </div>
                {event.description && <p className="mt-3 text-gray-600 text-sm leading-relaxed">{event.description}</p>}
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-8 flex items-center flex-shrink-0">
                {isAdmin ? (
                  <button 
                    onClick={() => handleDeleteEvent(event.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-lg hover:bg-red-50"
                    title="Remover evento"
                  >
                    <Trash2 size={20} />
                  </button>
                ) : (
                  <button
                    onClick={() => onRegisterClick && onRegisterClick(event)}
                    className="w-full md:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-bold shadow-md hover:shadow-lg flex items-center justify-center"
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