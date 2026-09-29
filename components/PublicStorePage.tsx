import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, DollarSign, Package, Loader, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { productApi } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const PublicStorePage: React.FC = () => {
  const { currentChurch: church } = useApp();
  const navigate = useNavigate();

  const { data: products = [], isLoading, isError } = useQuery<Product[]>({
    queryKey: ['publicProducts', church?.id],
    queryFn: () => productApi.getAll(church!.id),
    enabled: !!church?.id,
  });

  const activeProducts = products.filter(p => p.ativo);

  if (!church) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <AlertCircle className="text-red-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhuma igreja selecionada</h2>
        <p className="text-gray-600 mb-6">Por favor, selecione uma igreja na página inicial para ver a loja.</p>
        <button onClick={() => navigate('/')} className="btn-primary px-8">Voltar ao Início</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="text-sm text-gray-500 font-medium ml-3">Carregando loja...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 rounded-lg">
        <AlertCircle size={40} className="mb-2" />
        <p>Ocorreu um erro ao carregar os produtos da loja.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-6">
        <div className="p-3 bg-blue-50 rounded-xl">
          <ShoppingBag className="text-[#1e3a8a]" size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#0f172a]">Nossa Loja</h1>
          <p className="text-gray-500 text-sm">Confira os produtos disponíveis da {church.name}.</p>
        </div>
      </div>

      {activeProducts.length === 0 ? (
        <div className="bg-gray-50 p-16 rounded-2xl border border-dashed border-gray-300 text-center">
          <ShoppingBag className="mx-auto text-gray-300 mb-4 opacity-50" size={48} />
          <h3 className="text-xl font-bold text-gray-800">Nenhum produto disponível no momento</h3>
          <p className="text-gray-500 mt-2">Volte mais tarde para conferir as novidades!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeProducts.map(product => (
            <div key={product.id} className="premium-card p-0 overflow-hidden flex flex-col group hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={product.imageUrl || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}
                  alt={product.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.estoque === 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Esgotado
                  </span>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                  {product.nome}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                  {product.descricao || 'Sem descrição.'}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-2xl font-extrabold text-emerald-600">
                    R$ {product.preco.toFixed(2)}
                  </span>
                  <span className="flex items-center text-sm text-gray-600 font-medium ml-4">
                    <Package size={16} className="mr-1 text-gray-400" /> {product.estoque} un.
                  </span>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  onClick={() => navigate(`/loja/comprar/${product.id}`)}
                  disabled={product.estoque === 0}
                  className="btn-primary text-sm px-4 py-2"
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicStorePage;