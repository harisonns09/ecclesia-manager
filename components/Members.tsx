import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Search, Plus, Filter, Trash2, Edit2, X, Save, FileText } from 'lucide-react';
import { Member, MemberStatus } from '../types';
import { memberApi } from '../services/api';

interface MembersProps {
  churchId: string;
}

const Members: React.FC<MembersProps> = ({ churchId }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Member>>({
    nome: '', email: '', telefone: '', ministerio: 'Membro', status: MemberStatus.ACTIVE,
    cpf: ''
  });

  useEffect(() => {
    if (churchId) loadMembers();
  }, [churchId]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await memberApi.getByChurch(churchId);
      setMembers(data);
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId) return alert("Erro: Nenhuma igreja selecionada.");

    try {
      if (editingId) {
        const updated = await memberApi.update(churchId, editingId, formData);
        setMembers(members.map(m => m.id === editingId ? updated : m));
      } else {
        const created = await memberApi.create(churchId, formData as Member);
        setMembers([...members, created]);
      }
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar membro.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir membro?')) return;
    try {
      await memberApi.delete(churchId, id);
      setMembers(members.filter(m => m.id !== id));
    } catch (error) {
      alert("Erro ao excluir.");
    }
  };

  const startEdit = (member: Member) => {
    setEditingId(member.id);
    setFormData(member);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      nome: '', email: '', telefone: '', ministerio: 'Membro', status: MemberStatus.ACTIVE,
      cpf: ''
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Membros</h2>
            <p className="text-gray-500 text-sm mt-1">Gerencie o cadastro de membros da igreja.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={showForm ? "btn-secondary" : "btn-primary shadow-lg"}
        >
          {showForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
          {showForm ? 'Cancelar' : 'Novo Membro'}
        </button>
      </div>

      {showForm && (
        <div className="premium-card p-0 overflow-hidden animate-in slide-in-from-top-4 mb-8">
          <div className="bg-gray-50/50 p-6 border-b border-gray-100">
             <h3 className="font-bold text-lg text-[#0f172a]">{editingId ? 'Editar Membro' : 'Cadastro de Membro'}</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome Completo</label>
                <div className="relative">
                    <input 
                        required 
                        className="input-field pl-10"
                        value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}
                        placeholder="Nome completo do membro"
                    />
                    <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                    <input 
                        type="email" 
                        className="input-field pl-10"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                        placeholder="email@exemplo.com"
                    />
                    <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone</label>
                <div className="relative">
                    <input 
                        className="input-field pl-10"
                        value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} 
                        placeholder="(00) 00000-0000"
                    />
                    <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">CPF</label>
                <div className="relative">
                    <input 
                        className="input-field pl-10"
                        value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} 
                        placeholder="000.000.000-00"
                    />
                    <FileText size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
               <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                 Cancelar
               </button>
               <button type="submit" className="btn-primary shadow-md">
                 <Save size={18} className="mr-2" /> Salvar
               </button>
            </div>
          </form>
        </div>
      )}

      <div className="premium-card p-0 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Carregando membros...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <User size={32} className="opacity-30" />
             </div>
             Nenhum membro encontrado nesta igreja.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-gray-400 text-xs uppercase font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-[#eff6ff]/40 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center font-bold mr-3 border border-blue-100">
                                {member.nome.charAt(0)}
                            </div>
                            <span className="font-semibold text-gray-800 group-hover:text-[#1e3a8a] transition-colors">{member.nome}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center mb-1"><Mail size={12} className="mr-1.5 opacity-70"/> {member.email || '-'}</div>
                      <div className="flex items-center"><Phone size={12} className="mr-1.5 opacity-70"/> {member.telefone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                          member.status === 'Ativo' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(member)} className="p-2 text-gray-400 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                            <Edit2 size={18}/>
                          </button>
                          <button onClick={() => handleDelete(member.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                            <Trash2 size={18}/>
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;