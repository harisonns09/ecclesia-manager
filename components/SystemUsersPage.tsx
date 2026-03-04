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

const userSchema = z.object({
  user: z.string().min(3, "O login deve ter pelo menos 3 caracteres"),
  password: z.string().optional(),
  role: z.string().min(1, "Selecione um nível de acesso"),
});

type UserFormData = z.infer<typeof userSchema>;

interface SystemUser {
  id: string;
  user: string; // ou username, dependendo de como seu backend retorna
  role: string;
}

const SystemUsersPage: React.FC = () => {
  const { currentChurch } = useApp();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SystemUser | null>(null);

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['userRoles', currentChurch?.id],
    queryFn: () => userApi.getRoles(currentChurch!.id), // Envolvemos em uma função anônima
    enabled: !!currentChurch, // Só busca se houver uma igreja
    staleTime: Infinity,
  });

  const { data: users = [], isLoading: isLoadingUsers } = useQuery<SystemUser[]>({
    queryKey: ['users', currentChurch?.id],
    queryFn: () => userApi.getByChurch(currentChurch!.id),
    enabled: !!currentChurch,
  });

  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { user: '', password: '', role: '' }
  });

  // Preenche o formulário quando clica em Editar
  useEffect(() => {
    if (editingUser) {
      reset({ user: editingUser.user, password: '', role: editingUser.role });
    } else {
      reset({ user: '', password: '', role: '' });
    }
  }, [editingUser, reset]);

  const saveUserMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      if (editingUser) {
        return userApi.update(currentChurch!.id, editingUser.id, data);
      }
      return userApi.create(currentChurch!.id, data);
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
    onError: () => toast.error("Erro ao excluir usuário.")
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

  const openEditForm = (user: SystemUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    reset();
  };

  const handleDeleteClick = (user: SystemUser) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const formatRoleName = (roleStr: string) => {
    return roleStr.replace('_', ' ').replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => userToDelete && deleteUserMutation.mutate(userToDelete.id)}
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
          <button onClick={openNewForm} className="btn-primary flex items-center gap-2">
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
        
        <div className="premium-card overflow-hidden">
          {isLoadingUsers ? (
            <div className="p-12 text-center text-gray-500 flex flex-col items-center">
              <Loader className="animate-spin mb-2" size={32} />
              <p>Carregando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Shield className="mx-auto mb-4 text-gray-300 opacity-50" size={64} />
              <p className="text-lg font-medium text-gray-600">Nenhum usuário cadastrado.</p>
              <p className="text-sm mt-1">Clique em "Novo Acesso" para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-bold">Usuário / Login</th>
                    <th className="p-4 font-bold">Nível de Acesso</th>
                    <th className="p-4 font-bold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1e3a8a] flex items-center justify-center font-bold">
                            {user.user.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-gray-800">{user.user}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full border border-blue-200">
                          {formatRoleName(user.role)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                            {deleteUserMutation.isPending ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
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
            <form onSubmit={handleSubmit(onSubmit)} className="premium-card p-8 space-y-6">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-4 mb-4 flex items-center gap-2">
                <UserPlus size={20} className="text-gray-400" /> 
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label-field">Login / E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                    <input 
                      type="text" 
                      className={`input-field !pl-10 ${errors.user ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="admin@igreja.com"
                      {...register('user')}
                    />
                  </div>
                  {errors.user && <p className="text-red-500 text-xs mt-1">{errors.user.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-field">
                      {editingUser ? 'Nova Senha (Opcional)' : 'Senha Temporária'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                      <input 
                        type="password" 
                        className={`input-field !pl-10 ${errors.password ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder={editingUser ? "Deixe em branco para manter" : "••••••"}
                        {...register('password')}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="label-field">Nível de Acesso (Cargo)</label>
                    <select 
                      className={`input-field ${errors.role ? 'border-red-500 bg-red-50' : ''}`}
                      disabled={isLoadingRoles}
                      {...register('role')}
                    >
                      <option value="">Selecione uma opção...</option>
                      {roles.map((r) => (
                        <option key={r} value={r}>{formatRoleName(r)}</option>
                      ))}
                    </select>
                    {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saveUserMutation.isPending}
                className="btn-primary w-full py-4 mt-6 text-lg flex items-center justify-center gap-2"
              >
                {saveUserMutation.isPending ? (
                  <><Loader className="animate-spin" size={20} /> Salvando...</>
                ) : (
                  <><CheckCircle size={20} /> {editingUser ? 'Atualizar Usuário' : 'Cadastrar Usuário'}</>
                )}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
              <h3 className="font-bold text-[#1e3a8a] mb-3 flex items-center gap-2">
                <Shield size={18} /> Sobre as Permissões
              </h3>
              <ul className="space-y-3 text-sm text-blue-900/80">
                <li><strong>Administrador:</strong> Acesso irrestrito a configurações, financeiro e gestão geral.</li>
                <li><strong>Tesoureiro:</strong> Acesso restrito ao módulo Financeiro e Dashboard.</li>
                <li><strong>Líder Kids:</strong> Acesso apenas aos relatórios de crianças e tela de Check-in.</li>
                <li><strong>Membro:</strong> Pode usar o app público, mas não tem acesso administrativo.</li>
              </ul>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SystemUsersPage;