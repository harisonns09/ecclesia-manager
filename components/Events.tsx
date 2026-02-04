import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, UserPlus, Loader, AlertCircle, Edit2, X } from 'lucide-react';
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
  
  // Estado para controlar se estamos editando um evento (guarda o ID)
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = {
    nomeEvento: '',
    dataEvento: new Date().toISOString().split('T')[0],
    horario: '19:00',
    descricao: '',
    local: 'Templo Principal',
    preco: 0
  };

  // Estado do formulário (usado tanto para criar quanto para editar)
  const [formData, setFormData] = useState<Partial<Event>>(initialFormState);

  // --- Helpers ---
  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setError('');
  };

  const handleEditClick = (event: Event) => {
    setError('');
    setEditingId(event.id);
    setFormData({
      ...event,
      // Garante que a data esteja no formato YYYY-MM-DD para o input HTML
      dataEvento: event.dataEvento ? new Date(event.dataEvento).toISOString().split('T')[0] : '',
      preco: Number(event.preco) || 0
    });
    // Rola a página para o topo do formulário suavemente
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  // --- Handlers de Submissão ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!churchId && !editingId) {
      setError("Erro crítico: ID da igreja não identificado.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.preco), // Garante numérico para o Java
      };

      if (editingId) {
        // --- MODO EDIÇÃO ---
        const updatedEvent = await eventApi.update(churchId, editingId, payload);
        
        // Atualiza a lista substituindo o evento antigo pelo novo
        const updatedList = events.map(ev => ev.id === editingId ? updatedEvent : ev)
          .sort((a, b) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime());
        
        setEvents(updatedList);
        alert("Evento atualizado com sucesso!");
      } else {
        // --- MODO CRIAÇÃO ---
        const createdEvent = await eventApi.create(churchId, payload);
        
        const updatedList = [...events, createdEvent]
          .sort((a, b) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime());
        
        setEvents(updatedList);
        alert("Evento criado com sucesso!");
      }

      resetForm();

    } catch (err) {
      console.error("Erro ao salvar:", err);
      setError("Falha ao salvar. Verifique os dados e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!churchId) return;

    if (window.confirm('Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.')) {
      try {
        setIsLoading(true);
        await eventApi.delete(churchId, id);
        
        // Se estava editando o evento que foi excluído, reseta o form
        if (editingId === id) resetForm();
        
        setEvents(events.filter(e => e.id !== id));
      } catch (err) {
        console.error("Erro ao excluir:", err);
        alert("Erro ao excluir o evento.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 animate-in fade-in duration-500`}>
      
      {/* Formulário (Criar ou Editar) */}
      {isAdmin && (
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-xl border shadow-sm sticky top-6 transition-colors ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold flex items-center ${editingId ? 'text-blue-700' : 'text-gray-800'}`}>
                {editingId ? (
                  <>
                    <Edit2 size={20} className="mr-2" />
                    Editar Evento
                  </>
                ) : (
                  <>
                    <Plus size={20} className="mr-2 text-purple-600" />
                    Agendar Evento
                  </>
                )}
              </h3>
              {editingId && (
                <button onClick={handleCancelEdit} className="text-gray-500 hover:text-red-500" title="Cancelar edição">
                  <X size={20} />
                </button>
              )}
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Culto da Família"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                  value={formData.nomeEvento}
                  onChange={e => setFormData({...formData, nomeEvento: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    value={formData.dataEvento}
                    onChange={e => setFormData({...formData, dataEvento: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input
                    type="time"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    value={formData.horario}
                    onChange={e => setFormData({...formData, horario: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={formData.local}
                  onChange={e => setFormData({...formData, local: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  value={formData.preco}
                  onChange={e => setFormData({...formData, preco: parseFloat(e.target.value)})}
                />
                <p className="text-xs text-gray-400 mt-1">Deixe 0 para eventos gratuitos.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                ></textarea>
              </div>
              
              <div className="flex gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-1/3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-2.5 text-white rounded-lg transition-colors font-medium flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-md ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {isLoading ? (
                    <>
                      <Loader className="animate-spin mr-2" size={18} />
                      {editingId ? 'Salvando...' : 'Criando...'}
                    </>
                  ) : (
                    editingId ? 'Salvar Alterações' : 'Adicionar ao Calendário'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Eventos */}
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
            <div key={event.id} className={`bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between transition-all hover:shadow-md group ${editingId === event.id ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-200 hover:border-purple-300'}`}>
              <div className="flex-1">
                <div className="flex flex-wrap items-center mb-3 gap-y-2">
                  <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mr-3 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {event.dataEvento ? new Date(event.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '--/--'}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mr-4">{event.nomeEvento}</h3>
                  
                  {(event.preco || 0) > 0 ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md text-xs font-bold flex items-center border border-emerald-200">
                      R$ {Number(event.preco).toFixed(2)}
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
                    {event.horario}
                  </span>
                  <span className="flex items-center hover:text-purple-600 transition-colors">
                    <MapPin size={16} className="mr-1.5 text-purple-400" /> 
                    {event.local}
                  </span>
                  {isAdmin && event.inscricoes && (
                      <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        <UserPlus size={16} className="mr-1.5" /> 
                        {event.inscricoes.length} inscritos
                      </span>
                  )}
                </div>
                
                {event.descricao && (
                  <p className="mt-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {event.descricao}
                  </p>
                )}
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-8 flex items-center flex-shrink-0 gap-2">
                {isAdmin ? (
                  <>
                    <button 
                      onClick={() => handleEditClick(event)}
                      className="p-2.5 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100"
                      title="Editar evento"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2.5 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100"
                      title="Excluir evento"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
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