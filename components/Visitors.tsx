import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Plus, Edit2, Trash2, Save, Search, HeartHandshake, CheckCircle, XCircle, X } from 'lucide-react';
import { Visitor, VisitorStatus } from '../types';
import { visitorApi } from '../services/api';

interface VisitorsProps {
  churchId: string;
}

const Visitors: React.FC<VisitorsProps> = ({ churchId }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal de Feedback
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const initialFormState: Partial<Visitor> = {
    nome: '',
    telefone: '',
    dataVisita: new Date().toISOString().split('T')[0],
    dataAniversario: '',
    status: 'Visitante',
    observacao: ''
  };

  const [formData, setFormData] = useState<Partial<Visitor>>(initialFormState);

  useEffect(() => {
    if (churchId) loadVisitors();
  }, [churchId]);

  const loadVisitors = async () => {
    setIsLoading(true);
    try {
      const data = await visitorApi.getByChurch(churchId);
      // Garante que data é um array para evitar quebra do .map ou .filter
      setVisitors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar visitantes:", error);
      setVisitors([]); // Garante estado limpo em caso de erro
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
        const updated = await visitorApi.update(churchId, editingId, formData);
        setVisitors(prev => prev.map(v => v.id === editingId ? updated : v));
        showFeedback("Visitante atualizado com sucesso!");
      } else {
        const created = await visitorApi.create(churchId, formData);
        setVisitors(prev => [created, ...prev]);
        showFeedback("Visitante cadastrado com sucesso!");
      }
    } catch (error) {
      // Fallback para simulação local se não houver backend
      if (editingId) {
         setVisitors(prev => prev.map(v => v.id === editingId ? { ...v, ...formData } as Visitor : v));
      } else {
         const mockNew = { ...formData, id: Math.random().toString(), churchId } as Visitor;
         setVisitors(prev => [mockNew, ...prev]);
      }
      showFeedback("Salvo (Simulação local)!", false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este visitante?")) return;
    try {
      await visitorApi.delete(churchId, id);
      setVisitors(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      setVisitors(prev => prev.filter(v => v.id !== id)); // Simulação
      showFeedback("Visitante removido.", false);
    }
  };

  const startEdit = (visitor: Visitor) => {
    setEditingId(visitor.id);
    // Garante que o formData receba strings vazias se os campos vierem nulos
    setFormData({
        nome: visitor.nome || '',
        telefone: visitor.telefone || '',
        dataVisita: visitor.dataVisita ? visitor.dataVisita.split('T')[0] : '',
        dataAniversario: visitor.dataAniversario || '',
        status: visitor.status || 'Visitante',
        observacao: visitor.observacao || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setShowForm(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (!isError) resetForm();
  };

  // --- FILTRO SEGURO ---
  // Evita crash se v.nome ou v.telefone forem undefined/null
  const filteredVisitors = visitors.filter(v => {
    const nome = v.nome ? v.nome.toLowerCase() : '';
    const telefone = v.telefone ? v.telefone : '';
    const search = searchTerm.toLowerCase();
    
    return nome.includes(search) || telefone.includes(search);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Modal Feedback */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 border border-gray-100">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isError ? 'bg-red-100' : 'bg-emerald-100'}`}>
              {isError ? <XCircle size={32} className="text-red-600" /> : <CheckCircle size={32} className="text-emerald-600" />}
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isError ? 'text-red-700' : 'text-[#0f172a]'}`}>
                {isError ? 'Erro!' : 'Sucesso!'}
            </h3>
            <p className="text-gray-500 mb-8">{modalMessage}</p>
            <button onClick={handleCloseModal} className={`w-full py-3 text-lg shadow-lg rounded-xl font-bold text-white transition-all ${isError ? 'bg-red-600 hover:bg-red-700' : 'bg-[#1e3a8a] hover:bg-[#172554]'}`}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                <HeartHandshake className="text-pink-600" size={28} /> Gestão de Visitantes
            </h2>
            <p className="text-gray-500 text-sm mt-1">Acolhimento e consolidação de novas vidas.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }} 
          className={showForm ? "btn-secondary" : "btn-primary shadow-lg"}
        >
          {showForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
          {showForm ? 'Cancelar' : 'Novo Visitante'}
        </button>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="premium-card p-0 overflow-hidden mb-8 animate-in slide-in-from-top-4">
          <div className="bg-gray-50/50 p-6 border-b border-gray-100">
             <h3 className="font-bold text-[#0f172a] text-lg">{editingId ? 'Editar Visitante' : 'Ficha de Visitante'}</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome Completo</label>
                <div className="relative">
                    <input required className="input-field pl-10" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome do visitante" />
                    <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">WhatsApp / Telefone</label>
                <div className="relative">
                    <input required className="input-field pl-10" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} placeholder="(00) 00000-0000" />
                    <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data da Visita</label>
                <div className="relative">
                    <input type="date" required className="input-field pl-10" value={formData.dataVisita} onChange={e => setFormData({...formData, dataVisita: e.target.value})} />
                    <Calendar size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                 <select className="input-field bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as VisitorStatus})}>
                    <option value="Visitante">Visitante (1ª vez)</option>
                    <option value="Em Acompanhamento">Em Acompanhamento</option>
                    <option value="Membro">Tornou-se Membro</option>
                 </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data de Nascimento</label>
                <input type="date" className="input-field" value={formData.dataAniversario} onChange={e => setFormData({...formData, dataAniversario: e.target.value})} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Observações (Como conheceu, pedidos, etc)</label>
                <textarea rows={3} className="input-field resize-none" placeholder="Ex: Veio a convite do João. Pediu oração pela família." value={formData.observacao} onChange={e => setFormData({...formData, observacao: e.target.value})} />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-2">
               <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
               <button type="submit" className="btn-primary shadow-md">
                 <Save size={18} className="mr-2" /> Salvar Ficha
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      <div className="premium-card p-0 overflow-hidden flex flex-col min-h-[400px]">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <Search size={20} className="text-gray-400" />
            <input type="text" placeholder="Buscar visitante..." className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700 font-medium" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        {isLoading ? (
            <div className="flex-1 flex justify-center items-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : filteredVisitors.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center text-gray-400 p-10">
                <HeartHandshake size={48} className="mb-3 opacity-30" />
                <p>Nenhum visitante encontrado.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-6 bg-gray-50/30">
                {filteredVisitors.map((visitor) => (
                    <div key={visitor.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:border-blue-200 group relative">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-bold text-[#0f172a] text-lg">{visitor.nome || 'Sem Nome'}</h3>
                                <p className="text-xs text-gray-500 flex items-center mt-1">
                                    <Calendar size={12} className="mr-1" /> Visita: {visitor.dataVisita ? new Date(visitor.dataVisita).toLocaleDateString('pt-BR') : '-'}
                                </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                visitor.status === 'Visitante' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                visitor.status === 'Em Acompanhamento' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                                {visitor.status || 'Visitante'}
                            </span>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                <Phone size={14} className="mr-2 text-blue-500" />
                                {visitor.telefone || 'Sem telefone'}
                                {visitor.telefone && (
                                    // AQUI ESTAVA O ERRO: Adicionado (visitor.telefone || '') para proteger o .replace
                                    <a 
                                        href={`https://wa.me/55${(visitor.telefone || '').replace(/\D/g,'')}`} 
                                        target="_blank" 
                                        rel="noreferrer" 
                                        className="ml-auto text-xs font-bold text-green-600 hover:underline"
                                    >
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                            {visitor.observacao && (
                                <div className="text-xs text-gray-500 italic bg-yellow-50/50 p-2 rounded border border-yellow-100">
                                    "{visitor.observacao}"
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(visitor)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(visitor.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Visitors;