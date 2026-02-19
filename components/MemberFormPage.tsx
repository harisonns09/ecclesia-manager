import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Calendar, Save, ArrowLeft, MapPin, Loader, Church as ChurchIcon, FileText, AlertCircle } from 'lucide-react';

import { Member, MemberStatus } from '../types';
import { memberApi } from '../services/api';
import ConfirmationModal from './ConfirmationModal';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

// Importamos o Schema e o Tipo que criamos anteriormente
import { memberSchema, MemberFormData } from '../schemas/memberSchema';

const MemberFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;
    const { currentChurch: church } = useApp();

    const [isLoading, setIsLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempData, setTempData] = useState<MemberFormData | null>(null);

    // 1. Inicialização do React Hook Form
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<MemberFormData>({
        resolver: zodResolver(memberSchema),
        defaultValues: {
            genero: 'M',
            status: MemberStatus.ACTIVE,
            ministerio: 'Membro',
            estadoCivil: 'Solteiro(a)'
        }
    });

    // 2. Carregar dados para edição
    useEffect(() => {
        if (church && isEditing) {
            loadMemberData();
        }
    }, [church, id]);

    const loadMemberData = async () => {
        if (!church) return;
        setIsLoading(true);
        try {
            const member = await memberApi.getById(church.id, id!);
            if (member) {
                // O reset preenche todos os campos do formulário automaticamente
                reset(member as unknown as MemberFormData);
            } else {
                toast.error("Membro não encontrado");
                navigate('/admin/members');
            }
        } catch (error) {
            toast.error("Erro ao carregar dados.");
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Lógica do CEP (usando setValue para atualizar o formulário)
    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
            setLoadingCep(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setValue('endereco', data.logradouro);
                    setValue('bairro', data.bairro);
                    setValue('cidade', data.localidade);
                    setValue('estado', data.uf);
                    toast.success("Endereço preenchido!");
                }
            } catch (error) {
                toast.error("Erro ao buscar CEP.");
            } finally {
                setLoadingCep(false);
            }
        }
    };

    // 4. Formatação de Telefone em Tempo Real
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 11);
        if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
        e.target.value = v;
    };

    // 5. Validação passou: abre o modal de confirmação
    const onPreSubmit = (data: MemberFormData) => {
        setTempData(data);
        setIsModalOpen(true);
    };

    // 6. Confirmação do Modal: Salva no Banco
    const handleConfirmSave = async () => {
        if (!church || !tempData) return;

        const toastId = toast.loading(isEditing ? "Atualizando..." : "Salvando...");

        const payload = {
            ...tempData,
            id: id || '', // Se for novo, id vazio ou gerado pelo banco
            igrejaId: church.id
        } as Member;

        try {
            if (isEditing && id) {
                await memberApi.update(church.id, id, tempData);
                toast.success("Membro atualizado!", { id: toastId });
            } else {
                await memberApi.create(church.id, tempData as Member);
                toast.success("Membro cadastrado!", { id: toastId });
            }
            navigate('/admin/members');
        } catch (error) {
            toast.error("Erro ao salvar dados.", { id: toastId });
        } finally {
            setIsModalOpen(false);
        }
    };

    if (!church) return null;
    if (isLoading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmSave}
                title={isEditing ? "Salvar Alterações" : "Cadastrar Membro"}
                description={<>Deseja confirmar o cadastro de <strong>{tempData?.nome}</strong>?</>}
                confirmText="Sim, Salvar"
                isProcessing={isSubmitting}
                colorClass="emerald"
            />

            <div className="flex items-center gap-4 mb-2">
                <button onClick={() => navigate('/admin/members')} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-[#0f172a]">{isEditing ? 'Editar Membro' : 'Novo Membro'}</h2>
                    <p className="text-gray-500 text-sm">Preencha as informações abaixo.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onPreSubmit)} className="premium-card p-0 overflow-hidden">
                <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-[#0f172a]">Ficha Cadastral</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isEditing ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                        {isEditing ? 'MODO EDIÇÃO' : 'NOVO CADASTRO'}
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Seção 1: Dados Pessoais */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                            <User size={16} className="mr-2" /> Dados Pessoais
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <label className="label-field">Nome Completo</label>
                                <input {...register('nome')} className={`input-field ${errors.nome ? 'border-red-500' : ''}`} placeholder="Nome completo" />
                                {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
                            </div>

                            <div>
                                <label className="label-field">Data de Nascimento</label>
                                <input type="date" {...register('dataNascimento')} className={`input-field ${errors.dataNascimento ? 'border-red-500' : ''}`} />
                                {errors.dataNascimento && <p className="text-red-500 text-xs mt-1">{errors.dataNascimento.message}</p>}
                            </div>

                            <div>
                                <label className="label-field">Gênero</label>
                                <select {...register('genero')} className="input-field bg-white">
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-field">Estado Civil</label>
                                <select {...register('estadoCivil')} className="input-field bg-white">
                                    <option value="Solteiro(a)">Solteiro(a)</option>
                                    <option value="Casado(a)">Casado(a)</option>
                                    <option value="Viúvo(a)">Viúvo(a)</option>
                                    <option value="Divorciado(a)">Divorciado(a)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Seção 2: Contato e Endereço */}
                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                            <MapPin size={16} className="mr-2" /> Contato e Endereço
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="label-field">Email</label>
                                <input type="email" {...register('email')} className="input-field" placeholder="email@exemplo.com" />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="label-field">Telefone / WhatsApp</label>
                                <input
                                    {...register('telefone', { onChange: handlePhoneChange })}
                                    className={`input-field ${errors.telefone ? 'border-red-500' : ''}`}
                                    placeholder="(00) 00000-0000"
                                />
                                {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone.message}</p>}
                            </div>

                            <div className="relative">
                                <label className="label-field">CEP {loadingCep && <Loader size={12} className="inline animate-spin text-blue-600" />}</label>
                                <input {...register('cep')} onBlur={handleCepBlur} className="input-field" placeholder="00000-000" />
                                {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="label-field">Endereço (Rua)</label>
                                <input {...register('endereco')} className="input-field" />
                            </div>
                            <div>
                                <label className="label-field">Número</label>
                                <input {...register('numero')} className="input-field" />
                            </div>
                            <div>
                                <label className="label-field">Complemento</label>
                                <input {...register('complemento')} className="input-field" />
                            </div>
                            <div>
                                <label className="label-field">Bairro</label>
                                <input {...register('bairro')} className="input-field" />
                            </div>
                            <div>
                                <label className="label-field">Cidade</label>
                                <input {...register('cidade')} className="input-field" />
                            </div>
                            <div>
                                <label className="label-field">Estado (UF)</label>
                                <input {...register('estado')} className="input-field uppercase" maxLength={2} />
                            </div>
                        </div>
                    </div>

                    {/* Seção 3: Dados Eclesiásticos */}
                    <div className="border-t border-gray-100 pt-6">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                            <ChurchIcon size={16} className="mr-2" /> Vida Eclesiástica
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="label-field">Ministério / Cargo</label>
                                <select {...register('ministerio')} className="input-field bg-white">
                                    <option value="Membro">Membro</option>
                                    <option value="Líder">Líder</option>
                                    <option value="Diácono">Diácono</option>
                                    <option value="Presbítero">Presbítero</option>
                                    <option value="Pastor">Pastor</option>
                                    <option value="Músico">Músico</option>
                                </select>
                            </div>
                            <div>
                                <label className="label-field">Status</label>
                                <select {...register('status')} className="input-field bg-white">
                                    <option value="Ativo">Ativo</option>
                                    <option value="Inativo">Inativo</option>
                                    <option value="Visitante">Visitante</option>
                                </select>
                            </div>

                            <div>
                                <label className="label-field">Data de Batismo</label>
                                <input type="date" {...register('dataBatismo')} className="input-field" />
                                {errors.dataBatismo && <p className="text-red-500 text-xs mt-1">{errors.dataBatismo.message}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button type="button" onClick={() => navigate('/admin/members')} className="btn-secondary">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="btn-primary shadow-md px-6">
                            <Save size={18} className="mr-2" /> {isEditing ? 'Salvar Alterações' : 'Cadastrar Membro'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default MemberFormPage;