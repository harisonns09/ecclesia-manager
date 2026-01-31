import React, { useState } from 'react';
import { Users, Calendar, Plus, Trash2, UserPlus, Shield, Music, Heart, BookOpen } from 'lucide-react';
import { Ministry, Scale, Member } from '../types';

interface MinistriesProps {
  ministries: Ministry[];
  setMinistries: (ministries: Ministry[]) => void;
  scales: Scale[];
  setScales: (scales: Scale[]) => void;
  members: Member[];
  churchId: string;
}

const Ministries: React.FC<MinistriesProps> = ({ 
  ministries, 
  setMinistries, 
  scales, 
  setScales, 
  members,
  churchId
}) => {
  const [activeMinistryId, setActiveMinistryId] = useState<string | null>(null);
  const [showMinistryModal, setShowMinistryModal] = useState(false);
  const [showScaleModal, setShowScaleModal] = useState(false);

  // Form States
  const [newMinistry, setNewMinistry] = useState<Partial<Ministry>>({ name: '', leaderName: '', color: '#3B82F6' });
  const [newScale, setNewScale] = useState<Partial<Scale>>({ date: '', title: '', volunteers: [] });

  const activeMinistry = ministries.find(m => m.id === activeMinistryId);
  const activeScales = scales.filter(s => s.ministryId === activeMinistryId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleCreateMinistry = (e: React.FormEvent) => {
    e.preventDefault();
    const ministry: Ministry = {
      id: Math.random().toString(36).substr(2, 9),
      churchId,
      name: newMinistry.name || 'Novo Ministério',
      leaderName: newMinistry.leaderName || '',
      description: newMinistry.description || '',
      color: newMinistry.color || '#3B82F6'
    };
    setMinistries([...ministries, ministry]);
    setShowMinistryModal(false);
    setNewMinistry({ name: '', leaderName: '', color: '#3B82F6' });
  };

  const handleCreateScale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMinistryId) return;

    const scale: Scale = {
      id: Math.random().toString(36).substr(2, 9),
      churchId,
      ministryId: activeMinistryId,
      date: newScale.date || new Date().toISOString().split('T')[0],
      title: newScale.title || 'Escala',
      volunteers: newScale.volunteers || []
    };
    setScales([...scales, scale]);
    setShowScaleModal(false);
    setNewScale({ date: '', title: '', volunteers: [] });
  };

  const toggleVolunteer = (memberId: string) => {
    const currentList = newScale.volunteers || [];
    if (currentList.includes(memberId)) {
      setNewScale({ ...newScale, volunteers: currentList.filter(id => id !== memberId) });
    } else {
      setNewScale({ ...newScale, volunteers: [...currentList, memberId] });
    }
  };

  const getMinistryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('louvor') || n.includes('música')) return <Music size={24} />;
    if (n.includes('infantil') || n.includes('kids')) return <Heart size={24} />;
    if (n.includes('ensino') || n.includes('biblia')) return <BookOpen size={24} />;
    return <Users size={24} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Ministérios e Escalas</h2>
        <button 
          onClick={() => setShowMinistryModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Novo Ministério
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar List of Ministries */}
        <div className="lg:col-span-1 space-y-3">
          {ministries.map(ministry => (
            <div 
              key={ministry.id}
              onClick={() => setActiveMinistryId(ministry.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                activeMinistryId === ministry.id 
                  ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-500' 
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm mr-3"
                  style={{ backgroundColor: ministry.color }}
                >
                  {getMinistryIcon(ministry.name)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{ministry.name}</h3>
                  <p className="text-xs text-gray-500 flex items-center">
                    <Shield size={10} className="mr-1" />
                    {ministry.leaderName || 'Sem líder'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {ministries.length === 0 && (
            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              Nenhum ministério criado.
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {activeMinistry ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {activeMinistry.name}
                    <span className="text-xs font-normal bg-white border px-2 py-0.5 rounded-full text-gray-500">
                      {activeScales.length} escalas agendadas
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Liderado por {activeMinistry.leaderName}</p>
                </div>
                <button 
                  onClick={() => setShowScaleModal(true)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center transition-colors"
                >
                  <Calendar size={16} className="mr-2" />
                  Agendar Escala
                </button>
              </div>

              {/* Scales List */}
              <div className="p-6 flex-1 bg-gray-50/50 overflow-y-auto">
                {activeScales.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Calendar size={48} className="mb-4 opacity-20" />
                    <p>Nenhuma escala agendada para este ministério.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeScales.map(scale => (
                      <div key={scale.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center text-blue-600 font-bold mb-1">
                               <Calendar size={16} className="mr-2" />
                               {new Date(scale.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' })}
                            </div>
                            <h4 className="text-gray-900 font-semibold">{scale.title}</h4>
                          </div>
                          <button 
                             onClick={() => setScales(scales.filter(s => s.id !== scale.id))}
                             className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Voluntários</p>
                          <div className="flex flex-wrap gap-2">
                            {scale.volunteers.map(volId => {
                              const member = members.find(m => m.id === volId);
                              return member ? (
                                <div key={volId} className="flex items-center bg-gray-100 px-2 py-1 rounded-md text-sm text-gray-700">
                                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center mr-2 font-bold">
                                    {member.name.charAt(0)}
                                  </div>
                                  {member.name.split(' ')[0]}
                                </div>
                              ) : null;
                            })}
                            {scale.volunteers.length === 0 && <span className="text-sm text-red-400 italic">Ninguém escalado</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full bg-white rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 p-8">
              <Users size={64} className="mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-700">Selecione um Ministério</h3>
              <p>Escolha um ministério ao lado para gerenciar suas escalas e voluntários.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Ministry Modal */}
      {showMinistryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Novo Ministério</h3>
              <button onClick={() => setShowMinistryModal(false)}><span className="text-2xl text-gray-400">&times;</span></button>
            </div>
            <form onSubmit={handleCreateMinistry} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Ministério</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={newMinistry.name} onChange={e => setNewMinistry({...newMinistry, name: e.target.value})} placeholder="Ex: Louvor, Infantil, Recepção" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Líder Responsável</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={newMinistry.leaderName} onChange={e => setNewMinistry({...newMinistry, leaderName: e.target.value})} placeholder="Nome do líder" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cor de Identificação</label>
                <div className="flex gap-3">
                  {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'].map(color => (
                    <div 
                      key={color} 
                      onClick={() => setNewMinistry({...newMinistry, color})}
                      className={`w-8 h-8 rounded-full cursor-pointer ring-2 ring-offset-2 ${newMinistry.color === color ? 'ring-gray-400' : 'ring-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Criar Ministério</button>
            </form>
          </div>
        </div>
      )}

      {/* Create Scale Modal */}
      {showScaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Nova Escala - {activeMinistry?.name}</h3>
              <button onClick={() => setShowScaleModal(false)}><span className="text-2xl text-gray-400">&times;</span></button>
            </div>
            <form onSubmit={handleCreateScale} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <input type="date" required className="w-full px-3 py-2 border rounded-lg" value={newScale.date} onChange={e => setNewScale({...newScale, date: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                        <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={newScale.title} onChange={e => setNewScale({...newScale, title: e.target.value})} placeholder="Ex: Culto Domingo" />
                    </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selecionar Voluntários</label>
                  <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {members.map(member => (
                      <div 
                        key={member.id} 
                        onClick={() => toggleVolunteer(member.id)}
                        className={`p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 ${newScale.volunteers?.includes(member.id) ? 'bg-blue-50' : ''}`}
                      >
                         <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center mr-3 text-xs font-bold">
                                {member.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{member.name}</span>
                         </div>
                         {newScale.volunteers?.includes(member.id) && <UserPlus size={18} className="text-blue-600" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-right">{newScale.volunteers?.length} selecionados</p>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                  <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Salvar Escala</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ministries;