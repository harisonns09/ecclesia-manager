import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, Loader, Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Receipt, Users, Calendar as CalendarIcon } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { eventApi, transactionApi } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';
import { Transaction } from '../types';

const EventFinancePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentChurch: church } = useApp();

    const [event, setEvent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lancamentos, setLancamentos] = useState<Transaction[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [novoLancamento, setNovoLancamento] = useState({
        descricao: '',
        valor: '',
        tipo: 'Saída' as 'Entrada' | 'Saída',
        categoria: 'Outros'
    });

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value === "") {
            setNovoLancamento({ ...novoLancamento, valor: "" });
            return;
        }
        const numericValue = Number(value) / 100;
        const formatted = numericValue.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
        setNovoLancamento({ ...novoLancamento, valor: formatted });
    };

    useEffect(() => {
        if (church?.id && id) {
            loadEventData();
            loadTransactions();
        }
    }, [church?.id, id]);

    const loadEventData = async () => {
        setIsLoading(true);
        try {
            const data = await eventApi.getByChurch(church!.id);
            const foundEvent = data.find((e: any) => String(e.id) === id);
            if (!foundEvent) {
                toast.error("Evento não encontrado.");
                navigate('/admin/events');
                return;
            }
            setEvent(foundEvent);
        } catch (error) {
            toast.error("Erro ao carregar dados do evento.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadTransactions = async () => {
        try {
            const response = await transactionApi.getByEvent(id!);
            // Mapeamos o DTO do Java para a interface Transaction do Frontend
            const mappedTransactions = response.map((t: any) => ({
                id: String(t.id),
                igrejaId: String(t.igrejaId),
                descricao: t.descricao,
                valor: Number(t.valor),
                tipo: t.tipo === 'SAIDA' ? 'Saída' : 'Entrada',
                categoria: t.categoria,
                dataRegistro: t.dataRegistro, // dataRegistro do Back -> date do Front
                eventoId: String(t.eventoId)
            } as Transaction));
            
            setLancamentos(mappedTransactions);
        } catch (error) {
            console.error("Erro ao carregar lançamentos", error);
        }
    };

    const handleAddLancamento = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!novoLancamento.descricao || !novoLancamento.valor) return;

        try {
            const valorNumerico = Number(novoLancamento.valor.replace(/\D/g, "")) / 100;

            const payload = {
                igrejaId: Number(church!.id),
                descricao: novoLancamento.descricao,
                valor: valorNumerico,
                tipo: novoLancamento.tipo === 'Saída' ? 'SAIDA' : 'ENTRADA',
                categoria: novoLancamento.tipo === 'Saída' ? 'Pagamentos' : 'Outros',
                dataRegistro: new Date().toISOString(),
                eventoId: Number(id)
            };

            const salvo = await transactionApi.novoPagamento(church!.id, payload as any);

            const novoMapeado: Transaction = {
                id: String(salvo.id),
                igrejaId: String(church!.id),
                descricao: salvo.descricao,
                valor: Number(salvo.valor),
                tipo: salvo.tipo === 'SAIDA' ? 'Saída' : 'Entrada' as any,
                categoria: salvo.categoria as any,
                dataRegistro: salvo.dataRegistro,
                eventoId: id
            };

            setLancamentos([novoMapeado, ...lancamentos]);
            setNovoLancamento({ descricao: '', valor: '', tipo: 'Saída', categoria: 'Outros' });
            setIsModalOpen(false);
            toast.success("Lançamento registrado!");
        } catch (error) {
            toast.error("Erro ao salvar lançamento.");
        }
    };

    const removerLancamento = async (lancamentoId: string) => {
        try {
            await transactionApi.delete(church!.id, lancamentoId);
            setLancamentos(lancamentos.filter(l => l.id !== lancamentoId));
            toast.info("Removido com sucesso.");
        } catch (error) {
            toast.error("Erro ao remover.");
        }
    };

    if (isLoading || !event) {
        return <div className="flex justify-center items-center h-[60vh]"><Loader className="animate-spin text-[#1e3a8a]" size={48} /></div>;
    }

    // --- CÁLCULOS TOTAIS ---
    const preco = Number(event.preco) || 0;
    const inscritosPagos = (event.inscricoes || []).filter((i: any) => i.status?.toLowerCase() === 'pago');
    const faturamentoInscricoes = inscritosPagos.reduce((soma: number, insc: any) => soma + (Number(insc.valorPago) || preco), 0);
    const totalEntradasExtras = lancamentos.filter(l => l.tipo === 'Entrada').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalDespesas = lancamentos.filter(l => l.tipo === 'Saída').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const receitaTotal = faturamentoInscricoes + totalEntradasExtras;
    const saldoFinal = receitaTotal - totalDespesas;

    // --- LÓGICA DO GRÁFICO CASCATA ---
    const generateChartData = () => {
        const dailyData: Record<string, { entrada: number; saida: number; dataRaw: Date }> = {};

        inscritosPagos.forEach((insc: any) => {
            const raw = new Date(insc.data_inscricao);
            if (isNaN(raw.getTime())) return;
            const dateStr = raw.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            if (!dailyData[dateStr]) dailyData[dateStr] = { entrada: 0, saida: 0, dataRaw: raw };
            dailyData[dateStr].entrada += (Number(insc.valorPago) || preco);
        });

        lancamentos.forEach((l) => {
            const raw = new Date(l.dataRegistro);
            if (isNaN(raw.getTime())) return;
            const dateStr = raw.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            if (!dailyData[dateStr]) dailyData[dateStr] = { entrada: 0, saida: 0, dataRaw: raw };
            if (l.tipo === 'Entrada') dailyData[dateStr].entrada += Number(l.valor);
            else dailyData[dateStr].saida += Number(l.valor);
        });

        const sortedDates = Object.keys(dailyData).sort((a, b) => dailyData[a].dataRaw.getTime() - dailyData[b].dataRaw.getTime());
        
        let acumulado = 0;
        const data = sortedDates.map(dateStr => {
            const day = dailyData[dateStr];
            const netChange = day.entrada - day.saida;
            const start = acumulado;
            const end = acumulado + netChange;
            acumulado = end;
            return { data: dateStr, valorBase: [start, end], netChange, isTotal: false };
        });

        if (data.length > 0) {
            data.push({ data: 'Saldo Final', valorBase: [0, acumulado], netChange: acumulado, isTotal: true });
        }
        return data;
    };

    const chartData = generateChartData();

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                    <button onClick={() => navigate('/admin/events')} className="flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 mb-2 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Voltar
                    </button>
                    <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                        <TrendingUp className="text-emerald-600" size={28} /> Financeiro do Evento
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{event.nomeEvento} <span className="mx-2">•</span> Ingresso: R$ {preco.toFixed(2)}</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 px-6 py-3 shadow-lg shadow-blue-200">
                    <Plus size={20} /> Lançar Movimentação
                </button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Receita Total</p>
                    <h3 className="text-3xl font-black text-emerald-600">R$ {receitaTotal.toFixed(2)}</h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase mb-2">Despesas</p>
                    <h3 className="text-3xl font-black text-red-500">R$ {totalDespesas.toFixed(2)}</h3>
                </div>
                <div className={`p-6 rounded-2xl border shadow-md flex flex-col justify-center ${saldoFinal >= 0 ? 'bg-blue-600 border-blue-700 text-white' : 'bg-red-600 border-red-700 text-white'}`}>
                    <p className="opacity-80 text-xs font-bold uppercase mb-2">Saldo Líquido (Lucro)</p>
                    <h3 className="text-4xl font-black">R$ {saldoFinal.toFixed(2)}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Waterfall Chart */}
                <div className="lg:col-span-2 premium-card p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Fluxo de Caixa (Cascata)</h3>
                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `R$`} />
                                    <Tooltip 
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-3 rounded-lg shadow-xl border border-gray-100 min-w-[150px]">
                                                        <p className="font-bold text-sm mb-2">{label}</p>
                                                        <p className={`text-xs font-bold ${d.netChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            Variação: R$ {d.netChange.toFixed(2)}
                                                        </p>
                                                        {!d.isTotal && <p className="text-[10px] text-gray-400 mt-1">Saldo Acumulado: R$ {d.valorBase[1].toFixed(2)}</p>}
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="valorBase" radius={[4, 4, 4, 4]} maxBarSize={50}>
                                        {chartData.map((entry, index) => {
                                            let color = entry.netChange >= 0 ? '#10b981' : '#ef4444'; // Verde se positivo, Vermelho se negativo
                                            if (entry.isTotal) {
                                                color = entry.netChange >= 0 ? '#3b82f6' : '#ef4444'; // Azul se saldo final positivo, Vermelho se negativo
                                            }
                                            return <Cell key={`cell-${index}`} fill={color} />;
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 italic text-sm">Sem movimentações financeiras.</div>
                        )}
                    </div>
                </div>

                {/* Histórico Lateral */}
                <div className="lg:col-span-1 premium-card p-0 overflow-hidden border border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
                        <h3 className="font-bold text-[#0f172a] text-sm flex items-center gap-2"><Receipt size={16} className="text-blue-600" /> Histórico</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-100 bg-white">
                        <div className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Users size={14} /></div>
                                <div><p className="font-bold text-gray-800 text-xs">Inscrições Pagas</p><p className="text-[10px] text-gray-400 uppercase font-bold">{inscritosPagos.length} PAGAMENTOS</p></div>
                            </div>
                            <p className="font-bold text-emerald-600 text-xs">+ R$ {faturamentoInscricoes.toFixed(2)}</p>
                        </div>
                        {lancamentos.map((l) => (
                            <div key={l.id} className="p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${l.tipo === 'Entrada' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                        {l.tipo === 'Entrada' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-gray-800 text-xs truncate max-w-[120px]">{l.descricao}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">
                                            {l.dataRegistro ? new Date(l.dataRegistro).toLocaleDateString('pt-BR') : 'Sem data'} • {l.categoria || 'EVENTO'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className={`font-bold text-xs ${l.tipo === 'Entrada' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {l.tipo === 'Entrada' ? '+' : '-'} R$ {Number(l.valor).toFixed(2)}
                                    </p>
                                    <button onClick={() => removerLancamento(l.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal de Lançamento */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h3 className="text-xl font-bold text-gray-800">Novo Lançamento</h3></div>
                        <form onSubmit={handleAddLancamento} className="p-6 space-y-4">
                            <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                                <input autoFocus className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Aluguel do Som..." value={novoLancamento.descricao} onChange={e => setNovoLancamento({ ...novoLancamento, descricao: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor</label>
                                    <input type="text" inputMode="numeric" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={novoLancamento.valor} onChange={handleCurrencyChange} />
                                </div>
                                <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo</label>
                                    <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold" value={novoLancamento.tipo} onChange={e => setNovoLancamento({ ...novoLancamento, tipo: e.target.value as any })}>
                                        <option value="Saída">Despesa (-)</option><option value="Entrada">Receita (+)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl">Cancelar</button>
                                <button type="submit" className="flex-1 py-3 font-bold bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EventFinancePage;