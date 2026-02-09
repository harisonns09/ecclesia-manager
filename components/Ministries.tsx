import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Edit2, X, User, Save, CheckCircle, XCircle } from 'lucide-react';
import { Ministry, Member } from '../types';
import { ministryApi, memberApi } from '../services/api';

interface MinistriesProps {
  churchId: string;
}

const Ministries: React.FC<MinistriesProps> = ({ churchId }) => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [members, setMembers] = useState<Member[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado do Formulário
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Ministry>>({ 
    id: '',
    nome: '', 
    igrejaId: churchId,
    liderResponsavel: '',
  });

  // Estado do Modal de Feedback (Sucesso/Erro)
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (churchId) {
      loadData();
    }
  }, [churchId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
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

  const showFeedback = (message: string, error = false) => {
    setModalMessage(message);
    setIsError(error);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId) return;

    try {
      if (editingId) {
        const updated = await ministryApi.update(churchId, editingId, formData);
        setMinistries(prev => prev.map(m => m.id === editingId ? updated : m));
        showFeedback("Ministério atualizado com sucesso!", false);
      } else {
        const created = await ministryApi.create(churchId, formData as Ministry);
        setMinistries(prev => [...prev, created]);
        showFeedback("Ministério criado com sucesso!", false);
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      showFeedback("Erro ao salvar ministério. Tente novamente.", true);
    }
  };

  // Função chamada ao clicar em OK no Modal
  const handleCloseModal = () => {
    setShowModal(false);
    if (!isError) {
        // Só reseta e fecha o form se for sucesso
        resetForm(); 
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este ministério?")) return;
    try {
      await ministryApi.delete(churchId, id);
      setMinistries(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      showFeedback("Erro ao excluir ministério.", true);
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
    setFormData({ nome: '', liderResponsavel: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* --- MODAL DE FEEDBACK (SUCESSO OU ERRO) --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 border border-gray-100">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isError ? 'bg-red-100' : 'bg-emerald-100'}`}>
              {isError ? (
                  <XCircle size={32} className="text-red-600" />
              ) : (
                  <CheckCircle size={32} className="text-emerald-600" />
              )}
            </div>
            
            <h3 className={`text-xl font-bold mb-2 ${isError ? 'text-red-700' : 'text-[#0f172a]'}`}>
                {isError ? 'Erro!' : 'Sucesso!'}
            </h3>
            <p className="text-gray-500 mb-8">{modalMessage}</p>
            
            <button 
              onClick={handleCloseModal}
              className={`w-full py-3 text-lg shadow-lg rounded-xl font-bold text-white transition-all ${isError ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1e3a8a] hover:bg-[#172554]'}`}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Ministérios</h2>
            <p className="text-gray-500 text-sm mt-1">Organize os grupos e equipes da igreja.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          className={showForm ? "btn-secondary" : "btn-primary shadow-lg"}
        >
          {showForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
          {showForm ? 'Cancelar' : 'Novo Ministério'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="premium-card p-0 overflow-hidden mb-8 animate-in slide-in-from-top-4">
           <div className="bg-gray-50/50 p-6 border-b border-gray-100">
              <h3 className="font-bold text-[#0f172a] text-lg">{editingId ? 'Editar Ministério' : 'Novo Ministério'}</h3>
           </div>
           
           <form onSubmit={handleSubmit} className="p-6 space-y-5">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome</label>
                 <input 
                   placeholder="Ex: Louvor, Infantil, Recepção" 
                   className="input-field" 
                   value={formData.nome} 
                   onChange={e => setFormData({...formData, nome: e.target.value})} 
                   required 
                 />
               </div>
               <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Líder Responsável</label>
                 {members.length > 0 ? (
                   <div className="relative">
                     <select 
                       className="input-field appearance-none bg-white pr-10"
                       value={formData.liderResponsavel}
                       onChange={e => setFormData({...formData, liderResponsavel: e.target.value})}
                     >
                       <option value="">Selecione um líder...</option>
                       {members.map(m => (
                         <option key={m.id} value={m.nome}>{m.nome}</option>
                       ))}
                     </select>
                     <User size={18} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" />
                   </div>
                 ) : (
                   <input 
                     placeholder="Nome do líder" 
                     className="input-field" 
                     value={formData.liderResponsavel} 
                     onChange={e => setFormData({...formData, liderResponsavel: e.target.value})} 
                   />
                 )}
               </div>
             </div>
             
             <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 mt-2">
               <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
               <button type="submit" className="btn-primary shadow-md">
                 <Save size={18} className="mr-2" /> Salvar
               </button>
             </div>
           </form>
        </div>
      )}

      {/* Lista de Ministérios */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Carregando ministérios...</div>
      ) : ministries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Nenhum ministério cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ministries.map(ministry => (
            <div key={ministry.id} className="premium-card p-6 hover:border-[#1e3a8a]/30 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-[#0f172a] line-clamp-1">{ministry.nome}</h3>
                <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center text-[#1e3a8a] font-bold text-sm border border-blue-100 shadow-sm">
                  {ministry.nome.charAt(0)}
                </div>
              </div>
              
              <div className="mb-6 flex-1">
                <div className="flex items-center mb-3 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <User size={16} className="mr-2 text-[#1e3a8a]" />
                  <span className="font-semibold text-gray-800 mr-1">Líder:</span>
                  <span className="truncate">{ministry.liderResponsavel || 'Não definido'}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity mt-auto">
                <button 
                  onClick={() => startEdit(ministry)} 
                  className="p-2 text-gray-400 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(ministry.id)} 
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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