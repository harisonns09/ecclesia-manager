import React, { useState, useMemo } from 'react';
import { Church } from '../types';
import { churchApi } from '../services/api';
import { Search, MapPin, ChevronDown, Check, Building2, ArrowRight, Settings, Plus, Trash2, Edit2, X, Save, ArrowLeft, Church as ChurchIcon } from 'lucide-react';

interface ChurchSelectorProps {
  churches: Church[];
  onSelect: (church: Church) => void;
  onAdd: (church: Church) => void;
  onEdit: (church: Church) => void;
  onDelete: (id: string) => void;
}

const ChurchSelector: React.FC<ChurchSelectorProps> = ({ churches, onSelect, onAdd, onEdit, onDelete }) => {
  const [view, setView] = useState<'select' | 'manage' | 'form'>('select');
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);

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
    if(confirm('Tem certeza que deseja excluir esta igreja?')) {
      try {
        await churchApi.delete(id); 
        onDelete(id); 
      } catch (error) {
        alert("Erro ao excluir igreja.");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city) return;

    const payload = {
          name: formData.name || '',
          slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, '-') || '', 
          address: formData.address || '',
          city: formData.city || '',
          state: formData.state || '',
          instagram: formData.instagram || '',
          cnpj: formData.cnpj || '',
    };

    try {
        if (editingId) {
            const updatedChurch = await churchApi.update(editingId, payload);
            onEdit(updatedChurch); 
        } else {
            const createdChurch = await churchApi.create(payload);
            onAdd(createdChurch); 
        }
        setView('manage');
    } catch (err) {
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#1e3a8a] opacity-10 blur-3xl"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#2563eb] opacity-10 blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col min-h-[580px]">
        
        {view === 'select' && (
          <div className="flex-1 flex flex-col">
            <div className="pt-12 pb-8 px-8 text-center relative bg-gradient-to-b from-white to-gray-50/30">
               <button 
                 onClick={() => setView('manage')}
                 className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-[#1e3a8a] hover:bg-gray-100 transition-colors"
                 title="Gerenciar Igrejas"
               >
                 <Settings size={20} />
               </button>
               
              <div className="w-20 h-20 bg-[#1e3a8a] rounded-2xl text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/20 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <ChurchIcon size={40} />
              </div>
              
              <h1 className="text-2xl font-bold text-[#0f172a] mb-2">Bem-vindo ao Ecclesia</h1>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">Selecione sua comunidade para acessar o sistema de gestão.</p>
            </div>

            <div className="px-8 pb-8 space-y-6 flex-1 flex flex-col">
              <div className="relative flex-1">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                  Encontre sua Igreja
                </label>
                
                <div className="relative">
                  <div 
                    className={`input-field flex items-center cursor-pointer ${isOpen ? '!border-[#1e3a8a] !ring-2 !ring-blue-100' : ''}`}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <Building2 className={`mr-3 ${selectedChurch ? 'text-[#1e3a8a]' : 'text-gray-400'}`} size={20} />
                    <input
                      type="text"
                      className="bg-transparent border-none outline-none w-full text-gray-900 placeholder-gray-400 font-medium"
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

                  {isOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        {filteredChurches.length > 0 ? (
                          filteredChurches.map((church) => (
                            <div
                              key={church.id}
                              className="px-4 py-3.5 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                              onClick={() => handleSelect(church)}
                            >
                              <div className="flex items-center overflow-hidden">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#eff6ff] text-[#1e3a8a] text-xs font-bold mr-3 shrink-0">
                                  {church.name.charAt(0)}
                                </div>
                                <div className="truncate">
                                  <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-[#1e3a8a]">{church.name}</p>
                                  <p className="text-xs text-gray-500 flex items-center truncate">
                                    <MapPin size={10} className="mr-1" /> {church.city}
                                  </p>
                                </div>
                              </div>
                              {selectedChurch?.id === church.id && (
                                <Check size={16} className="text-[#1e3a8a] ml-2 shrink-0" />
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-gray-400 text-sm">
                            <Building2 size={24} className="mx-auto mb-2 opacity-20" />
                            Nenhuma igreja encontrada.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-auto">
                <button
                  onClick={handleEnterPlatform}
                  disabled={!selectedChurch}
                  className={`btn-primary w-full py-4 text-lg shadow-lg ${!selectedChurch ? '!bg-gray-100 !text-gray-400 !cursor-not-allowed !shadow-none' : ''}`}
                >
                  Acessar Plataforma
                  {selectedChurch && <ArrowRight size={20} className="ml-2" />}
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 px-8 py-5 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                Sua igreja ainda não está aqui? <button onClick={() => setView('manage')} className="text-[#1e3a8a] font-bold hover:underline">Cadastre-se</button>
              </p>
            </div>
          </div>
        )}

        {view === 'manage' && (
            <div className="flex-1 flex flex-col h-full bg-white">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                <div className="flex items-center">
                  <button onClick={() => setView('select')} className="mr-3 p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                  <h2 className="text-lg font-bold text-gray-800">Gerenciar Igrejas</h2>
                </div>
                <button 
                 onClick={startCreate}
                 className="btn-primary p-2.5 !rounded-lg"
                 title="Adicionar Nova"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {churches.length === 0 ? (
                  <div className="text-center text-gray-400 py-16 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Building2 size={32} className="opacity-30" />
                    </div>
                    <p>Nenhuma igreja cadastrada.</p>
                    <button onClick={startCreate} className="mt-4 text-[#1e3a8a] font-bold text-sm hover:underline">
                        Cadastrar a primeira
                    </button>
                  </div>
                ) : (
                  churches.map(church => (
                    <div key={church.id} className="premium-card p-4 flex items-center justify-between group hover:border-blue-200">
                      <div className="flex items-center overflow-hidden mr-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#eff6ff] text-[#1e3a8a] font-bold text-lg shrink-0 mr-4 border border-blue-100"
                        >
                          {church.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800 text-sm truncate">{church.name}</h3>
                          <p className="text-xs text-gray-500 truncate flex items-center mt-0.5">
                            <MapPin size={10} className="mr-1" /> {church.city} - {church.state}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(church)} className="p-2 text-gray-400 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => handleDelete(church.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
        )}

        {view === 'form' && (
          <div className="flex-1 flex flex-col h-full bg-white">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editingId ? 'Editar Igreja' : 'Nova Igreja'}
              </h2>
              <button onClick={() => setView('manage')} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome da Igreja</label>
                <input 
                  type="text" 
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="Ex: Igreja Batista Central"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Slug (URL)</label>
                <div className="flex items-center">
                    <span className="text-gray-400 text-sm mr-2 select-none">ecclesia.com/</span>
                    <input 
                    type="text" 
                    required
                    className="input-field !bg-gray-50 text-sm font-mono"
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    placeholder="igreja-batista"
                    />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Instagram (Opcional)</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={formData.instagram}
                  onChange={e => setFormData({...formData, instagram: e.target.value})}
                  placeholder="@suaigreja"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cidade</label>
                    <input 
                      type="text" 
                      required
                      className="input-field"
                      value={formData.city}
                      onChange={e => setFormData({...formData, city: e.target.value})}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">UF</label>
                      <input 
                        type="text" 
                        required
                        maxLength={2}
                        className="input-field text-center uppercase"
                        value={formData.state}
                        onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})}
                        placeholder="SP"
                      />
                  </div>
              </div>

              <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Endereço</label>
                    <input 
                      type="text" 
                      className="input-field"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      placeholder="Rua das Flores, 123"
                    />
              </div>

              <div className="pt-4 pb-4">
                <button 
                  type="submit" 
                  className="btn-primary w-full py-4 text-lg shadow-lg"
                >
                  <Save size={20} className="mr-2" />
                  Salvar Igreja
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
      
      <p className="mt-8 text-gray-400 text-xs font-medium opacity-60">© 2024 Ecclesia Manager System</p>
    </div>
  );
};

export default ChurchSelector;