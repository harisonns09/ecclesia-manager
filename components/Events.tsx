import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, UserPlus, Loader, AlertCircle, Edit2, X } from 'lucide-react';
import { Event } from '../types'; // Certifique-se que types.ts tenha os campos opcionais ou use any/interface local se necessário
import { eventApi } from '../services/api';

// Interface local para bater com o DTO do Java (Português)
// Isso garante que o JSON enviado seja lido corretamente pelo Spring Boot
interface EventoBackend {
  id?: string;
  nomeEvento: string;
  dataEvento: string; // YYYY-MM-DD
  horario: string;
  descricao: string;
  local: string;
  preco: number;
  inscricoes?: any[];
}

interface EventsProps {
  events: Event[]; // Mantendo compatibilidade com a prop herdada, mas gerenciaremos o estado interno
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>; // Dummy se usarmos estado interno
  isAdmin: boolean;
  churchId: string;
  onRegisterClick?: (event: Event) => void;
}

const Events: React.FC<EventsProps> = ({ isAdmin, churchId, onRegisterClick }) => {
  // Estado local para eventos (já que o Dashboard carrega apenas resumo, aqui carregamos tudo)
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado de Edição
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado do Formulário (Campos em Português para o Java)
  const initialFormState: EventoBackend = {
    nomeEvento: '',
    dataEvento: new Date().toISOString().split('T')[0],
    horario: '19:00',
    descricao: '',
    local: 'Templo Principal',
    preco: 0
  };

  const [formData, setFormData] = useState<EventoBackend>(initialFormState);

  // --- 1. Carregar Eventos ao Iniciar ---
  useEffect(() => {
    if (churchId) {
      loadEvents();
    }
  }, [churchId]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventApi.getByChurch(churchId);
      // Ordenar por data
      const sorted = data.sort((a: any, b: any) => 
        new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime()
      );
      setLocalEvents(sorted);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
      // Não bloqueamos a tela, apenas logamos
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. Helpers de Formulário ---
  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setError('');
  };

  const handleEditClick = (event: any) => {
    setError('');
    // Garante ID como string
    const eventId = String(event.id);
    setEditingId(eventId);

    setFormData({
      nomeEvento: event.nomeEvento,
      dataEvento: event.dataEvento ? event.dataEvento.split('T')[0] : '', // Trata data
      horario: event.horario,
      descricao: event.descricao || '',
      local: event.local,
      preco: Number(event.preco) || 0
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- 3. Enviar Dados (Create / Update) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!churchId) {
      setError("Erro: Nenhuma igreja selecionada.");
      return;
    }

    setIsLoading(true);

    try {
      // Payload pronto para o Java
      const payload = {
        ...formData,
        preco: Number(formData.preco), // Garante Double no Java
        // A API (api.ts) já injeta o igrejaId: Number(churchId)
      };

      if (editingId) {
        // UPDATE
        const updatedEvent = await eventApi.update(churchId, editingId, payload as any);
        
        setLocalEvents(prev => prev.map(ev => String(ev.id) === editingId ? updatedEvent : ev)
          .sort((a: any, b: any) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime()));
        
        alert("Evento atualizado!");
      } else {
        // CREATE
        const createdEvent = await eventApi.create(churchId, payload as any);
        
        setLocalEvents(prev => [...prev, createdEvent]
          .sort((a: any, b: any) => new Date(a.dataEvento).getTime() - new Date(b.dataEvento).getTime()));
        
        alert("Evento criado!");
      }

      resetForm();

    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      const msg = err.response?.data?.message || "Erro ao salvar evento. Verifique os campos.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 4. Deletar Evento ---
  const handleDeleteEvent = async (id: string) => {
    if (!churchId) return;

    if (confirm('Tem certeza que deseja excluir?')) {
      try {
        setIsLoading(true);
        await eventApi.delete(churchId, id);
        
        if (editingId === id) resetForm();
        setLocalEvents(prev => prev.filter(e => String(e.id) !== id));
      } catch (err) {
        alert("Erro ao excluir evento.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6 animate-in fade-in duration-500`}>
      
      {/* Formulário (Apenas Admin) */}
      {isAdmin && (
        <div className="lg:col-span-1">
          <div className={`p-6 rounded-xl border shadow-sm sticky top-6 transition-colors ${editingId ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-xl font-bold flex items-center ${editingId ? 'text-blue-700' : 'text-gray-800'}`}>
                {editingId ? (
                  <> <Edit2 size={20} className="mr-2" /> Editar Evento </>
                ) : (
                  <> <Plus size={20} className="mr-2 text-purple-600" /> Novo Evento </>
                )}
              </h3>
              {editingId && (
                <button onClick={resetForm} className="text-gray-500 hover:text-red-500"><X size={20} /></button>
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
                  type="text" required placeholder="Ex: Culto de Jovens"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.nomeEvento}
                  onChange={e => setFormData({...formData, nomeEvento: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input
                    type="date" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.dataEvento}
                    onChange={e => setFormData({...formData, dataEvento: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input
                    type="time" required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={formData.horario}
                    onChange={e => setFormData({...formData, horario: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.local}
                  onChange={e => setFormData({...formData, local: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="number" min="0" step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={formData.preco}
                  onChange={e => setFormData({...formData, preco: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                ></textarea>
              </div>
              
              <div className="flex gap-2">
                {editingId && (
                  <button type="button" onClick={resetForm} className="w-1/3 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancelar</button>
                )}
                <button
                  type="submit" disabled={isLoading}
                  className={`flex-1 py-2.5 text-white rounded-lg font-medium flex items-center justify-center disabled:opacity-70 ${editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'}`}
                >
                  {isLoading ? <Loader className="animate-spin" size={18} /> : (editingId ? 'Salvar' : 'Adicionar')}
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
          {!isAdmin && <span className="text-sm text-gray-500">{localEvents.length} encontrados</span>}
        </div>
        
        {localEvents.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={32} />
            <h3 className="text-lg font-medium text-gray-900">Nenhum evento agendado</h3>
            <p className="text-gray-500 mt-1">Carregando ou lista vazia.</p>
          </div>
        ) : (
          localEvents.map((event: any) => (
            <div key={event.id} className={`bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between transition-all hover:shadow-md group ${editingId === String(event.id) ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-200 hover:border-purple-300'}`}>
              <div className="flex-1">
                <div className="flex flex-wrap items-center mb-3 gap-y-2">
                  <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mr-3 flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {new Date(event.dataEvento + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mr-4">{event.nomeEvento}</h3>
                  
                  {event.preco > 0 ? (
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md text-xs font-bold border border-emerald-200">
                      R$ {Number(event.preco).toFixed(2)}
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md text-xs font-bold border border-gray-200">Gratuito</span>
                  )}
                </div>

                <div className="flex flex-wrap text-sm text-gray-500 gap-x-6 gap-y-2 mt-2">
                  <span className="flex items-center"><Clock size={16} className="mr-1.5 text-purple-400" /> {event.horario}</span>
                  <span className="flex items-center"><MapPin size={16} className="mr-1.5 text-purple-400" /> {event.local}</span>
                  {isAdmin && event.inscricoes && (
                      <span className="flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        <UserPlus size={16} className="mr-1.5" /> {event.inscricoes.length} inscritos
                      </span>
                  )}
                </div>
                {event.descricao && <p className="mt-4 text-gray-600 text-sm border-t border-gray-100 pt-3">{event.descricao}</p>}
              </div>
              
              <div className="mt-6 md:mt-0 md:ml-8 flex items-center flex-shrink-0 gap-2">
                {isAdmin ? (
                  <>
                    <button onClick={() => handleEditClick(event)} className="p-2.5 text-gray-400 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => handleDeleteEvent(String(event.id))} className="p-2.5 text-gray-400 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg">
                      <Trash2 size={20} />
                    </button>
                  </>
                ) : (
                  <button onClick={() => onRegisterClick && onRegisterClick(event)} className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold shadow-md">
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