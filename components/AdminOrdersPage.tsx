import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader, AlertCircle, ShoppingBag, Eye, X, User, Package, CheckCircle, Clock, XCircle, RefreshCw, DollarSign } from 'lucide-react';
import { orderApi } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { Order } from '../types';

const AdminOrdersPage: React.FC = () => {
  const { currentChurch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Alterações chave: enabled: false, isFetching e isFetched
  const { data: orders = [], isFetching, isError, refetch, isFetched } = useQuery<Order[]>({
    queryKey: ['orders', currentChurch?.id],
    queryFn: () => orderApi.getAll(currentChurch!.id),
    enabled: false, // Impede a requisição automática ao abrir a página
  });

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchTerm) ||
    order.comprador?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.emailComprador?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const financialReport = React.useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        totalRevenue: 0,
        paidOrdersCount: 0,
        pendingOrdersCount: 0,
      };
    }

    const paidOrders = orders.filter(o => o.statusPagamento === 'PAGO');
    const pendingOrders = orders.filter(o => o.statusPagamento === 'PENDENTE');

    const totalRevenue = paidOrders.reduce((acc, order) => acc + order.valorTotal, 0);

    return {
      totalRevenue,
      paidOrdersCount: paidOrders.length,
      pendingOrdersCount: pendingOrders.length,
    };
  }, [orders]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAGO':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"><CheckCircle size={14} className="mr-1" /> Pago</span>;
      case 'PENDENTE':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"><Clock size={14} className="mr-1" /> Pendente</span>;
      case 'CANCELADO':
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"><XCircle size={14} className="mr-1" /> Cancelado</span>;
      default:
        return <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (!currentChurch) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <AlertCircle size={48} className="mb-4 text-gray-400" />
        <p className="text-lg">Selecione uma igreja para gerenciar os pedidos.</p>
      </div>
    );
  }

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="text-blue-600" /> Gestão de Vendas
          </h1>
          <p className="text-gray-600">Acompanhe os pedidos da loja e ingressos</p>
        </div>
        
        {/* Botão de carregamento manual */}
        <button 
          onClick={() => refetch()} 
          disabled={isFetching}
          className="btn-primary flex items-center gap-2"
        >
          {isFetching ? <Loader className="animate-spin" size={20} /> : <RefreshCw size={20} />}
          {isFetched ? 'Atualizar Vendas' : 'Carregar Vendas'}
        </button>
      </div>

      {/* Relatório Financeiro */}
      {isFetched && orders.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-full"><DollarSign size={24} className="text-emerald-600"/></div>
            <div>
              <p className="text-sm font-bold text-emerald-800">Faturamento (Pago)</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                R$ {financialReport.totalRevenue.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
            <p className="text-sm font-bold text-green-800">Pedidos Pagos</p>
            <p className="text-2xl font-extrabold text-green-700 mt-1">{financialReport.paidOrdersCount}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
            <p className="text-sm font-bold text-yellow-800">Pedidos Pendentes</p>
            <p className="text-2xl font-extrabold text-yellow-700 mt-1">{financialReport.pendingOrdersCount}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, email ou ID do pedido..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!isFetched} // Desabilita a busca se não carregou os dados
            />
          </div>
        </div>

        {isFetching ? (
          <div className="flex justify-center py-20">
            <Loader className="animate-spin text-blue-600" size={40} />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <AlertCircle size={40} className="mb-2" />
            <p>Erro ao carregar os pedidos.</p>
          </div>
        ) : !isFetched ? (
          <div className="text-center py-20 text-gray-500">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Clique em "Carregar Vendas" para listar os pedidos do sistema.</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Search size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Nenhum pedido encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">ID Pedido</th>
                  <th className="p-4 font-medium">Cliente</th>
                  <th className="p-4 font-medium">Descrição</th>
                  <th className="p-4 font-medium">Data</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Valor Total</th>
                  <th className="p-4 font-medium text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">#{order.id}</td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{order.comprador || 'Visitante'}</div>
                      <div className="text-sm text-gray-500">{order.emailComprador}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{order.descricao}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {order.dataCriacao ? new Date(order.dataCriacao).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="p-4">{getStatusBadge(order.statusPagamento)}</td>
                    <td className="p-4 text-right font-bold text-emerald-600">
                      R$ {order.valorTotal?.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors inline-flex items-center"
                        title="Ver Detalhes"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Pedido #{selectedOrder.id}
                {getStatusBadge(selectedOrder.statusPagamento)}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Info do Cliente */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><User size={16}/> Dados do Comprador</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Nome</p>
                    <p className="font-medium">{selectedOrder.comprador}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{selectedOrder.emailComprador}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Telefone</p>
                    <p className="font-medium">{selectedOrder.telefoneComprador}</p>
                  </div>
                  
                </div>
              </div>

              {/* Itens do Pedido */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Package size={16}/> Itens do Pedido</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 font-medium">Produto</th>
                        <th className="p-3 font-medium text-center">Qtd</th>
                        <th className="p-3 font-medium text-right">Preço Unit.</th>
                        <th className="p-3 font-medium text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.itens?.map((item: any) => (
                        <tr key={item.id}>
                          <td className="p-3">{item.produto?.nome}</td>
                          <td className="p-3 text-center">{item.quantidade}</td>
                          <td className="p-3 text-right">R$ {item.precoUnitario?.toFixed(2)}</td>
                          <td className="p-3 text-right font-medium">R$ {(item.quantidade * item.precoUnitario).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-bold">Total Geral:</td>
                        <td className="p-3 text-right font-bold text-emerald-600">R$ {selectedOrder.valorTotal?.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Detalhes da Transação */}
              {(selectedOrder.transacaoId) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-bold text-blue-800 uppercase mb-2">Detalhes do Gateway</h3>
                  {selectedOrder.transacaoId && <p className="text-sm text-blue-900"><strong>NSU / Transação:</strong> {selectedOrder.transacaoId}</p>}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;