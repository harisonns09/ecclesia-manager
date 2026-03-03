import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, TrendingUp, Users, Clock, CheckCircle2, AlertCircle, CreditCard, Loader, Calendar as CalendarIcon } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { eventApi } from '../services/api';
import { useApp } from '../contexts/AppContext';
import { toast } from 'sonner';

const EventFinancePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentChurch: church } = useApp();

    const [event, setEvent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (church?.id && id) {
            loadEventData();
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
            toast.error("Erro ao carregar dados financeiros.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-[60vh]"><Loader className="animate-spin text-[#1e3a8a]" size={48} /></div>;
    }

    if (!event) return null;

    const inscricoes = event.inscricoes || [];
    const preco = Number(event.preco) || 0;

    const inscritosPagos = inscricoes.filter((i: any) => i.status?.toLowerCase() === 'pago');
    const inscritosPendentes = inscricoes.filter((i: any) => i.status?.toLowerCase() === 'pendente');

    const totalArrecadado = inscritosPagos.reduce((soma: number, insc: any) => soma + (Number(insc.valorPago) || preco), 0);

    const receitaPendente = inscritosPendentes.length * preco;
    const receitaPotencial = totalArrecadado + receitaPendente;

    const ticketMedio = inscritosPagos.length > 0 ? totalArrecadado / inscritosPagos.length : 0;

    // --- MÁGICA DO GRÁFICO DE CASCATA ---
    const generateChartData = () => {
        if (inscritosPagos.length === 0) return [];

        // 1. Ordena os pagamentos cronologicamente
        const sortedPagos = [...inscritosPagos].sort((a, b) =>
            new Date(a.data_inscricao).getTime() - new Date(b.data_inscricao).getTime()
        );

        // 2. Agrupa por dia
        const dailyData: Record<string, number> = {};
        sortedPagos.forEach(insc => {
            const dateStr = new Date(insc.data_inscricao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
            if (!dailyData[dateStr]) dailyData[dateStr] = 0;
            dailyData[dateStr] += (Number(insc.valorPago) || preco);
        });

        // 3. Constrói o array com Ponto de Partida e Chegada (Start, End) para cada barra flutuar
        let acumulado = 0;
        const data = Object.keys(dailyData).map(date => {
            const start = acumulado;
            acumulado += dailyData[date];
            return {
                data: date,
                valorBase: [start, acumulado], // Define onde a barra começa e termina no eixo Y
                diario: dailyData[date],
                isTotal: false
            };
        });

        // 4. Adiciona a barra de "Total" no fim do gráfico
        data.push({
            data: 'Total',
            valorBase: [0, acumulado],
            diario: acumulado,
            isTotal: true
        });

        return data;
    };

    const chartData = generateChartData();

    // Tooltip Personalizado para explicar a Cascata
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
                    <p className="font-bold text-gray-800 mb-2">{label}</p>
                    {data.isTotal ? (
                        <p className="text-blue-600 font-medium text-sm">
                            Fechamento: <span className="font-bold">R$ {data.diario.toFixed(2)}</span>
                        </p>
                    ) : (
                        <>
                            <p className="text-emerald-600 font-medium text-sm">
                                Receita do dia: <span className="font-bold">+ R$ {data.diario.toFixed(2)}</span>
                            </p>
                            <p className="text-gray-500 font-medium text-xs mt-1">
                                Acumulado até aqui: <span className="font-bold">R$ {data.valorBase[1].toFixed(2)}</span>
                            </p>
                        </>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                    <button onClick={() => navigate('/admin/events')} className="flex items-center text-sm font-semibold text-gray-500 hover:text-blue-600 mb-2 transition-colors">
                        <ArrowLeft size={16} className="mr-1" /> Voltar para Eventos
                    </button>
                    <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                        <TrendingUp className="text-emerald-600" size={28} /> Financeiro do Evento
                    </h2>
                    <p className="text-gray-500 text-sm mt-1 font-medium">{event.nomeEvento} <span className="mx-2">•</span> Ingresso: R$ {preco.toFixed(2)}</p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-8 shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-10">
                    <DollarSign size={200} />
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-end gap-6">
                    <div>
                        <p className="text-emerald-100 font-semibold uppercase tracking-widest text-sm mb-2">Total Arrecadado</p>
                        <h1 className="text-5xl sm:text-6xl font-black drop-shadow-sm">
                            R$ {totalArrecadado.toFixed(2)}
                        </h1>
                        <p className="text-emerald-100 mt-3 font-medium flex items-center">
                            <CheckCircle2 size={16} className="mr-1.5" /> {inscritosPagos.length} pagamentos confirmados
                        </p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30 text-center min-w-[160px]">
                        <p className="text-emerald-50 text-xs font-bold uppercase mb-1">Receita Potencial</p>
                        <p className="text-xl font-bold">R$ {receitaPotencial.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- CONTAINER DO GRÁFICO --- */}
                <div className="lg:col-span-2 premium-card p-6 border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Evolução das Receitas (Cascata)</h3>
                            <p className="text-xs text-gray-500 mt-1">Impacto de cada dia no faturamento final</p>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `R$${val}`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                                    {/* A barra lê o array [start, end] para desenhar o pedaço exato da cascata */}
                                    <Bar dataKey="valorBase" radius={[4, 4, 4, 4]} maxBarSize={50}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.isTotal ? '#3b82f6' : '#10b981'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <CalendarIcon size={48} className="opacity-20 mb-3" />
                                <p>Ainda não há pagamentos registrados para gerar o gráfico.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="premium-card p-5 border-l-4 border-l-blue-500 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total de Inscrições</p>
                                <h3 className="text-3xl font-extrabold text-gray-900">{inscricoes.length}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Users size={24} /></div>
                        </div>
                    </div>

                    <div className="premium-card p-5 border-l-4 border-l-orange-400 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">Pagamentos Pendentes</p>
                                <h3 className="text-3xl font-extrabold text-orange-500">R$ {receitaPendente.toFixed(2)}</h3>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-xl text-orange-600"><Clock size={24} /></div>
                        </div>
                        <p className="text-xs font-medium text-orange-500/80 mt-2">{inscritosPendentes.length} boletos/pix aguardando</p>
                    </div>

                    <div className="premium-card p-5 border-l-4 border-l-gray-400 flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Ticket Médio Real</p>
                                <h3 className="text-2xl font-bold text-gray-700">R$ {ticketMedio.toFixed(2)}</h3>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-xl text-gray-500"><CreditCard size={20} /></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="premium-card p-0 overflow-hidden border border-gray-200">
                <div className="p-5 border-b border-gray-100 bg-gray-50/80 flex justify-between items-center">
                    <h3 className="font-bold text-[#0f172a] text-lg">Pagamentos Recebidos</h3>
                </div>

                <div className="overflow-x-auto">
                    {inscritosPagos.length === 0 ? (
                        <div className="p-10 text-center text-gray-400 font-medium">Nenhum pagamento confirmado ainda.</div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-gray-400 text-xs uppercase font-bold border-b border-gray-100">
                                    <th className="px-6 py-4">Inscrito</th>
                                    <th className="px-6 py-4">Data do Pagamento</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {[...inscritosPagos].sort((a, b) => new Date(b.data_inscricao).getTime() - new Date(a.data_inscricao).getTime()).map((insc: any) => (
                                    <tr key={insc.id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{insc.nome}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{insc.email || insc.telefone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                            {new Date(insc.data_inscricao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center w-max border bg-emerald-50 text-emerald-700 border-emerald-100">
                                                <CheckCircle2 size={12} className="mr-1.5" />
                                                {insc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-800">
                                            R$ {insc.valorPago?.toFixed(2) || preco.toFixed(2)}
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

export default EventFinancePage;