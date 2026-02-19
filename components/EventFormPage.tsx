import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock, MapPin, Save, ArrowLeft, Users, Loader, AlertCircle, DollarSign } from 'lucide-react';
import { eventApi } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

interface EventoBackend {
  nomeEvento: string;
  dataEvento: string;
  horario: string;
  descricao: string;
  local: string;
  preco: number;
  ministerioResponsavel: string;
}

const EventFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const { currentChurch: church } = useApp();

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

  useEffect(() => {
    if (isEditing && church) {
      loadEventData();
    }
  }, [id, church]);

  const loadEventData = async () => {
    if (!church) return;
    setIsLoading(true);
    try {
      const allEvents = await eventApi.getByChurch(church.id);
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
        toast.error("Evento não encontrado.");
        navigate('/admin/events');
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados do evento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!church) return;
    
    setError('');

    if (!formData.ministerioResponsavel.trim()) {
       setError("O campo Ministério Responsável é obrigatório.");
       return;
    }

    setIsLoading(true);
    const toastId = toast.loading(isEditing ? "Atualizando evento..." : "Criando evento...");

    try {
      const payload = { ...formData, preco: Number(formData.preco) };

      if (isEditing && id) {
        await eventApi.update(church.id, id, payload as any);
        toast.success("Evento atualizado com sucesso!", { id: toastId });
      } else {
        await eventApi.create(church.id, payload as any);
        toast.success("Evento criado com sucesso!", { id: toastId });
      }

      navigate('/admin/events');
    } catch (err: any) {
      console.error("Erro ao salvar:", err);
      const msg = err.response?.data?.message || "Erro ao salvar evento.";
      setError(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  if (!church) return null;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => navigate('/admin/events')} className="mr-4 p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-[#1e3a8a]">
          <ArrowLeft size={24} />
        </button>
        <div>
            <h1 className="text-2xl font-bold text-[#0f172a]">
            {isEditing ? 'Editar Evento' : 'Novo Evento'}
            </h1>
            <p className="text-gray-500 text-sm">Preencha as informações do evento abaixo.</p>
        </div>
      </div>

      {/* Cartão do Formulário */}
      <div className="premium-card p-8">
        {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-100">
            <AlertCircle size={20} className="mr-3 flex-shrink-0" />
            {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Título do Evento</label>
            <input
              type="text" required placeholder="Ex: Culto de Jovens"
              className="input-field"
              value={formData.nomeEvento}
              onChange={e => setFormData({...formData, nomeEvento: e.target.value})}
            />
          </div>

          {/* Ministério */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ministério Responsável</label>
            <div className="relative">
              <input
                type="text" required placeholder="Ex: Geral, Jovens, Infantil"
                className="input-field !pl-10"
                value={formData.ministerioResponsavel}
                onChange={e => setFormData({...formData, ministerioResponsavel: e.target.value})}
              />
              <Users size={18} className="absolute left-3 top-3.5 text-gray-400" />
            </div>
          </div>

          {/* Grid: Data e Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data</label>
              <div className="relative">
                  <input
                      type="date" required
                      className="input-field !pl-10"
                      value={formData.dataEvento}
                      onChange={e => setFormData({...formData, dataEvento: e.target.value})}
                  />
                  <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hora</label>
              <div className="relative">
                  <input
                      type="time" required
                      className="input-field !pl-10"
                      value={formData.horario}
                      onChange={e => setFormData({...formData, horario: e.target.value})}
                  />
                  <Clock size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Grid: Local e Preço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Local</label>
                  <div className="relative">
                      <input
                          type="text"
                          className="input-field !pl-10"
                          value={formData.local}
                          onChange={e => setFormData({...formData, local: e.target.value})}
                      />
                      <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor (R$)</label>
                  <div className="relative">
                    <input
                        type="number" min="0" step="0.01"
                        className="input-field !pl-10"
                        value={formData.preco}
                        onChange={e => setFormData({...formData, preco: parseFloat(e.target.value)})}
                    />
                    <DollarSign size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
              </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição Detalhada</label>
            <textarea
              rows={4}
              className="input-field resize-none"
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
              placeholder="Descreva os detalhes do evento..."
            ></textarea>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary shadow-lg"
            >
              {isLoading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
              <span>{isEditing ? 'Salvar Alterações' : 'Criar Evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;