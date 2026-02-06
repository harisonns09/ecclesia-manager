import React, { useState, useMemo } from 'react';
import { Church } from '../types';
import { churchApi } from '../services/api';
import { Search, MapPin, ChevronDown, Check, Building2, ArrowRight, Settings, Plus, Trash2, Edit2, X, Save, ArrowLeft } from 'lucide-react';

interface ChurchSelectorProps {
  churches: Church[];
  onSelect: (church: Church) => void;
  onAdd: (church: Church) => void;
  onEdit: (church: Church) => void;
  onDelete: (id: string) => void;
}

const ChurchSelector: React.FC<ChurchSelectorProps> = ({ churches, onSelect, onAdd, onEdit, onDelete }) => {
  // Views: 'select' | 'manage' | 'form'
  const [view, setView] = useState<'select' | 'manage' | 'form'>('select');
  
  // Selection State
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Church>>({
    name: '',
    slug: '',
    address: '',
    city: '',
    state: '',
    instagram: '',
    cnpj: '',
  });

  const filteredChurches = useMemo(() => {
    return churches.filter(
      (church) =>
        church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        church.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [churches, searchTerm]);

  const handleSelect = (church: Church) => {
    setSelectedChurch(church);
    setSearchTerm(church.name);
    setIsOpen(false);
  };

  const handleEnterPlatform = () => {
    if (selectedChurch) {
      onSelect(selectedChurch);
    }
  };

  // Management Handlers
  const startCreate = () => {
    setEditingId(null);
    setFormData({ name: '', slug: '', address: '', city: '', state: '', instagram: '' });
    setView('form');
  };

  const startEdit = (church: Church) => {
    setEditingId(church.id);
    setFormData({ ...church });
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if(confirm('Tem certeza que deseja excluir esta igreja? Todos os dados vinculados podem ser perdidos.')) {
      try {
        await churchApi.delete(id); // Chama o Backend
        onDelete(id); // Atualiza a UI
      } catch (error) {
        alert("Erro ao excluir igreja. Verifique se existem dados vinculados.");
        console.error(error);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city) return;

    // Removemos a referência ao slug e themeColor que não existem no Backend ou eram opcionais incorretos
    const payload = {
          name: formData.name || '',
          // Se o backend não aceita SLUG, envie apenas se tiver certeza. 
          // Mantendo slug aqui para satisfazer o tipo Typescript, mas o Java vai ignorar se não tiver no DTO.
          slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '', 
          address: formData.address || '',
          city: formData.city || '',
          state: formData.state || '',
          instagram: formData.instagram || '',
          cnpj: formData.cnpj || '',
    };

    try {
        if (editingId) {
            // Edit
            const updatedChurch = await churchApi.update(editingId, payload);
            onEdit(updatedChurch); 
        } else {
            // Create
            const createdChurch = await churchApi.create(payload);
            onAdd(createdChurch); 
        }
        setView('manage');
    } catch (err) {
        console.error("Erro ao salvar", err);
        alert("Erro ao salvar igreja");
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: val,
      slug: prev.slug ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    }));
  };

  // REMOVIDO: const COLORS = [...]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center p-4">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/50 backdrop-blur-sm relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col min-h-[500px]">
        
        {/* VIEW: SELECT CHURCH (DEFAULT) */}
        {view === 'select' && (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="pt-10 pb-6 px-8 text-center relative">
                <button 
                 onClick={() => setView('manage')}
                 className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                 title="Gerenciar Igrejas"
               >
                 <Settings size={20} />
               </button>
              <div className="w-16 h-16 bg-blue-600 rounded-2xl text-white font-bold text-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
                E
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo ao Ecclesia</h1>
              <p className="text-gray-500 text-sm">Selecione sua comunidade para acessar o sistema de gestão.</p>
            </div>

            {/* Selection Area */}
            <div className="px-8 pb-8 space-y-6 flex-1">
              <div className="relative">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                  Encontre sua Igreja
                </label>
                
                <div className="relative">
                  <div 
                    className={`flex items-center w-full bg-gray-50 border transition-all duration-200 rounded-xl px-4 py-3 cursor-pointer ${isOpen ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <Building2 className={`mr-3 ${selectedChurch ? 'text-blue-600' : 'text-gray-400'}`} size={20} />
                    <input
                      type="text"
                      className="bg-transparent border-none outline-none w-full text-gray-800 placeholder-gray-400 font-medium"
                      placeholder="Digite o nome ou cidade..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!isOpen) setIsOpen(true);
                        if (selectedChurch && e.target.value !== selectedChurch.name) setSelectedChurch(null);
                      }}
                      onFocus={() => setIsOpen(true)}
                    />
                    <ChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={20} />
                  </div>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-64 overflow-y-auto z-20 animate-in fade-in slide-in-from-top-2 duration-200 custom-scrollbar">
                        {filteredChurches.length > 0 ? (
                          filteredChurches.map((church) => (
                            <div
                              key={church.id}
                              className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                              onClick={() => handleSelect(church)}
                            >
                              <div className="flex items-center overflow-hidden">
                                <div 
                                  className="w-2 h-10 rounded-full mr-3 shrink-0" 
                                  style={{ backgroundColor: 'black' }}
                                ></div>
                                <div className="truncate">
                                  <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-700">{church.name}</p>
                                  <p className="text-xs text-gray-500 flex items-center truncate">
                                    <MapPin size={10} className="mr-1" /> {church.city}
                                  </p>
                                </div>
                              </div>
                              {selectedChurch?.id === church.id && (
                                <Check size={16} className="text-blue-600 ml-2 shrink-0" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            Nenhuma igreja encontrada.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleEnterPlatform}
                  disabled={!selectedChurch}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-300 shadow-lg ${
                    selectedChurch 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-200 hover:-translate-y-1' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Acessar Plataforma
                  {selectedChurch && <ArrowRight size={20} className="ml-2 animate-pulse" />}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center mt-auto">
              <p className="text-xs text-gray-500">
                Sua igreja ainda não está aqui? <button onClick={() => setView('manage')} className="text-blue-600 font-semibold hover:underline">Cadastre-se</button>
              </p>
            </div>
          </div>
        )}

        {/* VIEW: MANAGE CHURCHES */}
        {view === 'manage' && (
            <div className="flex-1 flex flex-col h-full">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                <div className="flex items-center">
                  <button onClick={() => setView('select')} className="mr-3 text-gray-400 hover:text-gray-600">
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-lg font-bold text-gray-800">Gerenciar Igrejas</h2>
                </div>
                <button 
                 onClick={startCreate}
                 className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 custom-scrollbar">
                {churches.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                    <Building2 size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Nenhuma igreja cadastrada.</p>
                  </div>
                ) : (
                  churches.map(church => (
                    <div key={church.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                      <div className="flex items-center overflow-hidden mr-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shrink-0 mr-3 shadow-sm"
                          style={{ backgroundColor: 'black' }}
                        >
                          {church.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800 text-sm truncate">{church.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{church.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(church)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(church.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
        )}

        {/* VIEW: FORM (ADD/EDIT) */}
        {view === 'form' && (
          <div className="flex-1 flex flex-col h-full bg-white">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? 'Editar Igreja' : 'Nova Igreja'}
              </h2>
              <button onClick={() => setView('manage')} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Igreja</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Ex: Igreja Batista Central"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
                  value={formData.slug}
                  onChange={e => setFormData({...formData, slug: e.target.value})}
                  placeholder="ex: igreja-batista-central"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram (Opcional)</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.instagram}
                  onChange={e => setFormData({...formData, instagram: e.target.value})}
                  placeholder="@suaigreja"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                     <input 
                       type="text" 
                       required
                       maxLength={2}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                       value={formData.state}
                       onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})}
                       placeholder="SP"
                     />
                  </div>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder="Rua das Flores, 123"
                    />
              </div>

              {/* REMOVIDO: Seção de Cor do Tema */}

              <div className="pt-6">
                <button 
                  type="submit" 
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-md transition-all flex items-center justify-center"
                >
                  <Save size={20} className="mr-2" />
                  Salvar Igreja
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
      
      <p className="mt-8 text-slate-400 text-xs font-medium">© 2024 Ecclesia Manager System</p>
    </div>
  );
};

export default ChurchSelector;