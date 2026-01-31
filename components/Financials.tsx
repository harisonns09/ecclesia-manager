import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from 'recharts';
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Transaction, TransactionType, TransactionCategory } from '../types';

interface FinancialsProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const Financials: React.FC<FinancialsProps> = ({ transactions, setTransactions }) => {
  const [showModal, setShowModal] = useState(false);
  const [newTrans, setNewTrans] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    type: TransactionType.INCOME,
    category: TransactionCategory.TITHE,
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    // Fix: Add churchId property (will be populated correctly in App.tsx)
    const trans: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      churchId: '',
      description: newTrans.description || 'Sem descrição',
      amount: Number(newTrans.amount),
      type: newTrans.type || TransactionType.INCOME,
      category: newTrans.category || TransactionCategory.OTHER,
      date: newTrans.date || new Date().toISOString()
    };
    setTransactions([trans, ...transactions]);
    setShowModal(false);
    setNewTrans({
      description: '',
      amount: 0,
      type: TransactionType.INCOME,
      category: TransactionCategory.TITHE,
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Prepare Chart Data
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

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Controle Financeiro</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Histórico de Transações</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white text-gray-500 text-xs uppercase font-medium border-b border-gray-100">
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Descrição</th>
                  <th className="px-6 py-3">Categoria</th>
                  <th className="px-6 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{t.description}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{t.category}</td>
                    <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                   <tr><td colSpan={4} className="text-center py-6 text-gray-500">Nenhuma transação registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center">
          <h3 className="font-semibold text-gray-700 mb-4 w-full text-left">Distribuição de Entradas</h3>
          <div className="w-full h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                Sem dados suficientes para o gráfico.
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Add Transaction Modal */}
       {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800 flex items-center">
                <DollarSign size={20} className="mr-2 text-emerald-600" />
                Nova Transação
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setNewTrans({...newTrans, type: TransactionType.INCOME})}
                  className={`flex items-center justify-center py-2 px-4 rounded-lg border ${newTrans.type === TransactionType.INCOME ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600'}`}
                >
                  <TrendingUp size={18} className="mr-2" />
                  Entrada
                </button>
                <button
                  type="button"
                  onClick={() => setNewTrans({...newTrans, type: TransactionType.EXPENSE})}
                  className={`flex items-center justify-center py-2 px-4 rounded-lg border ${newTrans.type === TransactionType.EXPENSE ? 'bg-red-50 border-red-500 text-red-700' : 'border-gray-200 text-gray-600'}`}
                >
                  <TrendingDown size={18} className="mr-2" />
                  Saída
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newTrans.description}
                  onChange={e => setNewTrans({...newTrans, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newTrans.amount}
                    onChange={e => setNewTrans({...newTrans, amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={newTrans.date}
                  onChange={e => setNewTrans({...newTrans, date: e.target.value})}
                />
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
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Registrar
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