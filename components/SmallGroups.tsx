import React, { useState } from 'react';
import { MapPin, Clock, Calendar, User, Home, Plus, Trash2 } from 'lucide-react';
import { SmallGroup } from '../types';

interface SmallGroupsProps {
  groups: SmallGroup[];
  setGroups: (groups: SmallGroup[]) => void;
  churchId: string;
}

const SmallGroups: React.FC<SmallGroupsProps> = ({ groups, setGroups, churchId }) => {
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState<Partial<SmallGroup>>({
    name: '',
    leaderName: '',
    hostName: '',
    address: '',
    dayOfWeek: 'Quarta-feira',
    time: '20:00',
    neighborhood: ''
  });

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const group: SmallGroup = {
      id: Math.random().toString(36).substr(2, 9),
      churchId,
      name: newGroup.name || 'Nova Célula',
      leaderName: newGroup.leaderName || '',
      hostName: newGroup.hostName || '',
      address: newGroup.address || '',
      dayOfWeek: newGroup.dayOfWeek || 'Quarta-feira',
      time: newGroup.time || '20:00',
      neighborhood: newGroup.neighborhood || ''
    };
    setGroups([...groups, group]);
    setShowModal(false);
    setNewGroup({
      name: '',
      leaderName: '',
      hostName: '',
      address: '',
      dayOfWeek: 'Quarta-feira',
      time: '20:00',
      neighborhood: ''
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este pequeno grupo?')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  const getDayColor = (day: string) => {
    switch (day) {
      case 'Segunda-feira': return 'bg-purple-100 text-purple-700';
      case 'Terça-feira': return 'bg-blue-100 text-blue-700';
      case 'Quarta-feira': return 'bg-green-100 text-green-700';
      case 'Quinta-feira': return 'bg-orange-100 text-orange-700';
      case 'Sexta-feira': return 'bg-pink-100 text-pink-700';
      case 'Sábado': return 'bg-indigo-100 text-indigo-700';
      case 'Domingo': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const daysOfWeek = [
    'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pequenos Grupos</h2>
          <p className="text-gray-500 text-sm">Gestão de células e grupos de crescimento nos lares.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} className="mr-2" />
          Novo Grupo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-dashed border-gray-300">
            <Home size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum pequeno grupo cadastrado.</p>
            <button onClick={() => setShowModal(true)} className="text-blue-600 font-medium hover:underline mt-2">
              Cadastrar o primeiro
            </button>
          </div>
        ) : (
          groups.map(group => (
            <div key={group.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all group-hover:border-blue-200">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide ${getDayColor(group.dayOfWeek)}`}>
                      {group.dayOfWeek}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">{group.name}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <MapPin size={14} className="mr-1" /> {group.neighborhood}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDelete(group.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-700">
                    <Clock size={16} className="mr-2 text-gray-400" />
                    <span>{group.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <User size={16} className="mr-2 text-gray-400" />
                    <span className="truncate">Líder: <strong>{group.leaderName}</strong></span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Home size={16} className="mr-2 text-gray-400" />
                    <span className="truncate">Anfitrião: {group.hostName}</span>
                  </div>
                  <div className="flex items-start text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                    <MapPin size={16} className="mr-2 mt-0.5 text-gray-400 shrink-0" />
                    <span className="text-xs">{group.address}</span>
                  </div>
                </div>
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
              <h3 className="font-bold text-gray-800">Novo Pequeno Grupo</h3>
              <button onClick={() => setShowModal(false)}><span className="text-2xl text-gray-400">&times;</span></button>
            </div>
            <form onSubmit={handleAddGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Grupo</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={newGroup.name} onChange={e => setNewGroup({...newGroup, name: e.target.value})} placeholder="Ex: Célula Morumbi, GC Jovens" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dia da Semana</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-lg"
                    value={newGroup.dayOfWeek}
                    onChange={e => setNewGroup({...newGroup, dayOfWeek: e.target.value})}
                  >
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                  <input type="time" required className="w-full px-3 py-2 border rounded-lg" value={newGroup.time} onChange={e => setNewGroup({...newGroup, time: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Líder</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={newGroup.leaderName} onChange={e => setNewGroup({...newGroup, leaderName: e.target.value})} placeholder="Quem lidera?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anfitrião (Casa)</label>
                  <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={newGroup.hostName} onChange={e => setNewGroup({...newGroup, hostName: e.target.value})} placeholder="Casa de quem?" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={newGroup.neighborhood} onChange={e => setNewGroup({...newGroup, neighborhood: e.target.value})} placeholder="Ex: Centro" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço Completo</label>
                <input type="text" required className="w-full px-3 py-2 border rounded-lg" value={newGroup.address} onChange={e => setNewGroup({...newGroup, address: e.target.value})} placeholder="Rua, Número, Complemento" />
              </div>

              <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 mt-2">Cadastrar Grupo</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmallGroups;