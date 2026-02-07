import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Clock, XCircle, Calendar, MapPin, 
  User, ArrowLeft, Loader, CreditCard, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { inscricaoApi, eventApi } from '../services/api';

const RegistrationStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Estados
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (id) loadRegistrations();
  }, [id]);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const data = await inscricaoApi.getRegistrationStatus(id!);
      
      if (Array.isArray(data) && data.length > 0) {
        setRegistrations(data);
        if (data.length === 1) {
            setSelectedRegistration(data[0]);
        }
      } else {
        if (data && !Array.isArray(data)) {
             setRegistrations([data]);
             setSelectedRegistration(data);
        } else {
             setError('Nenhuma inscrição encontrada para este documento/ID.');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Inscrição não encontrada ou erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnline = async () => {
    if (!selectedRegistration) return;
    setProcessingPayment(true);
    try {
        try {
            await eventApi.updatePaymentMethod('public', String(selectedRegistration.evento.id), selectedRegistration.numeroInscricao, 'ONLINE');
        } catch (e) { /* ignore */ }

        const response = await eventApi.createPaymentCheckout(
            "public", 
            selectedRegistration.evento.id, 
            {
                nome: selectedRegistration.nome,
                email: selectedRegistration.email,
                telefone: selectedRegistration.telefone,
                cpf: selectedRegistration.cpf,
                amount: selectedRegistration.evento.preco,
                numeroInscricao: selectedRegistration.numeroInscricao
            }
        );
        
        if (response.checkoutUrl) {
            window.location.href = response.checkoutUrl;
        } else {
            alert("Erro ao gerar link de pagamento.");
        }
    } catch (err) {
        alert("Erro ao conectar com gateway de pagamento.");
    } finally {
        setProcessingPayment(false);
    }
  };

  // --- SUB-COMPONENTES DE UI ---

  const renderStatusBadgeMin = (status: string) => {
      switch (status) {
          case 'PAGO': return <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">PAGO</span>;
          case 'PENDENTE': return <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">PENDENTE</span>;
          default: return <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">{status}</span>;
      }
  };

  const renderStatusFull = (status: string) => {
    switch (status) {
      case 'Pago':
        return (
          <div className="flex flex-col items-center text-emerald-600 animate-in zoom-in duration-300">
            <div className="bg-emerald-100 p-4 rounded-full mb-4 shadow-sm">
                <CheckCircle size={48} />
            </div>
            <span className="text-2xl font-bold text-[#0f172a]">Inscrição Confirmada!</span>
            <p className="text-gray-500 mt-1">Seu pagamento foi recebido com sucesso.</p>
          </div>
        );
      case 'Pendente':
        return (
          <div className="flex flex-col items-center text-orange-500 animate-in zoom-in duration-300">
            <div className="bg-orange-100 p-4 rounded-full mb-4 shadow-sm">
                <Clock size={48} />
            </div>
            <span className="text-2xl font-bold text-[#0f172a]">Aguardando Pagamento</span>
            <p className="text-gray-500 mt-1">Realize o pagamento para garantir sua vaga.</p>
          </div>
        );
      case 'CANCELADO':
        return (
          <div className="flex flex-col items-center text-red-500 animate-in zoom-in duration-300">
            <div className="bg-red-100 p-4 rounded-full mb-4 shadow-sm">
                <XCircle size={48} />
            </div>
            <span className="text-2xl font-bold text-[#0f172a]">Inscrição Cancelada</span>
          </div>
        );
      default:
        return <span className="text-xl font-bold text-gray-600">{status}</span>;
    }
  };

  // --- RENDERIZAÇÃO PRINCIPAL ---

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader className="animate-spin text-[#1e3a8a]" size={40} /></div>;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
            <div className="text-red-500 mb-4 flex justify-center"><AlertTriangle size={48} /></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={() => navigate('/')} className="btn-primary w-full">Voltar ao Início</button>
        </div>
    </div>
  );

  // CASO 1: Lista de Inscrições
  if (!selectedRegistration && registrations.length > 0) {
      return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans animate-in fade-in">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate('/eventos')} className="flex items-center text-gray-500 mb-8 hover:text-[#1e3a8a] transition-colors font-medium">
                    <ArrowLeft size={20} className="mr-2" /> Voltar
                </button>
                
                <h1 className="text-3xl font-bold text-[#0f172a] mb-2">Minhas Inscrições</h1>
                <p className="text-gray-500 mb-8 text-lg">Encontramos {registrations.length} inscrições vinculadas ao seu documento.</p>

                <div className="space-y-4">
                    {registrations.map((reg) => (
                        <div 
                            key={reg.numeroInscricao || reg.id}
                            onClick={() => setSelectedRegistration(reg)}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all flex justify-between items-center group relative overflow-hidden"
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1e3a8a] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="flex-1">
                                <h3 className="font-bold text-[#0f172a] text-lg mb-2">{reg.evento?.nomeEvento || "Evento"}</h3>
                                <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-3">
                                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded"><Calendar size={14} className="mr-1.5 text-blue-500"/> {reg.evento?.dataEvento ? new Date(reg.evento.dataEvento).toLocaleDateString('pt-BR') : 'Data n/d'}</span>
                                    <span className="flex items-center bg-gray-50 px-2 py-1 rounded"><MapPin size={14} className="mr-1.5 text-blue-500"/> {reg.evento?.local || 'Local n/d'}</span>
                                </div>
                                {renderStatusBadgeMin(reg.status)}
                            </div>
                            <div className="text-gray-300 group-hover:text-[#1e3a8a] pl-4 transition-colors">
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      );
  }

  // CASO 2: Detalhes da Inscrição Selecionada
  if (selectedRegistration) {
      return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans animate-in slide-in-from-right">
          <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 relative">
            
            {/* Botão Voltar (se houver lista) */}
            {registrations.length > 1 && (
                <button 
                    onClick={() => setSelectedRegistration(null)}
                    className="absolute top-6 left-6 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-600 shadow-sm z-10 transition-all border border-gray-100"
                    title="Voltar para a lista"
                >
                    <ArrowLeft size={20} />
                </button>
            )}

            {/* Header Status */}
            <div className={`p-10 text-center border-b ${
                selectedRegistration.status === 'PAGO' ? 'bg-emerald-50/50 border-emerald-100' 
                : selectedRegistration.status === 'PENDENTE' ? 'bg-orange-50/50 border-orange-100' 
                : 'bg-gray-50 border-gray-200'
            }`}>
               {renderStatusFull(selectedRegistration.status)}
            </div>

            {/* Detalhes */}
            <div className="p-8 space-y-8">
                
                {/* Evento Info */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Calendar size={80} />
                    </div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Detalhes do Evento</h3>
                    <p className="text-xl font-extrabold text-[#0f172a] mb-4 leading-tight">{selectedRegistration.evento?.nomeEvento || "Evento da Igreja"}</p>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center"><Calendar size={16} className="mr-2.5 text-[#1e3a8a]" /> {selectedRegistration.evento?.dataEvento ? new Date(selectedRegistration.evento.dataEvento).toLocaleDateString('pt-BR') : 'Data a definir'}</div>
                        <div className="flex items-center"><MapPin size={16} className="mr-2.5 text-[#1e3a8a]" /> {selectedRegistration.evento?.local || 'Local a definir'}</div>
                    </div>
                </div>

                {/* Participante Info */}
                <div className="flex items-start space-x-4 p-2">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#1e3a8a] border border-blue-100 flex-shrink-0">
                        <User size={24} />
                    </div>
                    <div className="overflow-hidden flex-1">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Participante</h3>
                        <p className="font-bold text-gray-900 text-lg truncate">{selectedRegistration.nome}</p>
                        <p className="text-gray-500 text-sm truncate">{selectedRegistration.email}</p>
                        <p className="text-gray-500 text-sm">{selectedRegistration.telefone}</p>
                    </div>
                </div>

                {/* ID da Transação */}
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-sm">
                    <span className="text-gray-500 font-medium">Código da Inscrição</span>
                    <span className="font-mono bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 border border-gray-200 font-bold select-all">
                        #{selectedRegistration.numeroInscricao}
                    </span>
                </div>

                {/* Ações */}
                <div className="pt-2 space-y-3">
                    {selectedRegistration.status === 'Pendente' && (
                        <button 
                            onClick={handlePayOnline}
                            disabled={processingPayment}
                            className="btn-primary w-full py-4 text-lg shadow-lg flex items-center justify-center"
                        >
                            {processingPayment ? <Loader className="animate-spin" /> : <><CreditCard className="mr-2" /> Pagar Agora</>}
                        </button>
                    )}
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="btn-secondary w-full py-3.5 justify-center text-gray-600"
                    >
                        <ArrowLeft size={18} className="mr-2" /> Voltar ao Início
                    </button>
                </div>
            </div>
          </div>
        </div>
      );
  }

  return null;
};

export default RegistrationStatusPage;