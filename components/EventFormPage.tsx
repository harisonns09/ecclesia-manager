import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Save, ArrowLeft, Users, Loader, AlertCircle } from 'lucide-react';
import { eventApi } from '../services/api';

interface EventoBackend {
  nomeEvento: string;
  dataEvento: string;
  horario: string;
  descricao: string;
  local: string;
  preco: number;
  ministerioResponsavel: string;
}

const EventFormPage: React.FC<{ churchId: string }> = ({ churchId }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL se for edição
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const initialFormState: EventoBackend = {
    nomeEvento: '',
    dataEvento: new Date().toISOString().split('T')[0],
    horario: '19:00',
    descricao: '',
    local: 'Templo Principal',
    preco: 0,
    ministerioResponsavel: 'Geral'
  };

  const [formData, setFormData] = useState<EventoBackend>(initialFormState);

  // Se for edição, carrega os dados do evento
  useEffect(() => {
    if (isEditing && churchId) {
      loadEventData();
    }
  }, [id, churchId]);

  const loadEventData = async () => {
    setIsLoading(true);
    try {
      // Reutiliza a busca de todos, ou cria um endpoint getById no api.ts se preferir
      // Aqui vamos buscar a lista e filtrar pelo ID para simplificar, 
      // mas o ideal seria eventApi.getById(churchId, id)
      const allEvents = await eventApi.getByChurch(churchId);
      const eventToEdit = allEvents.find((e: any) => String(e.id) === id);

      if (eventToEdit) {
        setFormData({
          nomeEvento: eventToEdit.nomeEvento,
          dataEvento: eventToEdit.dataEvento ? eventToEdit.dataEvento.split('T')[0] : '',
          horario: eventToEdit.horario,
          descricao: eventToEdit.descricao || '',
          local: eventToEdit.local,
          preco: Number(eventToEdit.preco) || 0,
          ministerioResponsavel: eventToEdit.ministerioResponsavel || 'Geral'
        });
      } else {
        setError("Evento não encontrado.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados do evento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.ministerioResponsavel.trim()) {
       setError("O campo Ministério Responsável é obrigatório.");
       return;
    }

    setIsLoading(true);

    try {
      const payload = { ...formData, preco: Number(formData.preco) };

      if (isEditing && id) {
        await eventApi.update(churchId, id, payload as any);
        alert("Evento atualizado com sucesso!");
      } else {
        await eventApi.create(churchId, payload as any);
        alert("Evento criado com sucesso!");
      }

      navigate('/admin/events'); // Volta para a lista
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      const msg = err.response?.data?.message || "Erro ao salvar evento.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/admin/events')} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Editar Evento' : 'Novo Evento'}
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-100">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento</label>
              <input
                type="text" required placeholder="Ex: Culto de Jovens"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                value={formData.nomeEvento}
                onChange={e => setFormData({...formData, nomeEvento: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ministério Responsável</label>
              <div className="relative">
                <input
                  type="text" required placeholder="Ex: Geral, Jovens, Infantil"
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                  value={formData.ministerioResponsavel}
                  onChange={e => setFormData({...formData, ministerioResponsavel: e.target.value})}
                />
                <Users size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <div className="relative">
                    <input
                        type="date" required
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.dataEvento}
                        onChange={e => setFormData({...formData, dataEvento: e.target.value})}
                    />
                    <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <div className="relative">
                    <input
                        type="time" required
                        className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.horario}
                        onChange={e => setFormData({...formData, horario: e.target.value})}
                    />
                    <Clock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                    <div className="relative">
                        <input
                            type="text"
                            className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.local}
                            onChange={e => setFormData({...formData, local: e.target.value})}
                        />
                        <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                    <input
                        type="number" min="0" step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.preco}
                        onChange={e => setFormData({...formData, preco: parseFloat(e.target.value)})}
                    />
                </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
              <textarea
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                value={formData.descricao}
                onChange={e => setFormData({...formData, descricao: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg flex items-center disabled:opacity-70"
            >
              {isLoading ? <Loader className="animate-spin mr-2" size={20} /> : <Save className="mr-2" size={20} />}
              {isEditing ? 'Salvar Alterações' : 'Criar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;