import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download, CheckCircle, Clock, XCircle, AlertCircle, Loader, CheckSquare, DollarSign } from 'lucide-react';
import { eventApi } from '../services/api';
import ConfirmationModal from './ConfirmationModal';

const EventAttendeesPage: React.FC<{ churchId: string }> = ({ churchId }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [event, setEvent] = useState<any>(null);
    const [attendees, setAttendees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estado do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAttendee, setSelectedAttendee] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (churchId && id) {
            loadEventAndAttendees(id);
        }
    }, [churchId, id]);

    const loadEventAndAttendees = async (eventId: string) => {
        setIsLoading(true);
        try {
            const data = await eventApi.getById("public", eventId);
            if (data) {
                setEvent(data);
                setAttendees(data.inscricoes || []);
            }
        } catch (error) {
            console.error("Erro ao carregar inscritos:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAndSortedAttendees = attendees
        .filter((att: any) => {
            const search = searchTerm.toLowerCase();
            const nome = att.nome?.toLowerCase() || '';
            const email = att.email?.toLowerCase() || '';
            return nome.includes(search) || email.includes(search);
        })
        .sort((a, b) => {
            // Mapa de pesos para ordenação (Menor número = aparece primeiro)
            const statusWeight: Record<string, number> = {
                'PENDENTE': 1,
                'PAGO': 2,
                'CANCELADO': 3
            };

            const statusA = a.status?.toUpperCase() || '';
            const statusB = b.status?.toUpperCase() || '';

            const weightA = statusWeight[statusA] || 99;
            const weightB = statusWeight[statusB] || 99;

            // 1. Ordena por Status (Pendente > Pago > Cancelado)
            if (weightA !== weightB) {
                return weightA - weightB;
            }

            // 2. Se o status for igual, ordena por Nome (A-Z)
            return (a.nome || '').localeCompare(b.nome || '');
        });

    // --- CÁLCULO DO TOTAL CONFIRMADO ---
    const totalRevenue = attendees.reduce((acc, att) => {
        if (att.status?.toLowerCase() === 'pago') {
            return acc + (Number(event?.preco) || 0);
        }
        return acc;
    }, 0);

    const openConfirmModal = (attendee: any) => {
        setSelectedAttendee(attendee);
        setIsModalOpen(true);
    };

    const handleConfirmPayment = async () => {
        if (!selectedAttendee || !id) return;

        setIsProcessing(true);
        try {
            await eventApi.confirmPayment(id, selectedAttendee.numero_inscricao);

            setAttendees(prev => prev.map(att =>
                att.numero_inscricao === selectedAttendee.numero_inscricao
                    ? { ...att, status: 'PAGO' }
                    : att
            ));

            setIsModalOpen(false);
            setSelectedAttendee(null);
        } catch (err) {
            alert("Erro ao confirmar pagamento.");
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredAttendees = attendees.filter((att: any) => {
        const search = searchTerm.toLowerCase();
        const nome = att.nome?.toLowerCase() || '';
        const email = att.email?.toLowerCase() || '';
        return nome.includes(search) || email.includes(search);
    });

    const renderStatus = (status: string) => {
        switch (status.toLowerCase()) {
            case 'PAGO'.toLowerCase():
                return <span className="flex items-center text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-[10px] font-bold border border-emerald-100 uppercase tracking-wide"><CheckCircle size={12} className="mr-1.5" /> PAGO</span>;
            case 'PENDENTE'.toLowerCase():
                return <span className="flex items-center text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md text-[10px] font-bold border border-orange-100 uppercase tracking-wide"><Clock size={12} className="mr-1.5" /> PENDENTE</span>;
            case 'CANCELADO'.toLowerCase():
                return <span className="flex items-center text-red-700 bg-red-50 px-2.5 py-1 rounded-md text-[10px] font-bold border border-red-100 uppercase tracking-wide"><XCircle size={12} className="mr-1.5" /> CANCELADO</span>;
            default:
                return <span className="text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">{status}</span>;
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-[#1e3a8a]" size={40} /></div>;
    if (!event) return <div className="p-12 text-center text-gray-500 font-medium">Evento não encontrado.</div>;

    return (
        <div className="max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">

            {/* Modal de Confirmação */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmPayment}
                title="Confirmar Pagamento"
                description={
                    <>
                        Deseja confirmar o pagamento da inscrição de <strong>{selectedAttendee?.nome}</strong>?
                        <br /><br />
                        <span className="text-sm text-gray-500">Esta ação registrará que o pagamento foi recebido em dinheiro ou outro meio externo.</span>
                    </>
                }
                confirmText="Confirmar Recebimento"
                isProcessing={isProcessing}
                colorClass="emerald"
            />

            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 border-b border-gray-200 pb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate('/admin/events')} className="mr-5 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-[#1e3a8a]">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-[#0f172a] mb-1">{event.nomeEvento}</h1>
                        <p className="text-gray-500 text-sm flex items-center gap-2">
                            Gerenciamento de Inscritos
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            {new Date(event.dataEvento).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>

                {/* Cards de Resumo */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Total Inscritos */}
                    <div className="bg-[#eff6ff] text-[#1e3a8a] px-4 py-2.5 rounded-xl font-bold text-sm border border-blue-100 shadow-sm flex items-center">
                        Inscritos: {attendees.length}
                    </div>

                    {/* Total Arrecadado (Novo) */}
                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl font-bold text-sm border border-emerald-100 shadow-sm flex items-center">
                        <DollarSign size={16} className="mr-1.5" />
                        Recebido: R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    <button className="p-2.5 text-gray-500 hover:text-[#1e3a8a] hover:bg-white border border-gray-200 rounded-lg shadow-sm transition-all bg-white" title="Exportar CSV">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            <div className="premium-card p-0 overflow-hidden flex flex-col">

                {/* Barra de Busca */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou ID..."
                        className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700 placeholder-gray-400 font-medium"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-gray-400 text-xs uppercase font-bold border-b border-gray-100 tracking-wider">
                                <th className="px-6 py-4">Inscrito</th>
                                <th className="px-6 py-4">Contato</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Pagamento</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAndSortedAttendees.length > 0 ? (
                                filteredAndSortedAttendees.map((att: any, index: number) => (
                                    <tr key={att.numero_inscricao || att.id || index} className="hover:bg-[#eff6ff]/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-[#0f172a] text-sm">{att.nome}</p>
                                            <span className="text-[10px] text-gray-400 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 mt-1 inline-block">
                                                #{att.numero_inscricao}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 mb-0.5">{att.email}</p>
                                            <p className="text-xs text-gray-400">{att.telefone}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                            {att.data_inscricao ? new Date(att.data_inscricao).toLocaleDateString('pt-BR') : '-'}
                                        </td>

                                        <td className="px-6 py-4 text-sm">
                                            <p className='font-bold text-[#1e3a8a]'>{event.preco > 0 ? `R$ ${Number(event.preco).toFixed(2)}` : 'Grátis'}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-medium mt-0.5">{att.tipoPagamento || '-'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {renderStatus(att.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {att.status?.toLowerCase() === 'pendente' && (
                                                <button
                                                    onClick={() => openConfirmModal(att)}
                                                    disabled={isProcessing}
                                                    className="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold border border-emerald-200 transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-50"
                                                    title="Confirmar Pagamento Manualmente"
                                                >
                                                    <CheckSquare size={14} className="mr-1.5" /> Confirmar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                <AlertCircle size={32} className="opacity-30" />
                                            </div>
                                            <p className="font-medium">Nenhum inscrito encontrado.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EventAttendeesPage;