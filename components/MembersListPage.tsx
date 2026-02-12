import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Search, Plus, Trash2, Edit2, Calendar, Loader, ChevronLeft, ChevronRight, Filter, Users } from 'lucide-react';
import { Member } from '../types';
import { memberApi } from '../services/api';
import ConfirmationModal from './ConfirmationModal';
import { formatDate, formatPhoneNumber } from './utils/formatters'; // Importando do arquivo utils

interface MembersListProps {
  churchId: string;
}

const MembersListPage: React.FC<MembersListProps> = ({ churchId }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // --- FILTROS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(''); 
  const [selectedGender, setSelectedGender] = useState(''); 
  const [minAge, setMinAge] = useState(''); 
  const [maxAge, setMaxAge] = useState(''); 

  // --- PAGINAÇÃO ---
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para o Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (churchId) loadMembers();
  }, [churchId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedMonth, selectedGender, minAge, maxAge]);

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

  const confirmDelete = (member: Member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete) return;
    
    setIsDeleting(true);
    try {
      await memberApi.delete(churchId, memberToDelete.id);
      setMembers(members.filter(m => m.id !== memberToDelete.id));
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    } catch (error) {
      alert("Erro ao excluir membro.");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- HELPER: CALCULAR IDADE ---
  const calculateAge = (dobString: string) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  // --- HELPER: INPUT POSITIVO ---
  const handlePositiveIntegerChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
        setter(value);
    }
  };

  // --- LÓGICA DE FILTRAGEM ---
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
        m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMonth = selectedMonth === '' || 
        (m.dataNascimento && m.dataNascimento.split('-')[1] === selectedMonth);

    const matchesGender = selectedGender === '' || m.genero === selectedGender;

    let matchesAge = true;
    if ((minAge || maxAge) && m.dataNascimento) {
        const age = calculateAge(m.dataNascimento);
        const min = minAge ? parseInt(minAge) : 0;
        const max = maxAge ? parseInt(maxAge) : 200;
        
        matchesAge = age >= min && age <= max;
    } else if ((minAge || maxAge) && !m.dataNascimento) {
        matchesAge = false;
    }

    return matchesSearch && matchesMonth && matchesGender && matchesAge;
  });

  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedMembers = filteredMembers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const months = [
    { value: '01', label: 'Janeiro' }, { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' }, { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' }, { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' }, { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' }, { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' }, { value: '12', label: 'Dezembro' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
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

      <div className="premium-card p-0 overflow-hidden flex flex-col">
        
        {/* --- BARRA DE FILTROS --- */}
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col gap-4">
            
            <div className="relative w-full">
                <Search size={20} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar por nome ou email..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="flex flex-wrap gap-3">
                
                <div className="relative min-w-[180px] flex-1">
                    <Filter size={16} className="absolute left-3 top-3 text-gray-400" />
                    <select 
                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 appearance-none cursor-pointer"
                        value={selectedMonth}
                        onChange={e => setSelectedMonth(e.target.value)}
                    >
                        <option value="">Mês Aniversário</option>
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>

                <div className="relative min-w-[140px] flex-1">
                    <Users size={16} className="absolute left-3 top-3 text-gray-400" />
                    <select 
                        className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 appearance-none cursor-pointer"
                        value={selectedGender}
                        onChange={e => setSelectedGender(e.target.value)}
                    >
                        <option value="">Todos (Gênero)</option>
                        <option value="M">Masculino</option>
                        <option value="F">Feminino</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                    <span className="text-xs font-bold text-gray-400 uppercase mr-1">Idade:</span>
                    <input 
                        type="number" 
                        min="0"
                        placeholder="Min"
                        className="w-12 text-sm border-b border-gray-200 focus:border-blue-500 focus:outline-none text-center"
                        value={minAge}
                        onChange={handlePositiveIntegerChange(setMinAge)}
                    />
                    <span className="text-gray-400 text-xs">até</span>
                    <input 
                        type="number" 
                        min="0"
                        placeholder="Max"
                        className="w-12 text-sm border-b border-gray-200 focus:border-blue-500 focus:outline-none text-center"
                        value={maxAge}
                        onChange={handlePositiveIntegerChange(setMaxAge)}
                    />
                </div>

                {(searchTerm || selectedMonth || selectedGender || minAge || maxAge) && (
                    <button 
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedMonth('');
                            setSelectedGender('');
                            setMinAge('');
                            setMaxAge('');
                        }}
                        className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                        Limpar
                    </button>
                )}
            </div>
        </div>

        {/* Tabela */}
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 flex justify-center"><Loader className="animate-spin text-blue-600"/></div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <User size={32} className="opacity-30" />
             </div>
             Nenhum membro encontrado com os filtros atuais.
          </div>
        ) : (
          <>
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
                    {paginatedMembers.map(member => {
                        const age = member.dataNascimento ? calculateAge(member.dataNascimento) : null;
                        
                        return (
                        <tr key={member.id} className="hover:bg-[#eff6ff]/40 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 rounded-full bg-[#eff6ff] text-[#1e3a8a] flex items-center justify-center font-bold mr-3 border border-blue-100 uppercase">
                                        {member.nome.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-800 group-hover:text-[#1e3a8a] transition-colors">{member.nome}</div>
                                        {member.dataNascimento && (
                                            <div className="text-xs text-gray-400 flex items-center mt-0.5 gap-2">
                                                <span className="flex items-center">
                                                    <Calendar size={10} className="mr-1"/> 
                                                    {formatDate(member.dataNascimento)}
                                                </span>
                                                {age !== null && (
                                                    <span className="bg-gray-100 text-gray-500 px-1.5 rounded text-[10px] font-bold">
                                                        {age} anos
                                                    </span>
                                                )}
                                                {member.genero && (
                                                    <span className={`px-1.5 rounded text-[10px] font-bold ${member.genero === 'M' ? 'text-blue-600 bg-blue-50' : 'text-pink-600 bg-pink-50'}`}>
                                                        {member.genero}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                                <div className="flex items-center mb-1">
                                    <Mail size={12} className="mr-1.5 opacity-70"/> {member.email || '-'}
                                </div>
                                <div className="flex items-center">
                                    <Phone size={12} className="mr-1.5 opacity-70"/> 
                                    {/* USANDO O IMPORTED HELPER */}
                                    {formatPhoneNumber(member.telefone)}
                                </div>
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
                    )})}
                </tbody>
                </table>
            </div>

            {/* Controles de Paginação */}
            {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 gap-4">
                    <div className="text-sm text-gray-500">
                        Mostrando <strong>{startIndex + 1}</strong> a <strong>{Math.min(startIndex + ITEMS_PER_PAGE, filteredMembers.length)}</strong> de <strong>{filteredMembers.length}</strong> resultados
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = i + 1; 
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                            currentPage === pageNum
                                            ? 'bg-[#1e3a8a] text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            {totalPages > 5 && <span className="px-1 self-end text-gray-400">...</span>}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MembersListPage;