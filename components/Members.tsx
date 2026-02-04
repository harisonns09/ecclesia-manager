import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Search, Plus, Filter, Trash2, Edit2, X, Save } from 'lucide-react';
import { Member, MemberStatus } from '../types';
import { memberApi } from '../services/api';

// IMPORTANTE: Interface define que churchId é obrigatório
interface MembersProps {
  churchId: string;
}

const Members: React.FC<MembersProps> = ({ churchId }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estado do formulário
  const [formData, setFormData] = useState<Partial<Member>>({
    nome: '', email: '', telefone: '', ministerio: 'Membro', status: MemberStatus.ACTIVE,
    cpf: ''
  });

  // Carrega membros SEMPRE que o churchId mudar
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
        // Editando
        const updated = await memberApi.update(churchId, editingId, formData);
        setMembers(members.map(m => m.id === editingId ? updated : m));
      } else {
        // Criando (API injeta igrejaId)
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <User className="mr-2 text-blue-600" /> Membros
        </h2>
        <button 
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors shadow-sm"
        >
          {showForm ? <X size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
          {showForm ? 'Cancelar' : 'Novo Membro'}
        </button>
      </div>

      {/* Formulário de Cadastro/Edição */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-lg">
          <h3 className="font-bold text-lg mb-4 text-gray-700">{editingId ? 'Editar Membro' : 'Cadastro de Membro'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Nome Completo" 
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} required 
            />
            <input 
              placeholder="Email" type="email"
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
            />
            <input 
              placeholder="Telefone" 
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} 
            />
            <input 
              placeholder="CPF" 
              className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} 
            />
            <div className="col-span-1 md:col-span-2 flex justify-end gap-2 mt-2">
               <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium flex items-center">
                 <Save size={18} className="mr-2" /> Salvar
               </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Membros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando membros...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum membro encontrado nesta igreja.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Nome</th>
                  <th className="p-4 font-semibold text-gray-600">Contato</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {members.map(member => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{member.nome}</td>
                    <td className="p-4 text-gray-600 text-sm">
                      <div>{member.email}</div>
                      <div>{member.telefone}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${member.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => startEdit(member)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18}/></button>
                      <button onClick={() => handleDelete(member.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
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