import React, { useState, useEffect } from 'react';
import { Heart, Plus, Lock, Globe, X, Loader } from 'lucide-react';
import { PrayerRequest } from '../types';
// Supondo que você tenha uma API para orações, se não tiver, vamos simular localmente ou usar localStorage temporariamente
// Vou assumir que existe um prayerApi ou similar. Se não existir, mantenha o estado local mas avise que não persistirá.
// Como não vi 'prayerApi' nos seus arquivos, vou usar um estado simulado que reinicia ao recarregar, 
// mas a estrutura está pronta para API.
import { useApp } from '../contexts/AppContext'; 
import { toast } from 'sonner';

// Sem props!
const PrayerWall: React.FC = () => {
  const { currentChurch: church } = useApp();
  
  // Estado local para simular (idealmente viria de uma API)
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<PrayerRequest>>({
    request: '',
    authorName: '',
    category: 'Outros',
    isAnonymous: false
  });

  // Efeito para carregar (simulado)
  useEffect(() => {
    if (church) {
        // Aqui você chamaria: prayerApi.getByChurch(church.id).then(setRequests);
        // Por enquanto, inicia vazio ou com dados de exemplo
        setRequests([]); 
    }
  }, [church]);

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!church) return;

    const request: PrayerRequest = {
      id: Math.random().toString(36).substr(2, 9),
      churchId: church.id,
      request: newRequest.request || '',
      authorName: newRequest.isAnonymous ? 'Anônimo' : (newRequest.authorName || 'Membro'),
      date: new Date().toISOString(),
      category: newRequest.category as any || 'Outros',
      prayedCount: 0,
      isAnonymous: newRequest.isAnonymous || false
    };

    setRequests([request, ...requests]);
    setShowModal(false);
    setNewRequest({ request: '', authorName: '', category: 'Outros', isAnonymous: false });
    
    toast.success("Pedido de oração publicado!");
  };

  const handlePray = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, prayedCount: req.prayedCount + 1 } : req
    ));
    toast.success("Você orou por este pedido! 🙏");
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Saúde': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Família': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Financeiro': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Espiritual': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (!church) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="hero-gradient p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-3">Mural de Oração</h2>
          <p className="text-blue-100 max-w-xl text-lg leading-relaxed opacity-90">
            "Orai uns pelos outros, para que sareis." Compartilhe seus pedidos e interceda pelos irmãos.
          </p>
        </div>
        <div className="relative z-10">
            <button 
            onClick={() => setShowModal(true)}
            className="bg-white text-[#1e3a8a] px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center hover:-translate-y-0.5"
            >
            <Plus size={20} className="mr-2" />
            Fazer Pedido de Oração
            </button>
        </div>
        <div className="hero-overlay"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length === 0 ? (
           <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
               <Heart size={40} className="text-gray-300" />
             </div>
             <h3 className="text-lg font-bold text-gray-700">Nenhum pedido ativo</h3>
             <p className="text-gray-500">Seja o primeiro a compartilhar um motivo de oração.</p>
           </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="premium-card p-6 flex flex-col hover:border-[#1e3a8a]/30 group">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getCategoryColor(req.category)}`}>
                  {req.category}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(req.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex-1 mb-6 relative">
                 <div className="absolute -left-2 -top-2 text-6xl text-gray-100 font-serif leading-none select-none">“</div>
                 <p className="text-gray-700 text-lg leading-relaxed relative z-10 italic">
                    {req.request}
                 </p>
              </div>
              
              <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  {req.isAnonymous ? (
                    <Lock size={16} className="mr-2 text-gray-400" />
                  ) : (
                    <Globe size={16} className="mr-2 text-blue-400" />
                  )}
                  <span className="font-semibold text-gray-700 truncate max-w-[120px]">{req.authorName}</span>
                </div>
                
                <button 
                  onClick={() => handlePray(req.id)}
                  className="flex items-center gap-2 text-sm font-bold text-[#1e3a8a] bg-[#eff6ff] px-4 py-2 rounded-lg hover:bg-blue-100 transition-all active:scale-95 group-hover:shadow-sm"
                >
                  <Heart size={18} className={`transition-colors ${req.prayedCount > 0 ? 'fill-[#1e3a8a]' : ''}`} />
                  {req.prayedCount > 0 ? `${req.prayedCount} oraram` : 'Vou orar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-[#0f172a] text-lg">Novo Pedido de Oração</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleAddRequest} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seu Pedido</label>
                <textarea 
                  required
                  rows={4}
                  className="input-field resize-none text-base"
                  placeholder="Descreva seu pedido aqui..."
                  value={newRequest.request}
                  onChange={e => setNewRequest({...newRequest, request: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoria</label>
                  <select 
                    className="input-field bg-white"
                    value={newRequest.category}
                    onChange={e => setNewRequest({...newRequest, category: e.target.value as any})}
                  >
                    <option value="Outros">Geral</option>
                    <option value="Saúde">Saúde</option>
                    <option value="Família">Família</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Espiritual">Espiritual</option>
                  </select>
                </div>
                
                <div className="flex items-end pb-2">
                    <label className="flex items-center cursor-pointer select-none p-2 hover:bg-gray-50 rounded-lg w-full transition-colors border border-transparent hover:border-gray-200">
                      <input 
                       type="checkbox"
                       className="w-5 h-5 text-[#1e3a8a] rounded border-gray-300 focus:ring-[#1e3a8a]"
                       checked={newRequest.isAnonymous}
                       onChange={e => setNewRequest({...newRequest, isAnonymous: e.target.checked})}
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">Anônimo</span>
                    </label>
                </div>
              </div>

              {!newRequest.isAnonymous && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Seu Nome</label>
                    <input 
                     type="text"
                     required={!newRequest.isAnonymous}
                     className="input-field"
                     placeholder="Como gostaria de ser identificado?"
                     value={newRequest.authorName}
                     onChange={e => setNewRequest({...newRequest, authorName: e.target.value})}
                    />
                </div>
              )}

              <div className="bg-blue-50/50 p-4 rounded-xl text-sm text-blue-800 border border-blue-100 flex items-start">
                <Globe size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>Este pedido será visível para os membros da comunidade para que possam orar por você.</p>
              </div>

              <div className="pt-2">
                  <button type="submit" className="btn-primary w-full py-3.5 text-lg shadow-lg">
                    Publicar Pedido
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerWall;