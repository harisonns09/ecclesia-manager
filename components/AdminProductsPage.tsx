import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Plus, Trash2, Edit2, Loader, DollarSign, Package, ToggleRight, ToggleLeft } from 'lucide-react';
import { Product } from '../types';
import { productApi } from '../services/api';
import ConfirmationModal from './ConfirmationModal';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

const AdminProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentChurch: church } = useApp();
  const queryClient = useQueryClient();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products', church?.id],
    queryFn: () => productApi.getByChurch(church!.id),
    enabled: !!church?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => productApi.delete(church!.id, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', church?.id] });
      toast.success("Produto excluído com sucesso");
      setIsDeleteModalOpen(false);
    },
    onError: () => toast.error("Erro ao excluir produto")
  });

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  if (!church) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => productToDelete && deleteMutation.mutate(productToDelete.id)}
        title="Excluir Produto"
        description={<>Deseja excluir permanentemente o produto <strong>{productToDelete?.nome}</strong>?</>}
        confirmText="Sim, Excluir"
        isProcessing={deleteMutation.isPending}
        colorClass="red"
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl">
            <ShoppingBag className="text-[#1e3a8a]" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Produtos da Loja</h2>
            <p className="text-gray-500 text-sm">Total de {products.length} itens cadastrados</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin/products/new')} className="btn-primary shadow-lg">
          <Plus size={20} className="mr-2" /> Novo Produto
        </button>
      </div>

      <div className="premium-card p-0 overflow-hidden flex flex-col">
        <div className="overflow-x-auto relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/50">
              <Loader className="animate-spin text-blue-600" size={40} />
              <p className="text-sm text-gray-500 font-medium">Carregando produtos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-gray-500">Nenhum produto cadastrado.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-gray-400 text-[11px] uppercase font-extrabold border-b border-gray-100 tracking-wider">
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Preço</th>
                  <th className="px-6 py-4">Estoque</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-[#eff6ff]/40 group transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img 
                          src={product.imageUrl || 'https://via.placeholder.com/150'} 
                          alt={product.nome} 
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                        />
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{product.nome}</div>
                          <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{product.descricao}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-700">
                      R$ {product.preco.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Package size={14} />
                        {product.estoque} un.
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide w-fit ${
                        product.ativo 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}>
                        {product.ativo ? <ToggleRight size={12}/> : <ToggleLeft size={12}/>}
                        {product.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => navigate(`/admin/products/edit/${product.id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeleteClick(product)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;