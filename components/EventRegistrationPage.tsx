import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, CreditCard, Loader, ArrowLeft, ExternalLink, Wallet, AlertTriangle, User, Mail, Phone, FileText } from 'lucide-react';
import { eventApi } from '../services/api';
import { Event } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'sonner';

const EventRegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ONLINE' | 'CASH' | null>(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'payment_selection' | 'success'>('form');
  const [finalPaymentMethod, setFinalPaymentMethod] = useState<'ONLINE' | 'CASH'>('ONLINE');

  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('status');
  const transactionId = urlParams.get('transactionId');

  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', cpf: '', lgpdConsent: false
  });

  useEffect(() => {
    if (id) {
        loadEvent(id);
    } else { 
        setError("Evento não identificado."); 
        setIsLoading(false); 
    }

    if (paymentStatus === 'success') {
      setFinalPaymentMethod('ONLINE');
      setStep('success');
      toast.success("Pagamento confirmado com sucesso!");
    }
  }, [id, paymentStatus]);

  const loadEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      const data = await eventApi.getById("public", eventId);
      setEvent(data);
    } catch (err) {
      console.error(err);
      setError("Evento indisponível ou não encontrado.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPaidEvent = event && (event.preco || 0) > 0;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lgpdConsent) {
        toast.error("Você precisa aceitar os termos de uso.");
        return;
    }
    if (!event || !id) return;

    setIsProcessing(true);
    const toastId = toast.loading("Realizando inscrição...");

    try {
      const response = await eventApi.register(id, { ...formData });
      const regId = response.numeroInscricao;
      setRegistrationId(regId);

      toast.success("Pré-inscrição realizada!", { id: toastId });

      if (isPaidEvent) {
        setStep('payment_selection');
      } else {
        setStep('success');
      }
    } catch (err: any) {
      const mensagemDoBackend = err?.response?.data?.message || "Erro ao realizar inscrição. Tente novamente.";
      toast.error(mensagemDoBackend, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const openConfirmModal = (type: 'ONLINE' | 'CASH') => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!event || !id || !registrationId || !modalType) return;
    setIsConfirmingPayment(true);
    
    const toastId = modalType === 'CASH' ? toast.loading("Confirmando opção...") : null;

    try {
      if (modalType === 'ONLINE') {
        const response = await eventApi.createPaymentCheckout("public", id, {
          ...formData,
          amount: event.preco || 0,
          numeroInscricao: registrationId
        });

        await eventApi.updatePaymentMethod("public", id, registrationId, 'ONLINE');

        if (response.checkoutUrl) {
          window.location.href = response.checkoutUrl;
        } else {
          toast.error("Erro ao gerar link de pagamento.");
          setIsConfirmingPayment(false);
          setModalOpen(false);
        }
      } else {
        await eventApi.updatePaymentMethod("public", id, registrationId, 'DINHEIRO');
        setFinalPaymentMethod('CASH');
        
        if (toastId) toast.success("Opção confirmada!", { id: toastId });
        
        setTimeout(() => {
          setModalOpen(false);
          setStep('success');
          setIsConfirmingPayment(false);
        }, 800);
      }
    } catch (err) {
      console.error(err);
      if (toastId) toast.error("Ocorreu um erro ao processar sua solicitação.", { id: toastId });
      else toast.error("Erro ao processar.");
      
      setIsConfirmingPayment(false);
      setModalOpen(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader className="animate-spin text-[#1e3a8a]" size={40} /></div>;
  
  if (error || !event) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={() => navigate('/')} className="btn-secondary w-full justify-center">
                Voltar ao Início
            </button>
        </div>
    </div>
  );

  if (step === 'payment_selection') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in slide-in-from-right relative">

        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmAction}
          isProcessing={isConfirmingPayment}
          colorClass={modalType === 'ONLINE' ? 'emerald' : 'orange'}
          title={modalType === 'ONLINE' ? 'Pagar com InfinitePay' : 'Pagar no Local'}
          confirmText={modalType === 'ONLINE' ? 'Ir para Pagamento' : 'Confirmar Vaga'}
          description={
            modalType === 'ONLINE' ? (
              <>
                Você será redirecionado para o ambiente seguro da <strong>InfinitePay</strong>.<br /><br />
                Valor a pagar: <strong className="text-emerald-600 text-xl">R$ {event.preco?.toFixed(2)}</strong>
              </>
            ) : (
              <>
                Ao confirmar, sua inscrição ficará como <strong>Pendente</strong>.<br /><br />
                Você deverá realizar o pagamento de <strong className="text-orange-600 text-xl">R$ {event.preco?.toFixed(2)}</strong> na secretaria ou entrada do evento.
              </>
            )
          }
        />

        <div className="premium-card overflow-hidden">
          <div className="bg-[#1e3a8a] p-8 text-white text-center">
            <CheckCircle size={56} className="mx-auto mb-4 opacity-90" />
            <h2 className="text-2xl font-bold">Pré-Inscrição Realizada!</h2>
            <p className="opacity-80 mt-2">Seus dados foram salvos com sucesso. Escolha como deseja pagar.</p>
          </div>

          <div className="p-8">
            <div className="bg-gray-50 rounded-xl p-5 mb-8 flex justify-between items-center border border-gray-200">
              <span className="text-gray-600 font-medium">Valor Total</span>
              <span className="text-3xl font-bold text-[#0f172a]">R$ {event.preco?.toFixed(2)}</span>
            </div>

            <div className="space-y-4">
              {/* Botão Online */}
              <button
                onClick={() => openConfirmModal('ONLINE')}
                className="w-full group relative flex items-center p-5 border-2 border-emerald-500 bg-emerald-50/50 rounded-xl hover:bg-emerald-50 transition-all text-left shadow-sm hover:shadow-md"
              >
                <div className="bg-emerald-100 p-3 rounded-full mr-5 group-hover:bg-white transition-colors">
                  <CreditCard className="text-emerald-600" size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-emerald-900 text-lg">Pagar Online Agora</h4>
                  <p className="text-emerald-700 text-sm">Pix ou Cartão (Liberação Imediata)</p>
                </div>
                <ExternalLink size={20} className="text-emerald-600" />
              </button>

              <div className="flex items-center justify-center text-gray-400 text-sm py-2 relative">
                <span className="bg-white px-2 z-10 relative">ou</span>
                <div className="absolute w-full h-px bg-gray-100 top-1/2 left-0 -z-0"></div>
              </div>

              {/* Botão Dinheiro */}
              <button
                onClick={() => openConfirmModal('CASH')}
                className="w-full group flex items-center p-5 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
              >
                <div className="bg-gray-100 p-3 rounded-full mr-5 group-hover:bg-white transition-colors">
                  <Wallet className="text-gray-600 group-hover:text-orange-600" size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 group-hover:text-orange-800 text-lg">Pagar no Local</h4>
                  <p className="text-gray-500 group-hover:text-orange-700 text-sm">Dinheiro ou Máquina na entrada</p>
                </div>
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                <AlertTriangle size={14} />
                Sua vaga fica reservada temporariamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    const isCash = isPaidEvent && finalPaymentMethod === 'CASH';

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95">
        <div className={`premium-card p-10 text-center border-t-8 ${isCash ? 'border-t-orange-500' : 'border-t-emerald-500'}`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${isCash ? 'bg-orange-50 text-orange-500' : 'bg-emerald-50 text-emerald-500'}`}>
            {isCash ? <Wallet size={48} /> : <CheckCircle size={48} />}
          </div>

          <h2 className="text-3xl font-bold text-[#0f172a] mb-3">
            {isCash ? 'Pré-Inscrição Confirmada!' : 'Pagamento Recebido!'}
          </h2>

          <p className="text-gray-600 mb-8 text-lg">
            Olá <strong>{formData.nome}</strong>, sua inscrição para <strong>{event.nomeEvento}</strong> foi registrada com sucesso.
          </p>

          {isCash && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-8 text-left flex items-start">
              <AlertTriangle className="text-orange-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-orange-900 text-sm">
                <strong>Próximo Passo:</strong> Realize o pagamento de <b>R$ {event.preco?.toFixed(2)}</b> na entrada do evento para validar seu acesso.
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left border border-gray-100 shadow-inner">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-4 tracking-wider">Detalhes do Evento</h4>
            <div className="space-y-2">
              <p className="text-gray-700 flex items-center font-medium"><Calendar size={16} className="mr-3 text-[#1e3a8a]" /> {new Date(event.dataEvento).toLocaleDateString('pt-BR')}</p>
              <p className="text-gray-700 flex items-center font-medium"><MapPin size={16} className="mr-3 text-[#1e3a8a]" /> {event.local}</p>
              <p className="text-gray-700 flex items-center font-medium"><Clock size={16} className="mr-3 text-[#1e3a8a]" /> {event.horario}</p>
            </div>

            {!isCash && transactionId && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">ID Pagamento: <span className="font-mono text-gray-600">{transactionId}</span></p>
              </div>
            )}
          </div>

          <button onClick={() => navigate('/')} className="btn-primary w-full py-4 text-lg shadow-xl">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in">
      <button onClick={() => navigate('/')} className="flex items-center text-gray-500 mb-6 hover:text-[#1e3a8a] transition-colors font-medium">
        <ArrowLeft size={20} className="mr-2" /> Voltar
      </button>

      <div className="grid md:grid-cols-3 gap-8">

        {/* Coluna da Esquerda: Detalhes do Evento */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
            <div className="h-1 w-12 bg-[#1e3a8a] rounded-full mb-4"></div>
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6 leading-tight">{event.nomeEvento}</h2>

            <div className="space-y-5 text-sm text-gray-600">
              <div className="flex items-start">
                <Calendar size={20} className="mr-3 text-[#1e3a8a] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Data</p>
                  <span>{new Date(event.dataEvento).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <div className="flex items-start">
                <Clock size={20} className="mr-3 text-[#1e3a8a] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Horário</p>
                  <span>{event.horario}</span>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin size={20} className="mr-3 text-[#1e3a8a] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Local</p>
                  <span>{event.local}</span>
                </div>
              </div>
              {event.descricao && (
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <p className="italic text-gray-500">{event.descricao}</p>
                </div>
              )}
            </div>

            {isPaidEvent ? (
              <div className="mt-6 bg-[#eff6ff] p-4 rounded-xl text-center border border-blue-100">
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Investimento</p>
                <p className="text-3xl font-extrabold text-[#1e3a8a]">R$ {event.preco?.toFixed(2)}</p>
              </div>
            ) : (
              <div className="mt-6 bg-green-50 p-4 rounded-xl text-center border border-green-100">
                <p className="text-lg font-bold text-green-700">Entrada Gratuita</p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna da Direita: Formulário */}
        <div className="md:col-span-2 premium-card p-0 overflow-hidden">
          <div className="bg-gray-50/50 p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-[#0f172a]">Ficha de Inscrição</h3>
            <p className="text-sm text-gray-500">Preencha seus dados corretamente para garantir sua vaga.</p>
          </div>

          <form onSubmit={handleFormSubmit} className="p-8 space-y-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome Completo</label>
              <div className="relative">
                <input
                  required
                  className="input-field !pl-12"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Seu nome completo"
                />
                <User size={18} className="absolute left-4 top-4 text-gray-400" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <input
                    type="email" required
                    className="input-field !pl-12"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="seu@email.com"
                  />
                  <Mail size={18} className="absolute left-4 top-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefone</label>
                <div className="relative">
                  <input
                    type="tel" required
                    className="input-field !pl-12"
                    value={formData.telefone}
                    onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                  />
                  <Phone size={18} className="absolute left-4 top-4 text-gray-400" />
                </div>
              </div>
            </div>


            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">CPF <span className="text-xs font-normal text-gray-400">(Necessário para identificação)</span></label>
              <div className="relative">
                <input
                  required
                  className="input-field !pl-12"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                />
                <FileText size={18} className="absolute left-4 top-4 text-gray-400" />
              </div>
            </div>


            <div className="pt-4">
              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer border border-gray-200 hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox" required
                  checked={formData.lgpdConsent}
                  onChange={e => setFormData({ ...formData, lgpdConsent: e.target.checked })}
                  className="mt-1 w-4 h-4 text-[#1e3a8a] rounded border-gray-300 focus:ring-[#1e3a8a]"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  Declaro que li e aceito os termos de uso. Autorizo o uso dos meus dados para fins de contato relacionados a este evento.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="btn-primary w-full py-4 text-lg shadow-lg flex items-center justify-center gap-2"
            >
              {isProcessing ? <Loader className="animate-spin" size={24} /> : 'Finalizar Inscrição'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationPage;