import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, User } from 'lucide-react'; // Removi Calendar se não estiver usando
import { Member, MemberStatus } from '../types';
import api from '../services/api'; // Certifique-se que o caminho está correto

interface MembersProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}

const Members: React.FC<MembersProps> = ({ members, setMembers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  // Adicionei o CPF no estado inicial
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Membro', // Isso será enviado como 'ministerio' para o Java
    status: MemberStatus.ACTIVE,
    birthDate: '',
    cpf: '' // OBRIGATÓRIO NO JAVA
  });

  // 1. CARREGAR DADOS DO BACKEND
  useEffect(() => {
    async function loadMembers() {
      try {
        const response = await api.get('/api/membros');
        // O Java retorna campos em português (nome, dataNascimento). 
        // Precisamos converter para o formato do Typescript (name, birthDate) se os nomes forem diferentes.
        const mappedMembers = response.data.map((item: any) => ({
          id: item.id,
          name: item.nome, // Mapeia 'nome' do Java para 'name' do React
          email: item.email,
          phone: item.telefone,
          role: item.ministerio || 'Membro', // Mapeia 'ministerio' para 'role'
          status: item.status,
          birthDate: item.dataNascimento,
          joinDate: new Date().toISOString() // O backend ainda não retorna data de entrada, mantive atual
        }));
        setMembers(mappedMembers);
      } catch (error) {
        console.error("Erro ao buscar membros:", error);
      }
    }
    loadMembers();
  }, [setMembers]);

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. ENVIAR DADOS PARA O BACKEND
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Monta o objeto EXATAMENTE como o PessoaRequestDTO.java espera
      const payload = {
        nome: newMember.name,
        email: newMember.email,
        telefone: newMember.phone,
        ministerio: newMember.role,
        status: newMember.status,
        dataNascimento: newMember.birthDate, // Formato yyyy-MM-dd
        cpf: newMember.cpf // O Backend exige isso!
      };

      const response = await api.post('/api/membros', payload);

      // Se deu certo, adiciona na lista local convertendo de volta para o padrão do frontend
      const savedMember = response.data; // O Java retorna o PessoaResponseDTO
      
      const memberForFrontend: Member = {
        id: savedMember.id,
        churchId: '', 
        name: savedMember.nome,
        email: savedMember.email,
        phone: savedMember.telefone,
        role: savedMember.ministerio,
        status: savedMember.status as MemberStatus,
        joinDate: new Date().toISOString().split('T')[0],
        birthDate: savedMember.dataNascimento
      };

      setMembers([...members, memberForFrontend]);
      setShowModal(false);
      
      // Limpa o form
      setNewMember({ 
        name: '', email: '', phone: '', role: 'Membro', status: MemberStatus.ACTIVE, birthDate: '', cpf: '' 
      });

    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar membro. Verifique se o CPF é válido e se todos os campos estão preenchidos.");
    }
  };

  const getStatusColor = (status: MemberStatus) => {
    switch (status) {
      case MemberStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case MemberStatus.INACTIVE: return 'bg-red-100 text-red-800';
      case MemberStatus.VISITOR: return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Gestão de Membros</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Novo Membro
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* ... Barra de Busca (igual ao original) ... */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar membros por nome ou cargo..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
             {/* ... Cabeçalho da Tabela (igual ao original) ... */}
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm font-medium">
                <th className="px-6 py-3">Nome</th>
                <th className="px-6 py-3">Contato</th>
                <th className="px-6 py-3">Cargo</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Nascimento</th> {/* Alterei de Data Entrada para Nascimento pois é o dado que temos */}
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 font-semibold">
                        {member.name ? member.name.charAt(0) : '?'}
                      </div>
                      <div className="font-medium text-gray-900">{member.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{member.email}</div>
                    <div className="text-sm text-gray-500">{member.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.role}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                     {/* Tratamento para data pois vem string do JSON */}
                    {member.birthDate ? new Date(member.birthDate).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-blue-600 mr-2">
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => setMembers(members.filter(m => m.id !== member.id))}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum membro encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center">
                <User size={20} className="mr-2 text-blue-600" />
                Novo Membro
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              
              {/* Campo Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                />
              </div>

              {/* NOVO CAMPO CPF (OBRIGATÓRIO PELO JAVA) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                <input 
                  type="text" 
                  required
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMember.cpf}
                  onChange={e => setNewMember({...newMember, cpf: e.target.value})}
                />
              </div>

              {/* Campo Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                />
              </div>

              {/* Telefones e Data */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input 
                    type="tel" 
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMember.phone}
                    onChange={e => setNewMember({...newMember, phone: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                   <input 
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMember.birthDate}
                    onChange={e => setNewMember({...newMember, birthDate: e.target.value})}
                   />
                </div>
              </div>

              {/* Cargo e Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMember.role}
                    onChange={e => setNewMember({...newMember, role: e.target.value})}
                  >
                    <option value="Membro">Membro</option>
                    <option value="Diácono">Diácono</option>
                    <option value="Presbítero">Presbítero</option>
                    <option value="Pastor">Pastor</option>
                    <option value="Músico">Músico</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newMember.status}
                    onChange={e => setNewMember({...newMember, status: e.target.value as MemberStatus})}
                  >
                    <option value={MemberStatus.ACTIVE}>Ativo</option>
                    <option value={MemberStatus.INACTIVE}>Inativo</option>
                    <option value={MemberStatus.VISITOR}>Visitante</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;