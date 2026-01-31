import React from 'react';
import { Users, DollarSign, Calendar, TrendingUp, Gift } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Member, Transaction, TransactionType } from '../types';

interface DashboardProps {
  members: Member[];
  transactions: Transaction[];
  eventsCount: number;
}

const Dashboard: React.FC<DashboardProps> = ({ members, transactions, eventsCount }) => {
  const activeMembers = members.filter(m => m.status === 'Ativo').length;
  
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  const chartData = [
    { name: 'Entradas', value: totalIncome },
    { name: 'Saídas', value: totalExpense },
  ];

  // Logic for Birthdays
  const currentMonth = new Date().getMonth(); // 0-indexed
  const birthdaysThisMonth = members.filter(m => {
    if (!m.birthDate) return false;
    // Assuming birthDate is YYYY-MM-DD
    const birthMonth = new Date(m.birthDate).getMonth();
    return birthMonth === currentMonth;
  }).sort((a, b) => {
      const dayA = new Date(a.birthDate!).getDate();
      const dayB = new Date(b.birthDate!).getDate();
      return dayA - dayB;
  });

  const StatCard = ({ title, value, icon, color, subtext }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-900">{value}</h3>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-800">Painel Geral</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Membros Ativos" 
          value={activeMembers} 
          icon={<Users size={24} className="text-blue-600" />}
          color="bg-blue-100"
          subtext={`Total: ${members.length} cadastrados`}
        />
        <StatCard 
          title="Saldo Atual" 
          value={`R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<DollarSign size={24} className="text-green-600" />}
          color="bg-green-100"
        />
        <StatCard 
          title="Entradas (Mês)" 
          value={`R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={24} className="text-emerald-600" />}
          color="bg-emerald-100"
        />
        <StatCard 
          title="Próximos Eventos" 
          value={eventsCount}
          icon={<Calendar size={24} className="text-purple-600" />}
          color="bg-purple-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Finanças: Entradas vs Saídas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Birthdays Widget */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between rounded-t-xl">
             <h3 className="font-semibold text-gray-800 flex items-center">
               <Gift size={18} className="mr-2 text-pink-500" />
               Aniversariantes do Mês
             </h3>
             <span className="text-xs font-bold bg-pink-100 text-pink-600 px-2 py-1 rounded-full">{birthdaysThisMonth.length}</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto max-h-[300px]">
            {birthdaysThisMonth.length > 0 ? (
              <div className="space-y-3">
                {birthdaysThisMonth.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center mr-3 font-bold text-xs">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-500">{m.role}</p>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      Dia {new Date(m.birthDate!).getDate() + 1} 
                      {/* +1 correction for timezone/date parsing issues usually found in simplified date strings */}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-8">
                <Gift size={32} className="mb-2 opacity-30" />
                <p className="text-sm">Nenhum aniversariante.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;