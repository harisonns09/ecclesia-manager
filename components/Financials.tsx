import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from 'recharts';
import { Plus, TrendingUp, TrendingDown, DollarSign, X, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Transaction, TransactionType, TransactionCategory } from '../types';
import { financialApi } from '../services/api'; 
import { useApp } from '../contexts/AppContext'; // Contexto
import { toast } from 'sonner'; // Toast

// Sem props!
const Financials: React.FC = () => {
  const { currentChurch: church } = useApp(); // Pegando do contexto

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado do formulário
  const [newTrans, setNewTrans] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    type: TransactionType.INCOME,
    category: TransactionCategory.TITHE,
    date: new Date().toISOString().split('T')[0]
  });

  // 1. Carregar transações
  useEffect(() => {
    if (church) {
      loadTransactions();
    }
  }, [church]);

  const loadTransactions = async () => {
    if (!church) return;
    setIsLoading(true);
    try {
      const data = await financialApi.getByChurch(church.id);
      setTransactions(data);
    } catch (error) {
      console.error("Erro ao carregar finanças:", error);
      toast.error("Erro ao carregar dados financeiros.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Salvar no Backend
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!church) return;

    // Toast de loading
    const toastId = toast.loading("Registrando transação...");

    try {
      const createdTransaction = await financialApi.create(church.id, newTrans);
      
      setTransactions([createdTransaction, ...transactions]);
      
      setShowModal(false);
      toast.success("Transação registrada com sucesso!", { id: toastId });
      
      // Limpa o formulário
      setNewTrans({
        description: '',
        amount: 0,
        type: TransactionType.INCOME,
        category: TransactionCategory.TITHE,
        date: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error("Erro ao criar transação:", error);
      toast.error("Erro ao registrar transação.", { id: toastId });
    }
  };

  // Preparar dados para o gráfico
  const incomeByCategory = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.keys(incomeByCategory).map(key => ({
    name: key,
    value: incomeByCategory[key]
  }));

  const COLORS = ['#1e3a8a', '#3b82f6', '#93c5fd', '#f59e0b', '#ef4444'];

  if (!church) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">Controle Financeiro</h2>
            <p className="text-gray-500 text-sm mt-1">Gestão de entradas e saídas da igreja.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary shadow-lg hover:shadow-xl"
        >
          <Plus size={20} className="mr-2" />
          Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Lista de Transações */}
        <div className="lg:col-span-2 premium-card p-0 overflow-hidden flex flex-col h-full">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-[#0f172a]">Histórico Recente</h3>
            <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                Últimos Lançamentos
            </span>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-gray-400 text-xs uppercase font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Descrição</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                    <tr><td colSpan={4} className="text-center py-10"><Loader className="animate-spin mx-auto text-blue-600"/></td></tr>
                ) : transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#eff6ff]/30 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800 group-hover:text-[#1e3a8a] transition-colors">
                        {t.description}
                    </td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            {t.category}
                        </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-sm ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {!isLoading && transactions.length === 0 && (
                   <tr>
                       <td colSpan={4} className="text-center py-12 text-gray-400 flex flex-col items-center justify-center">
                           <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                               <DollarSign size={20} className="opacity-30" />
                           </div>
                           Nenhum lançamento registrado.
                       </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gráfico */}
        <div className="premium-card p-6 flex flex-col items-center justify-center h-full min-h-[350px]">
          <h3 className="font-bold text-[#0f172a] mb-6 w-full text-left border-b border-gray-100 pb-4">
              Distribuição de Entradas
          </h3>
          <div className="w-full h-64 flex-1">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#1e3a8a"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <ReTooltip 
                    formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                  />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col h-full items-center justify-center text-gray-400 text-sm">
                <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-gray-200 mb-3"></div>
                Sem dados suficientes para o gráfico.
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Modal de Nova Transação */}
       {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-[#0f172a] flex items-center text-lg">
                <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                    <DollarSign size={20} className="text-emerald-700" />
                </div>
                Nova Transação
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddTransaction} className="p-6 space-y-5">
              
              {/* Tipo de Transação */}
              <div className="grid grid-cols-2 gap-4 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setNewTrans({...newTrans, type: TransactionType.INCOME})}
                  className={`flex items-center justify-center py-2.5 px-4 rounded-lg font-bold transition-all text-sm ${
                    newTrans.type === TransactionType.INCOME 
                      ? 'bg-white text-emerald-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TrendingUp size={16} className="mr-2" />
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setNewTrans({...newTrans, type: TransactionType.EXPENSE})}
                  className={`flex items-center justify-center py-2.5 px-4 rounded-lg font-bold transition-all text-sm ${
                    newTrans.type === TransactionType.EXPENSE 
                      ? 'bg-white text-red-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TrendingDown size={16} className="mr-2" />
                  Saída
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição</label>
                <input 
                  type="text" required
                  className="input-field"
                  placeholder="Ex: Oferta de Domingo"
                  value={newTrans.description}
                  onChange={e => setNewTrans({...newTrans, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor (R$)</label>
                  <input 
                    type="number" required step="0.01"
                    className="input-field font-mono font-medium"
                    placeholder="0,00"
                    value={newTrans.amount}
                    onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoria</label>
                  <select 
                    className="input-field appearance-none bg-white"
                    value={newTrans.category}
                    onChange={e => setNewTrans({...newTrans, category: e.target.value as TransactionCategory})}
                  >
                    {Object.values(TransactionCategory).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data</label>
                <input 
                  type="date" required
                  className="input-field"
                  value={newTrans.date}
                  onChange={e => setNewTrans({...newTrans, date: e.target.value})}
                />
              </div>

              <div className="pt-2 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="btn-secondary flex-1 justify-center"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary flex-1 justify-center shadow-md"
                  >
                    Confirmar
                  </button>
              </div>
            </form>
          </div>
        </div>
       )}
    </div>
  );
};

export default Financials;