import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, Save, X, User } from 'lucide-react';
import { Ministry, Member } from '../types';
import { ministryApi, memberApi } from '../services/api';

interface MinistriesProps {
  churchId: string;
}

const Ministries: React.FC<MinistriesProps> = ({ churchId }) => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [members, setMembers] = useState<Member[]>([]); // Para selecionar líderes
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado do Formulário
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Ministry>>({ 
    name: '', 
    leaderName: '', 
    description: '' 
  });

  // Carregar dados ao iniciar ou mudar de igreja
  useEffect(() => {
    if (churchId) {
      loadData();
    }
  }, [churchId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Buscamos Ministérios e Membros em paralelo
      const [ministriesData, membersData] = await Promise.all([
        ministryApi.getByChurch(churchId),
        memberApi.getByChurch(churchId)
      ]);
      
      setMinistries(ministriesData);
      setMembers(membersData);
    } catch (error) {
      console.error("Erro ao carregar dados dos ministérios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId) return;

    try {
      if (editingId) {
        // Editar
        const updated = await ministryApi.update(churchId, editingId, formData);
        setMinistries(prev => prev.map(m => m.id === editingId ? updated : m));
        alert("Ministério atualizado!");
      } else {
        // Criar
        const created = await ministryApi.create(churchId, formData as Ministry);
        setMinistries(prev => [...prev, created]);
        alert("Ministério criado!");
      }
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar ministério.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ministério?")) return;
    
    try {
      await ministryApi.delete(churchId, id);
      setMinistries(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir ministério.");
    }
  };

  const startEdit = (ministry: Ministry) => {
    setEditingId(ministry.id);
    setFormData(ministry);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', leaderName: '', description: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Users className="mr-2 text-purple-600" /> Ministérios e Grupos
        </h2>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center shadow-sm transition-colors"
        >
          {showForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
          {showForm ? 'Cancelar' : 'Novo Ministério'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-lg">
           <h3 className="font-bold mb-4 text-gray-700">{editingId ? 'Editar' : 'Cadastrar'} Ministério</h3>
           <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                 <input 
                    placeholder="Ex: Louvor, Infantil, Recepção" 
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Líder Responsável</label>
                 {/* Dropdown se houver membros, senão input texto */}
                 {members.length > 0 ? (
                   <div className="relative">
                     <select 
                       className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none bg-white"
                       value={formData.leaderName}
                       onChange={e => setFormData({...formData, leaderName: e.target.value})}
                     >
                       <option value="">Selecione um líder...</option>
                       {members.map(m => (
                         <option key={m.id} value={m.nome}>{m.nome}</option>
                       ))}
                     </select>
                     <User size={16} className="absolute right-3 top-3 text-gray-400 pointer-events-none" />
                   </div>
                 ) : (
                   <input 
                      placeholder="Nome do líder" 
                      className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
                      value={formData.leaderName} 
                      onChange={e => setFormData({...formData, leaderName: e.target.value})} 
                   />
                 )}
               </div>
             </div>
             
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
               <textarea 
                  placeholder="Objetivo e atividades do ministério..." 
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none resize-none h-24" 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
               />
             </div>

             <div className="flex gap-3 justify-end pt-2">
               <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
               <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium flex items-center shadow-md">
                 <Save size={18} className="mr-2" /> Salvar
               </button>
             </div>
           </form>
        </div>
      )}

      {/* Lista de Ministérios */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">Carregando ministérios...</div>
      ) : ministries.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum ministério cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ministries.map(ministry => (
            <div key={ministry.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-purple-300 transition-all group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800">{ministry.name}</h3>
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                  {ministry.name.charAt(0)}
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 flex items-center mb-1">
                  <User size={14} className="mr-1" />
                  <span className="font-medium text-gray-700">{ministry.leaderName || 'Sem líder definido'}</span>
                </p>
                <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">{ministry.description || 'Sem descrição.'}</p>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4 mt-auto opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => startEdit(ministry)} 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(ministry.id)} 
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

export default Ministries;