import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Download, CheckCircle, Clock, XCircle, AlertCircle, Loader } from 'lucide-react';
import { eventApi } from '../services/api';

const EventAttendeesPage: React.FC<{ churchId: string }> = ({ churchId }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<any>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (churchId && id) {
      loadEventAndAttendees(id);
    }
  }, [churchId, id]);

  const loadEventAndAttendees = async (eventId: string) => {
    setIsLoading(true);
    try {
      // Aqui buscamos a lista da igreja e filtramos o evento específico
      // O ideal seria ter um endpoint eventApi.getById(id) que já traz as inscrições
      const data = await eventApi.getById("public", eventId); 
      
      if (data) {
        setEvent(data);
        // Assumindo que o backend retorna a lista 'inscricoes' dentro do evento
        // Caso as inscrições venham de outro endpoint, ajustaríamos aqui.
        setAttendees(data.inscricoes || []);
      }
    } catch (error) {
      console.error("Erro ao carregar inscritos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para filtrar inscritos na busca
  const filteredAttendees = attendees.filter((att: any) => {
    const search = searchTerm.toLowerCase();
    const nome = att.nome?.toLowerCase() || '';
    const email = att.email?.toLowerCase() || '';
    const numeroInscricao = att.numero_inscricao?.toLowerCase() || '';
    const cpf = att.cpf?.toLowerCase() || '';
    const telefone = att.telefone?.toLowerCase() || '';
    const status = att.status?.toLowerCase() || '';
    const formaPagamento = att.tipoPagamento?.toLowerCase() || '';
    return nome.includes(search) || email.includes(search) || numeroInscricao.includes(search) || cpf.includes(search) || telefone.includes(search) || status.includes(search);
  });

  // Função para renderizar o Status com cores
  const renderStatus = (status: string) => {
    switch (status) {
      case 'PAGO':
        return <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold border border-emerald-100"><CheckCircle size={12} className="mr-1"/> PAGO</span>;
      case 'PENDENTE':
        return <span className="flex items-center text-orange-700 bg-orange-50 px-2 py-1 rounded-md text-xs font-bold border border-orange-100"><Clock size={12} className="mr-1"/> PENDENTE</span>;
      case 'CANCELADO':
        return <span className="flex items-center text-red-700 bg-red-50 px-2 py-1 rounded-md text-xs font-bold border border-red-100"><XCircle size={12} className="mr-1"/> CANCELADO</span>;
      default:
        return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs font-bold">{status}</span>;
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader className="animate-spin text-blue-600" size={40} /></div>;
  if (!event) return <div className="p-8 text-center text-gray-500">Evento não encontrado.</div>;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
            <button onClick={() => navigate('/admin/events')} className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{event.nomeEvento}</h1>
                <p className="text-gray-500 text-sm">Gerenciamento de Inscritos</p>
            </div>
        </div>
        <div className="flex gap-3">
             <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold">
                Total: {attendees.length}
             </div>
             {/* Botão placeholder para exportação futura */}
             <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg" title="Exportar CSV">
                <Download size={20} />
             </button>
        </div>
      </div>

      {/* Busca e Tabela */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Barra de Busca */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <Search size={20} className="text-gray-400" />
            <input 
                type="text" 
                placeholder="Buscar por nome ou email..." 
                className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                        <th className="p-4 font-semibold">Nome do Inscrito</th>
                        <th className="p-4 font-semibold">Contato</th>
                        <th className="p-4 font-semibold">Data Inscrição</th>
                        <th className="p-4 font-semibold">Valor</th>
                        <th className="p-4 font-semibold">Forma de Pagamento</th>
                        <th className="p-4 font-semibold text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredAttendees.length > 0 ? (
                        filteredAttendees.map((att: any) => (
                            <tr key={att.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-gray-800">{att.nome}</p>
                                    <span className="text-xs text-gray-400">ID: {att.numero_inscricao}</span>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm text-gray-600">{att.email}</p>
                                    <p className="text-xs text-gray-400">{att.telefone}</p>
                                </td>
                                <td className="p-4 text-sm text-gray-600">
                                    {att.data_inscricao ? new Date(att.data_inscricao).toLocaleDateString('pt-BR') : '-'}
                                </td>
                                <td className="p-4 text-sm font-medium text-gray-700">
                                    {event.preco > 0 ? `R$ ${event.preco.toFixed(2)}` : 'Grátis'}
                                </td>
                                <td className="p-4 text-sm font-medium text-gray-700">
                                    {att.tipoPagamento || '-'}
                                </td>
                                <td className="p-4 flex justify-center">
                                    {renderStatus(att.status)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <AlertCircle size={32} className="mb-2 text-gray-300" />
                                <p>Nenhum inscrito encontrado.</p>
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