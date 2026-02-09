import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Search, Plus, Trash2, Edit2, Calendar, Loader, AlertCircle } from 'lucide-react';
import { Member } from '../types';
import { memberApi } from '../services/api';
import ConfirmationModal from './ConfirmationModal'; // Importe o Modal

interface MembersListProps {
  churchId: string;
}

const MembersListPage: React.FC<MembersListProps> = ({ churchId }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para o Modal de Confirmação
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Abre o modal
  const confirmDelete = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  // Executa a exclusão
  const handleDelete = async () => {
    if (!memberToDelete) return;
    
    setIsDeleting(true);
    try {
      await memberApi.delete(churchId, memberToDelete.id);
      setMembers(members.filter(m => m.id !== memberToDelete.id));
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (error) {
      alert("Erro ao excluir membro."); // Aqui você pode usar um Toast/Notification se tiver
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Modal de Confirmação */}
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Membro"
        description={
            <>
                Tem certeza que deseja excluir o membro <strong>{memberToDelete?.nome}</strong>?
                <br/><br/>
                <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                    Esta ação não pode ser desfeita.
                </span>
            </>
        }
        confirmText="Sim, Excluir"
        isProcessing={isDeleting}
        colorClass="red"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                <User className="text-[#1e3a8a]" size={28} /> Membros
            </h2>
            <p className="text-gray-500 text-sm mt-1">Gerencie o cadastro completo dos membros.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/members/new')}
          className="btn-primary shadow-lg"
        >
          <Plus size={20} className="mr-2" />
          Novo Membro
        </button>
      </div>

      {/* Filtros e Busca */}
      <div className="premium-card p-0 overflow-hidden flex flex-col">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
            <Search size={20} className="text-gray-400" />
            <input 
                type="text" 
                placeholder="Buscar por nome ou email..." 
                className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700 placeholder-gray-400 font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Tabela */}
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex justify-center"><Loader className="animate-spin text-blue-600"/></div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <User size={32} className="opacity-30" />
             </div>
             Nenhum membro encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-gray-400 text-xs uppercase font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Cargo / Ministério</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-[#eff6ff]/40 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center font-bold mr-3 border border-blue-100 uppercase">
                                {member.nome.charAt(0)}
                            </div>
                            <div>
                                <div className="font-semibold text-gray-800 group-hover:text-[#1e3a8a] transition-colors">{member.nome}</div>
                                {member.dataNascimento && (
                                    <div className="text-xs text-gray-400 flex items-center mt-0.5">
                                        <Calendar size={10} className="mr-1"/> 
                                        {new Date(member.dataNascimento).toLocaleDateString('pt-BR')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center mb-1"><Mail size={12} className="mr-1.5 opacity-70"/> {member.email || '-'}</div>
                      <div className="flex items-center"><Phone size={12} className="mr-1.5 opacity-70"/> {member.telefone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                       {member.ministerio || 'Membro'}
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
                      <div className="flex items-center justify-end gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => navigate(`/admin/members/edit/${member.id}`)} 
                            className="p-2 text-gray-400 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Editar"
                          >
                            <Edit2 size={18}/>
                          </button>
                          <button 
                            onClick={() => confirmDelete(member)} 
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Excluir"
                          >
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

export default MembersListPage;