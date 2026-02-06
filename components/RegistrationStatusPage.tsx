import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Clock, XCircle, Calendar, MapPin, 
  User, ArrowLeft, Loader, CreditCard, ChevronRight 
} from 'lucide-react';
import { inscricaoApi, eventApi } from '../services/api';

const RegistrationStatusPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Mudança 1: Agora guardamos a lista E a inscrição selecionada
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
      // O backend retorna uma lista agora (Array)
      const data = await inscricaoApi.getRegistrationStatus(id!);
      
      if (Array.isArray(data) && data.length > 0) {
        setRegistrations(data);
        // Se só tiver uma, seleciona automaticamente
        if (data.length === 1) {
            setSelectedRegistration(data[0]);
        }
      } else {
        // Caso venha objeto único (compatibilidade) ou array vazio
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
        // Atualiza método para ONLINE
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
          case 'PAGO': return <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">PAGO</span>;
          case 'PENDENTE': return <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">PENDENTE</span>;
          default: return <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">{status}</span>;
      }
  };

  const renderStatusFull = (status: string) => {
    switch (status) {
      case 'Pago':
        return (
          <div className="flex flex-col items-center text-emerald-600 animate-in zoom-in">
            <CheckCircle size={64} className="mb-2" />
            <span className="text-2xl font-bold">Inscrição Confirmada!</span>
            <p className="text-emerald-700">Seu pagamento foi recebido.</p>
          </div>
        );
      case 'Pendente':
        return (
          <div className="flex flex-col items-center text-orange-500 animate-in zoom-in">
            <Clock size={64} className="mb-2" />
            <span className="text-2xl font-bold">Aguardando Pagamento</span>
            <p className="text-orange-700">Realize o pagamento para garantir sua vaga.</p>
          </div>
        );
      case 'CANCELADO':
        return (
          <div className="flex flex-col items-center text-red-500 animate-in zoom-in">
            <XCircle size={64} className="mb-2" />
            <span className="text-2xl font-bold">Inscrição Cancelada</span>
          </div>
        );
      default:
        return <span className="text-xl font-bold text-gray-600">{status}</span>;
    }
  };

  // --- RENDERIZAÇÃO PRINCIPAL ---

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader className="animate-spin text-blue-600" size={40} /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 font-bold px-4 text-center">{error}</div>;

  // CASO 1: Lista de Inscrições (Usuário tem que escolher qual quer ver)
  if (!selectedRegistration && registrations.length > 0) {
      return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
            <div className="max-w-xl mx-auto">
                <button onClick={() => navigate('/eventos')} className="flex items-center text-gray-500 mb-6 hover:text-gray-700">
                    <ArrowLeft size={20} className="mr-2" /> Voltar
                </button>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Minhas Inscrições</h1>
                <p className="text-gray-500 mb-6">Encontramos {registrations.length} inscrições vinculadas ao seu documento.</p>

                <div className="space-y-4">
                    {registrations.map((reg) => (
                        <div 
                            key={reg.numeroInscricao || reg.id}
                            onClick={() => setSelectedRegistration(reg)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all flex justify-between items-center group"
                        >
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg mb-1">{reg.evento?.nomeEvento || "Evento"}</h3>
                                <div className="flex items-center text-sm text-gray-500 gap-3 mb-2">
                                    <span className="flex items-center"><Calendar size={14} className="mr-1"/> {reg.evento?.dataEvento ? new Date(reg.evento.dataEvento).toLocaleDateString('pt-BR') : 'Data n/d'}</span>
                                    <span className="flex items-center"><MapPin size={14} className="mr-1"/> {reg.evento?.local || 'Local n/d'}</span>
                                </div>
                                {renderStatusBadgeMin(reg.status)}
                            </div>
                            <div className="text-gray-300 group-hover:text-blue-600">
                                <ChevronRight size={24} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      );
  }

  // CASO 2: Detalhes da Inscrição Selecionada (Igual ao anterior)
  if (selectedRegistration) {
      return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
          <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
            
            {/* Se tiver mais de uma, botão para voltar para a lista */}
            {registrations.length > 1 && (
                <button 
                    onClick={() => setSelectedRegistration(null)}
                    className="absolute top-4 left-4 p-2 bg-black/10 rounded-full hover:bg-black/20 text-white z-10"
                    title="Voltar para a lista"
                >
                    <ArrowLeft size={20} />
                </button>
            )}

            {/* Header Status */}
            <div className={`p-8 text-center border-b ${selectedRegistration.status === 'PAGO' ? 'bg-emerald-50 border-emerald-100' : selectedRegistration.status === 'PENDENTE' ? 'bg-orange-50 border-orange-100' : 'bg-gray-50'}`}>
               {renderStatusFull(selectedRegistration.status)}
            </div>

            {/* Detalhes */}
            <div className="p-8 space-y-6">
                
                {/* Evento Info */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Evento</h3>
                    <p className="text-xl font-bold text-gray-900 mb-1">{selectedRegistration.evento?.nomeEvento || "Evento da Igreja"}</p>
                    
                    <div className="flex flex-col gap-1 text-gray-600 text-sm mt-2">
                        <span className="flex items-center"><Calendar size={16} className="mr-2 text-blue-500" /> {selectedRegistration.evento?.dataEvento ? new Date(selectedRegistration.evento.dataEvento).toLocaleDateString('pt-BR') : 'Data a definir'}</span>
                        <span className="flex items-center"><MapPin size={16} className="mr-2 text-blue-500" /> {selectedRegistration.evento?.local || 'Local a definir'}</span>
                    </div>
                </div>

                {/* Participante Info */}
                <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3">Dados do Participante</h3>
                    <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                            <User size={20} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-bold text-gray-900 truncate">{selectedRegistration.nome}</p>
                            <p className="text-gray-500 text-sm truncate">{selectedRegistration.email}</p>
                            <p className="text-gray-500 text-sm">{selectedRegistration.telefone}</p>
                        </div>
                    </div>
                </div>

                {/* ID da Transação */}
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                    <span className="text-gray-500">ID Inscrição:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">#{selectedRegistration.numeroInscricao}</span>
                </div>

                {/* Ações */}
                <div className="pt-4 space-y-3">
                    {selectedRegistration.status === 'Pendente' && (
                        <button 
                            onClick={handlePayOnline}
                            disabled={processingPayment}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg flex items-center justify-center transition-all"
                        >
                            {processingPayment ? <Loader className="animate-spin" /> : <><CreditCard className="mr-2" /> Pagar Agora</>}
                        </button>
                    )}
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 flex items-center justify-center transition-all"
                    >
                        <ArrowLeft size={20} className="mr-2" /> Voltar ao Início
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