import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ShoppingBag, DollarSign, Package, Loader, AlertCircle, ArrowLeft, User, Mail, Phone, CreditCard, CheckCircle } from 'lucide-react';
import { Product, PublicProductCheckoutRequestDTO } from '../types';
import { productApi, orderApi } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const PublicProductPurchasePage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { currentChurch: church } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState({
    nomeComprador: '',
    emailComprador: '',
    telefoneComprador: '',
    cpfComprador: '',
  });

  const { data: product, isLoading, isError } = useQuery<Product>({
    queryKey: ['productDetail', productId, church?.id],
    queryFn: () => productApi.getById(church!.id, productId!),
    enabled: !!church?.id && !!productId,
  });

  const totalValue = product ? product.preco * quantity : 0;

  const purchaseMutation = useMutation({
    mutationFn: async (checkoutRequest: PublicProductCheckoutRequestDTO) => {
      if (!church) throw new Error("Igreja não selecionada."); // Should be caught by !church check earlier
      return orderApi.createProductCheckout(church.id, checkoutRequest);
    },
    onSuccess: (checkoutResponse) => {
      if (checkoutResponse.checkoutUrl) {
        toast.success("Pedido criado! Redirecionando para o pagamento...");
        window.location.href = checkoutResponse.checkoutUrl;
      } else {
        toast.error("Erro ao gerar link de pagamento. Tente novamente.");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao finalizar a compra.";
      toast.error(message);
    },
  });

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation before attempting mutation
    if (!church) {
      toast.error("Nenhuma igreja selecionada.");
      return;
    }
    if (!product || quantity <= 0 || quantity > product.estoque) {
      toast.error("Verifique a quantidade ou o produto.");
      return;
    }
    if (!buyerInfo.nomeComprador || !buyerInfo.emailComprador || !buyerInfo.telefoneComprador) {
      toast.error("Por favor, preencha seus dados de contato.");
      return;
    }
    
    const checkoutRequest: PublicProductCheckoutRequestDTO = {
      ...buyerInfo,
      produtoId: product.id,
      quantidade: quantity,
      amount: totalValue, // totalValue is calculated in the component
    };
    purchaseMutation.mutate(checkoutRequest);
  };

  if (!church) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <AlertCircle className="text-red-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Nenhuma igreja selecionada</h2>
        <p className="text-gray-600 mb-6">Por favor, selecione uma igreja na página inicial para ver os produtos.</p>
        <button onClick={() => navigate('/')} className="btn-primary px-8">Voltar ao Início</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="text-sm text-gray-500 font-medium ml-3">Carregando detalhes do produto...</p>
      </div>
    );
  }

  // Tratamento de erros mais específico
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 rounded-lg">
        <AlertCircle size={40} className="mb-2" />
        <p>Ocorreu um erro ao carregar os detalhes do produto. Por favor, tente novamente.</p>
        <button onClick={() => navigate('/loja')} className="btn-secondary mt-4">Voltar para a Loja</button>
      </div>
    );
  }

  if (!product) { // Se não há erro na requisição, mas o produto é nulo (não encontrado)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 rounded-lg">
        <AlertCircle size={40} className="mb-2" />
        <p>Produto não encontrado ou indisponível.</p>
        <button onClick={() => navigate('/loja')} className="btn-secondary mt-4">Voltar para a Loja</button>
      </div>
    );
  }

  if (!product.ativo) { // Se o produto existe, mas está inativo
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-600 bg-red-50 rounded-lg">
        <AlertCircle size={40} className="mb-2" />
        <p>Este produto está temporariamente indisponível para compra.</p>
        <button onClick={() => navigate('/loja')} className="btn-secondary mt-4">Voltar para a Loja</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <button onClick={() => navigate('/loja')} className="flex items-center text-gray-500 mb-6 hover:text-[#1e3a8a] transition-colors font-medium">
        <ArrowLeft size={20} className="mr-2" /> Voltar para a Loja
      </button>

      <div className="premium-card p-0 overflow-hidden md:flex">
        <div className="md:w-1/2 relative">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/600x400?text=Sem+Imagem'}
            alt={product.nome}
            className="w-full h-full object-cover"
          />
          {product.estoque === 0 && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
              Esgotado
            </span>
          )}
        </div>

        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#0f172a] mb-3">{product.nome}</h1>
            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
              {product.descricao || 'Nenhuma descrição disponível para este produto.'}
            </p>

            <div className="flex items-center justify-between mb-6 border-t border-b border-gray-100 py-4">
              <div className="flex items-center gap-2">
                <DollarSign size={24} className="text-emerald-500" />
                <span className="text-4xl font-extrabold text-emerald-600">
                  R$ {product.preco.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Package size={20} />
                <span className="text-lg font-medium">{product.estoque} un. em estoque</span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePurchase} className="space-y-6">
            <div>
              <label htmlFor="quantity" className="label-field">Quantidade</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={product.estoque}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.estoque, Number(e.target.value))))}
                className="input-field w-24 text-center"
                disabled={product.estoque === 0}
              />
              {product.estoque === 0 && <p className="text-red-500 text-sm mt-1">Produto esgotado.</p>}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-lg font-bold text-[#0f172a] mb-4">Seus Dados</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="nomeComprador" className="label-field">Nome Completo</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text" id="nomeComprador" required
                      className="input-field !pl-10"
                      value={buyerInfo.nomeComprador}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, nomeComprador: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="emailComprador" className="label-field">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="email" id="emailComprador" required
                      className="input-field !pl-10"
                      value={buyerInfo.emailComprador}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, emailComprador: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="telefoneComprador" className="label-field">Telefone</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="tel" id="telefoneComprador" required
                      className="input-field !pl-10"
                      value={buyerInfo.telefoneComprador}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, telefoneComprador: formatPhone(e.target.value) })}
                      maxLength={15}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="cpfComprador" className="label-field">CPF (Opcional)</label>
                  <div className="relative">
                    <CreditCard size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text" id="cpfComprador"
                      className="input-field !pl-10"
                      value={buyerInfo.cpfComprador}
                      onChange={(e) => setBuyerInfo({ ...buyerInfo, cpfComprador: e.target.value.replace(/\D/g, '') })}
                      maxLength={11}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
              <span className="text-2xl font-extrabold text-[#0f172a]">Total: R$ {totalValue.toFixed(2)}</span>
              <button
                type="submit"
                disabled={product.estoque === 0 || purchaseMutation.isPending}
                className="btn-primary py-3 px-6 text-lg shadow-lg flex items-center gap-2"
              >
                {purchaseMutation.isPending ? <Loader className="animate-spin" size={20} /> : <><ShoppingBag size={20} /> Finalizar Compra</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicProductPurchasePage;