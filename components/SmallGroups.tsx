import React, { useState, useEffect } from 'react';
import { Home, User, MapPin, Clock, Calendar, Plus, Edit2, Trash2, X, Save, Search } from 'lucide-react';
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

  // Carrega dados ao montar ou trocar de igreja
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
      // Nota: Se o backend de células não existir (404), vai cair aqui.
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId) return;

    try {
      if (editingId) {
        // Update
        const updated = await smallGroupApi.update(churchId, editingId, formData);
        setGroups(prev => prev.map(g => g.id === editingId ? updated : g));
        alert("Célula atualizada com sucesso!");
      } else {
        // Create
        const created = await smallGroupApi.create(churchId, formData);
        setGroups(prev => [...prev, created]);
        alert("Célula cadastrada com sucesso!");
      }
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar os dados. Verifique se o Backend de Células está implementado.");
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Home className="mr-2 text-orange-600" /> Pequenos Grupos / Células
        </h2>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center shadow-sm transition-colors"
        >
          {showForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
          {showForm ? 'Cancelar' : 'Nova Célula'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-lg">
          <h3 className="font-bold mb-4 text-gray-700">{editingId ? 'Editar Célula' : 'Nova Célula'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Célula</label>
                <input 
                  required
                  placeholder="Ex: Célula Morumbi" 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Líder Responsável</label>
                <input 
                  required
                  placeholder="Nome do líder" 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.leaderName}
                  onChange={e => setFormData({...formData, leaderName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anfitrião (Casa)</label>
                <input 
                  placeholder="Nome do anfitrião" 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.hostName}
                  onChange={e => setFormData({...formData, hostName: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dia</label>
                    <select 
                      className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
                      value={formData.dayOfWeek}
                      onChange={e => setFormData({...formData, dayOfWeek: e.target.value})}
                    >
                      {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                    <input 
                      type="time"
                      className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input 
                  placeholder="Rua, número" 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input 
                  placeholder="Bairro" 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  value={formData.neighborhood}
                  onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-2">
               <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
               <button type="submit" className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium flex items-center shadow-md">
                 <Save size={18} className="mr-2" /> Salvar
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Carregando células...</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Home size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhuma célula cadastrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-orange-300 transition-all overflow-hidden group">
              <div className="bg-orange-50 p-4 border-b border-orange-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">{group.name}</h3>
                <span className="text-xs font-bold bg-white text-orange-600 px-2 py-1 rounded border border-orange-100">
                  {group.neighborhood}
                </span>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <User size={16} className="mr-2 text-orange-500" />
                  <span className="font-medium">Líder: {group.leaderName}</span>
                </div>
                {group.hostName && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Home size={16} className="mr-2 text-orange-500" />
                    <span>Anfitrião: {group.hostName}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar size={16} className="mr-2 text-orange-500" />
                  <span>{group.dayOfWeek} às {group.time}</span>
                </div>
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin size={16} className="mr-2 text-orange-500 mt-0.5" />
                  <span>{group.address}</span>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 border-t border-gray-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(group)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(group.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded">
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