import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, UserPlus, Mail, Lock, Loader, CheckCircle, Edit2, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';
import { userApi } from '../services/api';
import ConfirmationModal from './ConfirmationModal';
import { User, UserRole } from '../types'; // IMPORTAÇÃO CORRETA DOS TIPOS GLOBAIS

const userSchema = z.object({
  user: z.string().min(3, "O login deve ter pelo menos 3 caracteres"),
  password: z.string().optional(),
  role: z.string().min(1, "Selecione um nível de acesso"),
});

type UserFormData = z.infer<typeof userSchema>;

const SystemUsersPage: React.FC = () => {
  const { currentChurch } = useApp();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['userRoles', currentChurch?.id],
    queryFn: () => userApi.getRoles(currentChurch!.id),
    enabled: !!currentChurch,
    staleTime: Infinity,
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['users', currentChurch?.id],
    queryFn: () => userApi.getByChurch(currentChurch!.id),
    enabled: !!currentChurch,
  });

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { user: '', password: '', role: '' }
  });

  useEffect(() => {
    if (editingUser) {
      reset({ user: editingUser.user, password: '', role: editingUser.role });
    } else {
      reset({ user: '', password: '', role: '' });
    }
  }, [editingUser, reset]);

  const saveUserMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      // Cria o payload seguindo estritamente a interface esperada
      const payload = {
          user: data.user,
          password: data.password,
          role: data.role as UserRole
      };

      if (editingUser) {
        return userApi.update(currentChurch!.id, editingUser.id, payload);
      }
      return userApi.create(currentChurch!.id, payload);
    },
    onSuccess: () => {
      toast.success(editingUser ? "Usuário atualizado!" : "Usuário criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ['users', currentChurch?.id] });
      closeForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erro ao salvar usuário. O login já existe?");
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userApi.delete(currentChurch!.id, userId),
    onSuccess: () => {
      toast.success("Acesso revogado com sucesso.");
      queryClient.invalidateQueries({ queryKey: ['users', currentChurch?.id] });
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    },
    onError: () => {
        toast.error("Erro ao excluir usuário.");
        setIsDeleteModalOpen(false);
    }
  });

  const onSubmit = (data: UserFormData) => {
    if (!currentChurch) return;

    if (!editingUser && (!data.password || data.password.length < 6)) {
      setError('password', { message: 'A senha deve ter pelo menos 6 caracteres' });
      return;
    }

    saveUserMutation.mutate(data);
  };

  const openNewForm = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    reset();
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
      if (userToDelete) {
          deleteUserMutation.mutate(userToDelete.id);
      }
  };

  const formatRoleName = (roleStr: string) => {
    return roleStr.replace('_', ' ').replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => !deleteUserMutation.isPending && setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Revogar Acesso"
        description={<>Tem certeza que deseja remover o acesso de <strong>{userToDelete?.user}</strong>? Ele não poderá mais logar no sistema.</>}
        confirmText="Sim, Revogar"
        isProcessing={deleteUserMutation.isPending}
        colorClass="red"
      />

      <div className="mb-8 border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a] mb-1 flex items-center gap-2">
            <Shield className="text-[#1e3a8a]" /> Gerenciar Acessos
          </h1>
          <p className="text-gray-500 text-sm">
            {isFormOpen ? "Preencha os dados do acesso." : "Gerencie as credenciais da equipe da sua igreja."}
          </p>
        </div>

        {!isFormOpen ? (
          <button onClick={openNewForm} className="btn-primary flex items-center gap-2 shadow-md">
            <Plus size={20} /> Novo Acesso
          </button>
        ) : (
          <button onClick={closeForm} className="btn-secondary flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors font-medium">
            <ArrowLeft size={18} /> Voltar para Lista
          </button>
        )}
      </div>

      {/* CONDICIONAL: LISTA OU FORMULÁRIO */}
      {!isFormOpen ? (
        
        <div className="premium-card overflow-hidden border border-gray-200 shadow-sm">
          {isLoadingUsers ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <Loader className="animate-spin text-blue-600 mb-3" size={40} />
              <p className="font-medium">Carregando acessos...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-16 text-center text-gray-400 bg-gray-50/50">
              <Shield className="mx-auto mb-4 text-gray-300 opacity-50" size={56} />
              <p className="text-lg font-bold text-gray-600 mb-1">Nenhum usuário cadastrado.</p>
              <p className="text-sm">Clique no botão acima para adicionar a liderança.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-[11px] font-extrabold uppercase tracking-wider">
                    <th className="px-6 py-4">Usuário / Login</th>
                    <th className="px-6 py-4">Nível de Acesso</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold uppercase shadow-sm">
                            {user.user.charAt(0)}
                          </div>
                          <span className="font-bold text-gray-800">{user.user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            user.role === 'TESOUREIRO' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            user.role === 'KIDS' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {formatRoleName(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => openEditForm(user)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(user)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
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

      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-right-8 duration-300">
          
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="premium-card p-8 space-y-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-[#0f172a] border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
                <UserPlus size={22} className="text-blue-600" /> 
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Login / E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      className={`input-field !pl-10 ${errors.user ? 'border-red-300 bg-red-50 ring-1 ring-red-100' : ''}`}
                      placeholder="admin@igreja.com"
                      {...register('user')}
                    />
                  </div>
                  {errors.user && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.user.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {editingUser ? 'Nova Senha (Opcional)' : 'Senha Temporária'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                      <input 
                        type="password" 
                        className={`input-field !pl-10 ${errors.password ? 'border-red-300 bg-red-50 ring-1 ring-red-100' : ''}`}
                        placeholder={editingUser ? "Deixe em branco para manter" : "••••••"}
                        {...register('password')}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nível de Acesso (Cargo)</label>
                    <select 
                      className={`input-field ${errors.role ? 'border-red-300 bg-red-50 ring-1 ring-red-100' : ''}`}
                      disabled={isLoadingRoles}
                      {...register('role')}
                    >
                      <option value="">Selecione uma opção...</option>
                      {roles.map((r) => (
                        <option key={r} value={r}>{formatRoleName(r)}</option>
                      ))}
                    </select>
                    {errors.role && <p className="text-red-500 text-xs font-medium mt-1.5">{errors.role.message}</p>}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-gray-100">
                  <button 
                    type="submit" 
                    disabled={saveUserMutation.isPending}
                    className="btn-primary w-full py-3.5 text-[15px] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {saveUserMutation.isPending ? (
                      <><Loader className="animate-spin" size={20} /> Salvando dados...</>
                    ) : (
                      <><CheckCircle size={20} /> {editingUser ? 'Atualizar Permissões' : 'Criar Acesso Seguro'}</>
                    )}
                  </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 h-full">
              <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-indigo-600" /> Sobre as Permissões
              </h3>
              <ul className="space-y-4 text-sm text-indigo-900/80">
                <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0"></div>
                    <span><strong>Administrador:</strong> Acesso irrestrito a configurações, financeiro e gestão geral.</span>
                </li>
                <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                    <span><strong>Tesoureiro:</strong> Acesso restrito ao módulo Financeiro e Dashboard.</span>
                </li>
                <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0"></div>
                    <span><strong>Líder Kids:</strong> Acesso apenas aos relatórios de crianças e Check-in.</span>
                </li>
                <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0"></div>
                    <span><strong>Membro:</strong> Pode usar o app público, mas não tem acesso administrativo.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SystemUsersPage;