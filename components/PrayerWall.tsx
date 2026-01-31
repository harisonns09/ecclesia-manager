import React, { useState } from 'react';
import { Heart, Plus, MessageCircle, Lock, Globe, ThumbsUp } from 'lucide-react';
import { PrayerRequest } from '../types';

interface PrayerWallProps {
  requests: PrayerRequest[];
  setRequests: (requests: PrayerRequest[]) => void;
  churchId: string;
}

const PrayerWall: React.FC<PrayerWallProps> = ({ requests, setRequests, churchId }) => {
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState<Partial<PrayerRequest>>({
    request: '',
    authorName: '',
    category: 'Outros',
    isAnonymous: false
  });

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const request: PrayerRequest = {
      id: Math.random().toString(36).substr(2, 9),
      churchId,
      request: newRequest.request || '',
      authorName: newRequest.isAnonymous ? 'Anônimo' : (newRequest.authorName || 'Membro'),
      date: new Date().toISOString(),
      category: newRequest.category as any || 'Outros',
      prayedCount: 0,
      isAnonymous: newRequest.isAnonymous || false
    };
    // Add to beginning of list
    setRequests([request, ...requests]);
    setShowModal(false);
    setNewRequest({ request: '', authorName: '', category: 'Outros', isAnonymous: false });
  };

  const handlePray = (id: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, prayedCount: req.prayedCount + 1 } : req
    ));
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Saúde': return 'bg-rose-100 text-rose-700';
      case 'Família': return 'bg-blue-100 text-blue-700';
      case 'Financeiro': return 'bg-green-100 text-green-700';
      case 'Espiritual': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-8 rounded-2xl border border-orange-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mural de Oração</h2>
          <p className="text-gray-600 max-w-xl">
            "Orai uns pelos outros, para que sareis." Compartilhe seus pedidos ou interceda pelos irmãos.
            Sua privacidade é respeitada.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200 flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Fazer Pedido de Oração
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.length === 0 ? (
           <div className="col-span-full py-16 text-center">
             <Heart size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-500 font-medium">Nenhum pedido de oração ativo no momento.</p>
           </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getCategoryColor(req.category)}`}>
                  {req.category}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(req.date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <p className="text-gray-800 text-lg mb-6 leading-relaxed flex-1">
                "{req.request}"
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center text-sm text-gray-500">
                  {req.isAnonymous ? (
                    <Lock size={14} className="mr-1.5" />
                  ) : (
                    <Globe size={14} className="mr-1.5" />
                  )}
                  <span className="font-medium truncate max-w-[100px]">{req.authorName}</span>
                </div>
                
                <button 
                  onClick={() => handlePray(req.id)}
                  className="flex items-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 transition-colors group"
                >
                  <Heart size={16} className={`group-hover:fill-orange-600 transition-colors ${req.prayedCount > 0 ? 'fill-orange-600' : ''}`} />
                  {req.prayedCount > 0 ? `${req.prayedCount} oraram` : 'Vou orar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Novo Pedido de Oração</h3>
              <button onClick={() => setShowModal(false)}><span className="text-2xl text-gray-400">&times;</span></button>
            </div>
            <form onSubmit={handleAddRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Pedido</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none resize-none"
                  placeholder="Descreva seu pedido aqui..."
                  value={newRequest.request}
                  onChange={e => setNewRequest({...newRequest, request: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
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
                   <label className="flex items-center cursor-pointer select-none">
                     <input 
                      type="checkbox"
                      className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                      checked={newRequest.isAnonymous}
                      onChange={e => setNewRequest({...newRequest, isAnonymous: e.target.checked})}
                     />
                     <span className="ml-2 text-sm text-gray-700">Pedido Anônimo</span>
                   </label>
                </div>
              </div>

              {!newRequest.isAnonymous && (
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome</label>
                   <input 
                    type="text"
                    required={!newRequest.isAnonymous}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Como gostaria de ser identificado?"
                    value={newRequest.authorName}
                    onChange={e => setNewRequest({...newRequest, authorName: e.target.value})}
                   />
                </div>
              )}

              <div className="bg-orange-50 p-4 rounded-lg text-sm text-orange-800">
                <p>Este pedido será visível para os membros da comunidade para que possam orar por você.</p>
              </div>

              <button type="submit" className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">
                Publicar Pedido
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrayerWall;