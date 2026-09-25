import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, ArrowLeft, Loader, ShoppingBag, DollarSign, Package, FileText, Image as ImageIcon, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';

import { Product } from '../types';
import { productApi } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

const productSchema = z.object({
    nome: z.string().min(1, "O nome do produto é obrigatório."),
    descricao: z.string().optional(),
    preco: z.coerce.number().min(0, "O preço não pode ser negativo.").default(0),
    estoque: z.coerce.number().int("O estoque deve ser um número inteiro.").min(0, "O estoque não pode ser negativo.").default(0),
    imageUrl: z.string().url("A URL da imagem deve ser válida.").optional().or(z.literal('')),
    ativo: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;
    const { currentChurch: church } = useApp();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as any, // <-- Adicione 'as any' aqui
        defaultValues: {
            nome: '',
            descricao: '',
            preco: 0,
            estoque: 0,
            imageUrl: '',
            ativo: true,
        }
    });

    const isAtivo = watch('ativo');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['product', id],
        queryFn: () => {
            // Verificamos 'church' diretamente para o TypeScript entender que daqui pra baixo não é null
            if (!church) throw new Error("Igreja não selecionada");
            return productApi.getById(church.id, id!);
        },
        enabled: isEditing && !!church?.id,
    });

    // Preenche os dados quando a requisição for concluída com sucesso (Substitui onSuccess do React Query v4)
    useEffect(() => {
        if (data) {
            reset(data);
        }
    }, [data, reset]);

    // Trata erros da requisição (Substitui onError do React Query v4)
    useEffect(() => {
        if (isError) {
            toast.error("Produto não encontrado.");
            navigate('/admin/products');
        }
    }, [isError, navigate]);

    // Reseta o formulário se mudar da página de edição para a de criação
    useEffect(() => {
        if (!isEditing) {
            reset({
                nome: '',
                descricao: '',
                preco: 0,
                estoque: 0,
                imageUrl: '',
                ativo: true,
            });
        }
    }, [isEditing, reset]);

    const saveMutation = useMutation({
        mutationFn: (formData: ProductFormData) => {
            if (!church) throw new Error("Igreja não selecionada.");

            const payload = {
                ...formData,
                igrejaId: church.id
            };

            return isEditing
                ? productApi.update(church.id, id!, payload)
                : productApi.create(church.id, payload);
        },
        onSuccess: () => {
            toast.success("Produto salvo com sucesso!");
            // Adicionamos o '?' (optional chaining) aqui para evitar o erro de possible null
            queryClient.invalidateQueries({ queryKey: ['products', church?.id] });
            navigate('/admin/products');
        },
        onError: () => toast.error("Erro ao salvar o produto.")
    });

    const onSubmit = (formData: ProductFormData) => {
        if (!church) return;
        saveMutation.mutate(formData);
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-600" /></div>;

    // Opcional: Como o useEffect de isError agora redireciona, este componente de fallback 
    // pode piscar muito brevemente, mas é bom mantê-lo por precaução.
    if (isError) return (
        <div className="flex flex-col items-center justify-center p-10 text-red-600 bg-red-50 rounded-lg">
            <AlertCircle size={40} className="mb-2" />
            <p>Ocorreu um erro ao carregar os dados do produto.</p>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex items-center mb-8">
                <button onClick={() => navigate('/admin/products')} className="mr-4 p-2 hover:bg-gray-200 rounded-full text-gray-500">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-[#0f172a]">
                        {isEditing ? 'Editar Produto' : 'Novo Produto'}
                    </h1>
                    <p className="text-gray-500 text-sm">Preencha as informações do item.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="premium-card p-8 space-y-6">
                <div>
                    <label className="label-field">Nome do Produto</label>
                    <input {...register('nome')} className={`input-field ${errors.nome ? 'border-red-500' : ''}`} placeholder="Ex: Camiseta do evento" />
                    {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="label-field">Preço (R$)</label>
                        <div className="relative">
                            <DollarSign size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input type="number" step="0.01" {...register('preco')} className={`input-field !pl-10 ${errors.preco ? 'border-red-500' : ''}`} />
                        </div>
                        {errors.preco && <p className="text-red-500 text-xs mt-1">{errors.preco.message}</p>}
                    </div>
                    <div>
                        <label className="label-field">Estoque (Unidades)</label>
                        <div className="relative">
                            <Package size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input type="number" {...register('estoque')} className={`input-field !pl-10 ${errors.estoque ? 'border-red-500' : ''}`} />
                        </div>
                        {errors.estoque && <p className="text-red-500 text-xs mt-1">{errors.estoque.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="label-field">Descrição</label>
                    <div className="relative">
                        <FileText size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        <textarea {...register('descricao')} rows={3} className="input-field !pl-10 resize-none" placeholder="Detalhes do produto, material, tamanho..."></textarea>
                    </div>
                </div>

                <div>
                    <label className="label-field">URL da Imagem</label>
                    <div className="relative">
                        <ImageIcon size={18} className="absolute left-3 top-3.5 text-gray-400" />
                        <input {...register('imageUrl')} className={`input-field !pl-10 ${errors.imageUrl ? 'border-red-500' : ''}`} placeholder="https://exemplo.com/imagem.png" />
                    </div>
                    {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
                </div>

                <div>
                    <label className="label-field">Status do Produto</label>
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer border border-gray-200 hover:bg-gray-100">
                        <input type="checkbox" {...register('ativo')} className="hidden" />
                        {isAtivo ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-gray-400" />}
                        <span className="text-sm text-gray-600 font-medium">
                            {isAtivo ? 'Produto Ativo (Visível na loja)' : 'Produto Inativo (Oculto na loja)'}
                        </span>
                    </label>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                    <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" disabled={saveMutation.isPending} className="btn-primary shadow-lg">
                        {saveMutation.isPending ? <Loader className="animate-spin" /> : <Save size={20} />}
                        <span>{isEditing ? 'Salvar Alterações' : 'Criar Produto'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;