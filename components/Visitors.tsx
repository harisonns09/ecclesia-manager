import React, { useState, useEffect } from 'react';
import { User, Phone, Calendar, Plus, Edit2, Trash2, Save, Search, HeartHandshake, X, Loader, Coffee, Home, BookOpen, Award, Target, KanbanSquare, LayoutGrid } from 'lucide-react';
import { Visitor, VisitorStatus } from '../types';
import { visitorApi } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

const Visitors: React.FC = () => {
  const { currentChurch: church } = useApp();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Novo estado para alternar a visualização
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('kanban');

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
    if (church) loadVisitors();
  }, [church]);

  const loadVisitors = async () => {
    if (!church) return;
    setIsLoading(true);
    try {
      const data = await visitorApi.getByChurch(church.id);
      
      const safeVisitors: Visitor[] = Array.isArray(data) ? data.map((item: any) => ({
        id: item.id,
        churchId: church.id,
        nome: item.nome || 'Sem Nome',
        telefone: item.telefone || '',
        dataVisita: item.dataVisita || new Date().toISOString(),
        dataAniversario: item.dataAniversario,
        status: item.status || 'Visitante',
        observacao: item.observation || item.observacao,
        progressoTrilha: item.progressoTrilha || 0,
        trilhaCafeConcluido: item.trilhaCafeConcluido || false,
        trilhaCelulaConcluida: item.trilhaCelulaConcluida || false,
        trilhaClasseConcluida: item.trilhaClasseConcluida || false
      })) : [];

      setVisitors(safeVisitors);
    } catch (error) {
      toast.error("Erro ao carregar lista de visitantes.");
      setVisitors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!church) return;

    const toastId = toast.loading(editingId ? "Atualizando..." : "Salvando...");
    try {
      if (editingId) {
        await visitorApi.update(church.id, editingId, formData);
        setVisitors(prev => prev.map(v => v.id === editingId ? { ...v, ...formData } as Visitor : v));
        toast.success("Visitante atualizado!", { id: toastId });
      } else {
        const payload = { ...formData, churchId: church.id };
        const created = await visitorApi.create(church.id, payload);
        
        const newVisitor: Visitor = {
            id: created?.id || Date.now().toString(),
            churchId: church.id,
            nome: formData.nome || '',
            telefone: formData.telefone || '',
            dataVisita: formData.dataVisita || new Date().toISOString(),
            status: formData.status as VisitorStatus || 'Visitante',
            dataAniversario: formData.dataAniversario,
            observacao: formData.observacao,
            progressoTrilha: 0,
            trilhaCafeConcluido: false,
            trilhaCelulaConcluida: false,
            trilhaClasseConcluida: false
        };

        setVisitors(prev => [newVisitor, ...prev]);
        toast.success("Visitante cadastrado!", { id: toastId });
      }
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar dados.", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!church) return;
    if (!confirm("Excluir este visitante?")) return;

    const toastId = toast.loading("Removendo...");
    try {
      await visitorApi.delete(church.id, id);
      setVisitors(prev => prev.filter(v => v.id !== id));
      toast.success("Visitante removido.", { id: toastId });
    } catch (error) {
      toast.error("Erro ao excluir.", { id: toastId });
    }
  };

  const handleToggleMission = async (visitor: any, mission: 'cafe' | 'celula' | 'classe' | 'apresentacao') => {
    if (!church) return;
    const toastId = toast.loading("Registrando conquista...");

    try {
        const isApresentacao = mission === 'apresentacao';

        const payload = {
            decidiuSerMembro: true,
            cafePastorConcluido: mission === 'cafe' ? !visitor.trilhaCafeConcluido : visitor.trilhaCafeConcluido,
            visitaCelulaConcluida: mission === 'celula' ? !visitor.trilhaCelulaConcluida : visitor.trilhaCelulaConcluida,
            classeIntegracaoConcluida: mission === 'classe' ? !visitor.trilhaClasseConcluida : visitor.trilhaClasseConcluida,
            dataApresentacao: isApresentacao ? new Date().toISOString().split('T')[0] : null
        };

        const updated = await visitorApi.updateTrilha(church.id, visitor.id, payload);

        setVisitors(prev => prev.map(v => 
            v.id === visitor.id ? { 
                ...v, 
                progressoTrilha: updated.progressoTrilha,
                trilhaCafeConcluido: updated.trilhaCafeConcluido,
                trilhaCelulaConcluida: updated.trilhaCelulaConcluida,
                trilhaClasseConcluida: updated.trilhaClasseConcluida,
                status: isApresentacao ? 'Membro' : v.status
            } : v
        ));

        if (isApresentacao) {
            toast.success(`🎉 Sensacional! ${visitor.nome} agora é Membro!`, { id: toastId, duration: 4000 });
        } else {
            toast.success("Missão concluída! O progresso aumentou.", { id: toastId });
        }

    } catch (error) {
        toast.error("Erro ao salvar progresso.", { id: toastId });
    }
  };

  const startEdit = (visitor: Visitor) => {
    setEditingId(visitor.id);
    setFormData({
        nome: visitor.nome || '',
        telefone: visitor.telefone || '',
        dataVisita: visitor.dataVisita ? visitor.dataVisita.split('T')[0] : '',
        dataAniversario: visitor.dataAniversario ? visitor.dataAniversario.split('T')[0] : '',
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

  const filteredVisitors = visitors.filter(v => {
    const search = searchTerm.toLowerCase();
    return (v.nome?.toLowerCase().includes(search) || v.telefone?.includes(search));
  });

  // Agrupamento para o Kanban
  const colNovos = filteredVisitors.filter(v => (v.progressoTrilha || 0) === 0 && v.status !== 'Membro' );
  const colEmTrilha = filteredVisitors.filter(v => (v.progressoTrilha || 0) > 0 && (v.progressoTrilha || 0) < 75 && v.status !== 'Membro');
  const colQuaseLa = filteredVisitors.filter(v => (v.progressoTrilha || 0) >= 75 && v.status !== 'Membro' );
  const colMembros = filteredVisitors.filter(v => v.status === 'Membro' );

  // Componente interno do Card do Visitante (Para ser reusado na Grade e no Kanban)
  const VisitorCard = ({ visitor }: { visitor: any }) => {
    const isMembro = visitor.status === 'Membro' || visitor.status === 'Ativo';
    const progresso = visitor.progressoTrilha || 0;
    const readyToPresent = progresso >= 75;

    return (
        <div className={`bg-white rounded-2xl border ${isMembro ? 'border-emerald-200' : 'border-gray-200'} shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden m-2`}>
            <div className="p-4 pb-3">
                <div className="flex justify-between items-start mb-2">
                    <div className="min-w-0 pr-2">
                        <h3 className="font-bold text-[#0f172a] text-md leading-tight truncate">{visitor.nome || 'Sem Nome'}</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Visita: {visitor.dataVisita ? new Date(visitor.dataVisita).toLocaleDateString('pt-BR') : '-'}</p>
                    </div>
                </div>
                
                <div className="flex items-center text-[12px] text-gray-600 bg-gray-50 p-1.5 rounded-lg mt-2">
                    <Phone size={12} className="mr-1.5 text-blue-500 shrink-0" />
                    <span className="truncate">{visitor.telefone || 'Sem telefone'}</span>
                    {visitor.telefone && (
                        <a href={`https://wa.me/55${(visitor.telefone || '').replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="ml-auto text-[10px] font-bold text-green-600 hover:underline shrink-0">Whatsapp</a>
                    )}
                </div>
            </div>

            {/* GAMIFICAÇÃO */}
            {!isMembro ? (
                <div className="bg-gradient-to-b from-blue-50/30 to-white px-4 py-3 border-t border-gray-100 flex-1 flex flex-col justify-end">
                    <div className="flex justify-between items-end mb-1.5">
                        <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center">
                            <Target size={12} className="mr-1 text-blue-500" /> Trilha
                        </h4>
                        <span className={`text-[11px] font-bold ${progresso === 100 ? 'text-green-600' : 'text-blue-600'}`}>{progresso}%</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
                        <div className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${progresso === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`} style={{ width: `${progresso}%` }}></div>
                    </div>

                    <div className="flex justify-between gap-1.5 mb-2">
                        <button onClick={() => handleToggleMission(visitor, 'cafe')} title="Café com o Pastor"
                            className={`flex-1 p-1.5 rounded-lg flex flex-col items-center justify-center border transition-all ${visitor.trilhaCafeConcluido ? 'bg-green-50 border-green-200 text-green-700 shadow-inner' : 'bg-white border-gray-200 text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}>
                            <Coffee size={14} className="mb-0.5" />
                        </button>
                        <button onClick={() => handleToggleMission(visitor, 'celula')} title="Célula"
                            className={`flex-1 p-1.5 rounded-lg flex flex-col items-center justify-center border transition-all ${visitor.trilhaCelulaConcluida ? 'bg-green-50 border-green-200 text-green-700 shadow-inner' : 'bg-white border-gray-200 text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}>
                            <Home size={14} className="mb-0.5" />
                        </button>
                        <button onClick={() => handleToggleMission(visitor, 'classe')} title="Classe"
                            className={`flex-1 p-1.5 rounded-lg flex flex-col items-center justify-center border transition-all ${visitor.trilhaClasseConcluida ? 'bg-green-50 border-green-200 text-green-700 shadow-inner' : 'bg-white border-gray-200 text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}>
                            <BookOpen size={14} className="mb-0.5" />
                        </button>
                    </div>

                    {readyToPresent && (
                        <button onClick={() => handleToggleMission(visitor, 'apresentacao')} className="w-full mt-1 py-1.5 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-lg text-[11px] font-bold flex items-center justify-center shadow-sm hover:scale-[1.02] transition-transform">
                            <Award size={14} className="mr-1" /> Formar Membro!
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-emerald-50/50 px-4 py-3 border-t border-emerald-100 flex-1 flex flex-col items-center justify-center text-center">
                    <Award size={24} className="text-emerald-500 mb-1" />
                    <h4 className="text-[11px] font-bold text-emerald-800">Trilha Concluída</h4>
                </div>
            )}

            <div className="flex justify-end gap-1 p-2 bg-gray-50/50 border-t border-gray-100">
                <button onClick={() => startEdit(visitor)} className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(visitor.id)} className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"><Trash2 size={14} /></button>
            </div>
        </div>
    );
  };

  if (!church) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-10">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                <HeartHandshake className="text-pink-600" size={28} /> Trilha de Consolidação
            </h2>
            <p className="text-gray-500 text-sm mt-1">Acompanhe a jornada e gamifique a integração.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={() => { resetForm(); setShowForm(!showForm); }} className={showForm ? "btn-secondary" : "btn-primary shadow-lg"}>
            {showForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
            {showForm ? 'Cancelar' : 'Novo Visitante'}
            </button>
        </div>
      </div>

      {/* BARRA DE PESQUISA E TOGGLE DE VISÃO */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm gap-4">
          <div className="flex items-center w-full sm:max-w-md bg-gray-50 px-3 py-2 rounded-lg">
            <Search size={18} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Buscar por nome ou telefone..." className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setViewMode('kanban')} className={`flex items-center px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <KanbanSquare size={16} className="mr-2" /> Funil (Kanban)
              </button>
              <button onClick={() => setViewMode('grid')} className={`flex items-center px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${viewMode === 'grid' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                  <LayoutGrid size={16} className="mr-2" /> Todos (Grade)
              </button>
          </div>
      </div>

      {/* FORMULÁRIO */}
      {showForm && (
        <div className="premium-card p-0 overflow-hidden animate-in slide-in-from-top-4">
           {/* CONTEÚDO DO SEU FORMULÁRIO MANTIDO INTACTO AQUI... */}
           <div className="bg-gray-50/50 p-6 border-b border-gray-100"><h3 className="font-bold text-[#0f172a] text-lg">{editingId ? 'Editar Visitante' : 'Ficha de Visitante'}</h3></div>
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
                 <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status Inicial</label>
                 <select className="input-field bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as VisitorStatus})}>
                    <option value="Visitante">Visitante</option>
                    <option value="Em Acompanhamento">Em Acompanhamento</option>
                    <option value="Membro">Membro</option>
                 </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nascimento</label>
                <input type="date" className="input-field" value={formData.dataAniversario} onChange={e => setFormData({...formData, dataAniversario: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-gray-100 mt-2 gap-2">
               <button type="button" onClick={resetForm} className="btn-secondary">Cancelar</button>
               <button type="submit" className="btn-primary"><Save size={18} className="mr-2" /> Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* ÁREA DE EXIBIÇÃO: KANBAN OU GRADE */}
      {isLoading ? (
         <div className="flex justify-center items-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>
      ) : (
         viewMode === 'kanban' ? (
            /* VISUALIZAÇÃO KANBAN (FUNIL) */
            <div className="flex overflow-x-auto pb-6 gap-6 snap-x custom-scrollbar">
                
                {/* Coluna 1: Novos */}
                <div className="min-w-[280px] w-[280px] bg-gray-50/50 rounded-2xl border border-gray-200 flex flex-col snap-center shadow-inner h-fit max-h-[70vh]">
                    <div className="p-4 border-b border-gray-200 bg-white/50 rounded-t-2xl flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">1. Novos <span className="text-xs font-normal ml-1">(0%)</span></h3>
                        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{colNovos.length}</span>
                    </div>
                    <div className="p-2 overflow-y-auto">
                        {colNovos.map(v => <VisitorCard key={v.id} visitor={v} />)}
                        {colNovos.length === 0 && <div className="p-6 text-center text-sm text-gray-400">Nenhum visitante novo.</div>}
                    </div>
                </div>

                {/* Coluna 2: Em Trilha */}
                <div className="min-w-[280px] w-[280px] bg-blue-50/30 rounded-2xl border border-blue-100 flex flex-col snap-center shadow-inner h-fit max-h-[70vh]">
                    <div className="p-4 border-b border-blue-100 bg-blue-50/50 rounded-t-2xl flex justify-between items-center">
                        <h3 className="font-bold text-blue-800">2. Conectando <span className="text-xs font-normal ml-1">(25-50%)</span></h3>
                        <span className="bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs font-bold">{colEmTrilha.length}</span>
                    </div>
                    <div className="p-2 overflow-y-auto">
                        {colEmTrilha.map(v => <VisitorCard key={v.id} visitor={v} />)}
                        {colEmTrilha.length === 0 && <div className="p-6 text-center text-sm text-gray-400">Ninguém nesta etapa.</div>}
                    </div>
                </div>

                {/* Coluna 3: Prontos (Na Cara do Gol) */}
                <div className="min-w-[280px] w-[280px] bg-orange-50/30 rounded-2xl border border-orange-100 flex flex-col snap-center shadow-inner h-fit max-h-[70vh]">
                    <div className="p-4 border-b border-orange-100 bg-orange-50/50 rounded-t-2xl flex justify-between items-center">
                        <h3 className="font-bold text-orange-800">3. Quase lá! <span className="text-xs font-normal ml-1">(75%)</span></h3>
                        <span className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full text-xs font-bold">{colQuaseLa.length}</span>
                    </div>
                    <div className="p-2 overflow-y-auto">
                        {colQuaseLa.map(v => <VisitorCard key={v.id} visitor={v} />)}
                        {colQuaseLa.length === 0 && <div className="p-6 text-center text-sm text-gray-400">Ninguém aguardando apresentação.</div>}
                    </div>
                </div>

                {/* Coluna 4: Formados (Membros) */}
                <div className="min-w-[280px] w-[280px] bg-emerald-50/30 rounded-2xl border border-emerald-100 flex flex-col snap-center shadow-inner h-fit max-h-[70vh]">
                    <div className="p-4 border-b border-emerald-100 bg-emerald-50/50 rounded-t-2xl flex justify-between items-center">
                        <h3 className="font-bold text-emerald-800">4. Formados <span className="text-xs font-normal ml-1">(100%)</span></h3>
                        <span className="bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full text-xs font-bold">{colMembros.length}</span>
                    </div>
                    <div className="p-2 overflow-y-auto opacity-70 hover:opacity-100 transition-opacity">
                        {colMembros.map(v => <VisitorCard key={v.id} visitor={v} />)}
                        {colMembros.length === 0 && <div className="p-6 text-center text-sm text-gray-400">Nenhum membro formado ainda.</div>}
                    </div>
                </div>

            </div>
         ) : (
            /* VISUALIZAÇÃO EM GRADE CLÁSSICA */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
                {filteredVisitors.map(v => <VisitorCard key={v.id} visitor={v} />)}
                {filteredVisitors.length === 0 && <div className="col-span-full text-center py-10 text-gray-400">Nenhum visitante encontrado.</div>}
            </div>
         )
      )}
    </div>
  );
};

export default Visitors;