import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Search, Plus, Trash2, Edit2, Calendar, Loader, ChevronLeft, ChevronRight, Mail, Phone } from 'lucide-react';
import { Member } from '../types';
import { memberApi } from '../services/api';
import ConfirmationModal from './ConfirmationModal';
import { formatPhoneNumber } from './utils/formatters';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

// Hook simples de Debounce para não sobrecarregar o servidor
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const MembersListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentChurch: church } = useApp();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500); // Aguarda 500ms após parar de digitar
  
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [page, setPage] = useState(0);
  const size = 10;

  // --- BUSCA DE DADOS ---
  const { data, isLoading, isFetching } = useQuery({
    // Usamos o debouncedSearch na queryKey para disparar a busca apenas após o delay
    queryKey: ['members', church?.id, page, debouncedSearch, selectedMonth, selectedGender, minAge, maxAge],
    queryFn: () => memberApi.getByChurchPaged(church!.id, {
      page,
      size,
      searchTerm: debouncedSearch,
      month: selectedMonth,
      gender: selectedGender,
      minAge,
      maxAge
    }),
    enabled: !!church?.id,
    placeholderData: (previousData) => previousData, // Mantém os dados antigos na tela enquanto carrega os novos (evita flickering)
  });

  // --- MUTATION PARA DELETAR ---
  const deleteMutation = useMutation({
    mutationFn: (memberId: string) => memberApi.delete(church!.id, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success("Membro excluído com sucesso");
      setIsDeleteModalOpen(false);
    },
    onError: () => toast.error("Erro ao excluir membro")
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Reseta para página 0 ao filtrar
  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, selectedMonth, selectedGender, minAge, maxAge]);

  const members: Member[] = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const calculateAge = (dobString: string) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  // Lógica para mostrar páginas ao redor da atual (Sliding Window)
  const renderPageButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, page - 2);
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
            page === i ? 'bg-blue-600 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {i + 1}
        </button>
      );
    }
    return buttons;
  };

  if (!church) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => memberToDelete && deleteMutation.mutate(memberToDelete.id)}
        title="Excluir Membro"
        description={<>Deseja excluir permanentemente <strong>{memberToDelete?.nome}</strong>?</>}
        confirmText="Sim, Excluir"
        isProcessing={deleteMutation.isPending}
        colorClass="red"
      />

      {/* Header e Filtros - Mantidos conforme seu código com pequenas melhorias visuais */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl">
             <User className="text-[#1e3a8a]" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Membros</h2>
            <p className="text-gray-500 text-sm">Total de {totalElements} registros</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin/members/new')} className="btn-primary shadow-lg">
          <Plus size={20} className="mr-2" /> Novo Membro
        </button>
      </div>

      <div className="premium-card p-0 overflow-hidden flex flex-col">
        {/* BARRA DE PESQUISA COM INDICADOR DE CARREGAMENTO */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 space-y-4">
            <div className="relative w-full">
                <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por nome ou email..." 
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
                {/* Mostra o loader se o Query estiver buscando (incluindo background fetch) */}
                {isFetching && <Loader className="absolute right-3 top-3 animate-spin text-blue-400" size={16} />}
            </div>

            {/* Outros filtros... (selectedMonth, gender, etc - manter conforme seu código) */}
        </div>

        {/* TABELA */}
        <div className="overflow-x-auto relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/50 backdrop-blur-[1px] z-10">
               <Loader className="animate-spin text-blue-600" size={40} />
               <p className="text-sm text-gray-500 font-medium">Acessando registros...</p>
            </div>
          ) : members.length === 0 ? (
            <div className="py-20 text-center text-gray-500">Nenhum membro encontrado.</div>
          ) : (
            <table className="w-full text-left">
                {/* Tabela igual ao seu código... */}
                <thead>
                    <tr className="bg-white text-gray-400 text-[11px] uppercase font-extrabold border-b border-gray-100 tracking-wider">
                        <th className="px-6 py-4">Membro</th>
                        <th className="px-6 py-4">Contato</th>
                        <th className="px-6 py-4">Ministério</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className={`divide-y divide-gray-50 transition-opacity ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                    {members.map(member => (
                        <tr key={member.id} className="hover:bg-[#eff6ff]/40 group transition-colors">
                            {/* Conteúdo da TR igual ao seu... */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold border border-blue-200 uppercase">
                                        {member.nome.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{member.nome}</div>
                                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                                            {member.dataNascimento && <><Calendar size={10}/> {calculateAge(member.dataNascimento)} anos</>}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm">
                                <div className="flex items-center gap-2 text-gray-600"><Mail size={12}/> {member.email || '-'}</div>
                                <div className="flex items-center gap-2 text-gray-500 text-xs mt-1"><Phone size={12}/> {formatPhoneNumber(member.telefone)}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">{member.ministerio || 'Membro'}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${member.status === 'Ativo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>
                                    {member.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => navigate(`/admin/members/edit/${member.id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                                    <button onClick={() => { setMemberToDelete(member); setIsDeleteModalOpen(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}
        </div>

        {/* PAGINAÇÃO DINÂMICA */}
        {!isLoading && totalPages > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-gray-400 uppercase">
               Página {page + 1} de {totalPages}
            </span>
            
            <div className="flex gap-2">
              <button 
                disabled={page === 0 || isFetching}
                onClick={() => setPage(p => p - 1)}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex gap-1">
                {renderPageButtons()}
              </div>

              <button 
                disabled={page + 1 >= totalPages || isFetching}
                onClick={() => setPage(p => p + 1)}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembersListPage;