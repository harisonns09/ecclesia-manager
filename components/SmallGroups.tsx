import React, { useState, useEffect } from 'react';
import { Home, User, MapPin, Clock, Calendar, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import { SmallGroup } from '../types';
import { smallGroupApi } from '../services/api';

interface SmallGroupsProps {
  churchId: string;
}

const SmallGroups: React.FC<SmallGroupsProps> = ({ churchId }) => {
  const [groups, setGroups] = useState<SmallGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estado do Formulário
  const initialFormState = {
    name: '',
    leaderName: '',
    hostName: '',
    address: '',
    neighborhood: '',
    dayOfWeek: 'Quarta-feira',
    time: '20:00'
  };
  const [formData, setFormData] = useState<Partial<SmallGroup>>(initialFormState);

  useEffect(() => {
    if (churchId) {
      loadGroups();
    }
  }, [churchId]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const data = await smallGroupApi.getByChurch(churchId);
      setGroups(data);
    } catch (error) {
      console.error("Erro ao carregar células:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId) return;

    try {
      if (editingId) {
        const updated = await smallGroupApi.update(churchId, editingId, formData);
        setGroups(prev => prev.map(g => g.id === editingId ? updated : g));
      } else {
        const created = await smallGroupApi.create(churchId, formData);
        setGroups(prev => [...prev, created]);
      }
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar os dados.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta célula?")) return;
    try {
      await smallGroupApi.delete(churchId, id);
      setGroups(prev => prev.filter(g => g.id !== id));
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir célula.");
    }
  };

  const startEdit = (group: SmallGroup) => {
    setEditingId(group.id);
    setFormData(group);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowForm(false);
  };

  const daysOfWeek = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Pequenos Grupos</h2>
            <p className="text-gray-500 text-sm mt-1">Gestão de células e grupos familiares.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          className={showForm ? "btn-secondary" : "btn-primary shadow-lg"}
        >
          {showForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
          {showForm ? 'Cancelar' : 'Nova Célula'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="premium-card p-0 overflow-hidden mb-8 animate-in slide-in-from-top-4">
          <div className="bg-gray-50/50 p-6 border-b border-gray-100">
             <h3 className="font-bold text-[#0f172a] text-lg">{editingId ? 'Editar Célula' : 'Nova Célula'}</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome da Célula</label>
                <div className="relative">
                    <input 
                        required placeholder="Ex: Célula Morumbi" 
                        className="input-field pl-10"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <Home size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Líder Responsável</label>
                <div className="relative">
                    <input 
                        required placeholder="Nome do líder" 
                        className="input-field pl-10"
                        value={formData.leaderName} onChange={e => setFormData({...formData, leaderName: e.target.value})}
                    />
                    <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Anfitrião (Casa)</label>
                <div className="relative">
                    <input 
                        placeholder="Nome do anfitrião" 
                        className="input-field pl-10"
                        value={formData.hostName} onChange={e => setFormData({...formData, hostName: e.target.value})}
                    />
                    <Home size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dia</label>
                   <div className="relative">
                       <select 
                         className="input-field appearance-none bg-white pl-10"
                         value={formData.dayOfWeek} onChange={e => setFormData({...formData, dayOfWeek: e.target.value})}
                       >
                         {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                       </select>
                       <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400 pointer-events-none" />
                   </div>
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Horário</label>
                   <div className="relative">
                       <input 
                         type="time"
                         className="input-field pl-10"
                         value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                       />
                       <Clock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                   </div>
                 </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Endereço</label>
                    <div className="relative">
                        <input 
                            placeholder="Rua, número" 
                            className="input-field pl-10"
                            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                        <MapPin size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bairro</label>
                    <input 
                        placeholder="Bairro" 
                        className="input-field"
                        value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                    />
                  </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-2">
               <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
               <button type="submit" className="btn-primary shadow-md">
                 <Save size={18} className="mr-2" /> Salvar
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Carregando células...</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Home size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma célula cadastrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} className="premium-card hover:border-orange-300 group flex flex-col h-full overflow-hidden">
              <div className="bg-orange-50/50 p-5 border-b border-orange-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">{group.name}</h3>
                <span className="text-[10px] font-bold bg-white text-orange-600 px-2 py-1 rounded border border-orange-100 uppercase tracking-wide">
                  {group.neighborhood}
                </span>
              </div>
              
              <div className="p-5 flex-1 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <User size={16} className="mr-2.5 text-orange-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900 mr-1">Líder:</span> {group.leaderName}
                </div>
                {group.hostName && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Home size={16} className="mr-2.5 text-orange-500 flex-shrink-0" />
                    <span className="font-medium text-gray-900 mr-1">Anfitrião:</span> {group.hostName}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-2.5 text-orange-500 flex-shrink-0" />
                  <span>{group.dayOfWeek} às <strong>{group.time}</strong></span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin size={16} className="mr-2.5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{group.address}</span>
                </div>
              </div>

              <div className="bg-gray-50/50 px-5 py-3 border-t border-gray-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                <button 
                  onClick={() => startEdit(group)} 
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(group.id)} 
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmallGroups;