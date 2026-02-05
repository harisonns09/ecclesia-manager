import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle, CreditCard, Loader, ArrowLeft, ExternalLink, Wallet, AlertTriangle } from 'lucide-react';
import { eventApi } from '../services/api';
import { Event } from '../types';

const EventRegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  // Estados de Controle
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false); // Loader do InfinitePay
  
  // Dados
  const [event, setEvent] = useState<Event | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null); // ID da inscrição criada
  const [error, setError] = useState('');

  // Controle de Etapas: 'form' -> 'payment_selection' -> 'success'
  const [step, setStep] = useState<'form' | 'payment_selection' | 'success'>('form');
  const [finalPaymentMethod, setFinalPaymentMethod] = useState<'ONLINE' | 'CASH'>('ONLINE');

  // Parâmetros de retorno da InfinitePay (pagamento concluído)
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('status');
  const transactionId = urlParams.get('transactionId');

  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', cpf: '', lgpdConsent: false
  });

  useEffect(() => {
    if (id) loadEvent(id);
    else { setError("Evento não identificado."); setIsLoading(false); }

    // Se voltar da InfinitePay com sucesso
    if (paymentStatus === 'success') {
       setFinalPaymentMethod('ONLINE');
       setStep('success');
    }
  }, [id, paymentStatus]);

  const loadEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      const data = await eventApi.getById("public", eventId); 
      setEvent(data);
    } catch (err) {
      console.error(err);
      setError("Evento indisponível.");
    } finally {
      setIsLoading(false);
    }
  };

  const isPaidEvent = event && (event.preco || 0) > 0;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lgpdConsent) return;
    if (!event || !id) return;

    setIsProcessing(true);

    try {
      // O Backend deve retornar o ID da inscrição criada
      // Ex: { id: "105", status: "PENDENTE" }
      const response = await eventApi.register("public", id, {
        ...formData,
      });

      // Salva o ID da inscrição para usar no pagamento
      setRegistrationId(response.numeroInscricao); 

      if (isPaidEvent) {
        setStep('payment_selection'); // Vai para escolha de pagamento
      } else {
        setStep('success'); // Se for grátis, acabou
      }

    } catch (err) {
      console.error("Erro na inscrição:", err);
      alert("Erro ao salvar seus dados. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 2. PAGAMENTO ONLINE (Redireciona) ---
  const handleOnlinePayment = async () => {
    if (!event || !id || !registrationId) return;
    setIsRedirecting(true);
    
    try {
      // Chama endpoint de checkout passando o ID da inscrição JÁ CRIADA
      const response = await eventApi.createPaymentCheckout("public", id, {
         ...formData,
         amount: 1 || 0,
         numeroInscricao: registrationId // Importante: Vincula ao cadastro existente
      });
      
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        alert("Erro ao gerar link.");
        setIsRedirecting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com pagamento.");
      setIsRedirecting(false);
    }
  };

  // --- 3. PAGAMENTO EM DINHEIRO (Apenas finaliza) ---
  const handleCashPayment = async () => {
    setFinalPaymentMethod('CASH');
    // Opcional: Avisar o backend que o usuário escolheu dinheiro
    // await eventApi.updatePaymentMethod(registrationId, 'CASH');
    setStep('success');
  };

  // --- RENDERS ---

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader className="animate-spin text-blue-600" size={40} /></div>;
  if (isRedirecting) return <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><Loader className="animate-spin text-blue-600 mb-4" size={40} /><h2 className="font-bold">Indo para InfinitePay...</h2></div>;
  if (error || !event) return <div className="p-8 text-center"><h2 className="text-xl font-bold">Erro</h2><p>{error}</p></div>;


  // ======================================================
  // TELA 2: ESCOLHA DE PAGAMENTO (Onde a mágica acontece)
  // ======================================================
  if (step === 'payment_selection') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in slide-in-from-right">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-blue-600 p-6 text-white text-center">
                <CheckCircle size={48} className="mx-auto mb-2 opacity-90" />
                <h2 className="text-2xl font-bold">Pré-Inscrição Realizada!</h2>
                <p className="opacity-90">Seus dados foram salvos. Escolha como deseja pagar.</p>
            </div>

            <div className="p-8">
                <div className="bg-gray-50 rounded-xl p-4 mb-8 flex justify-between items-center border border-gray-200">
                    <span className="text-gray-600 font-medium">Valor Total</span>
                    <span className="text-2xl font-bold text-gray-900">R$ {event.preco?.toFixed(2)}</span>
                </div>

                <div className="space-y-4">
                    {/* OPÇÃO 1: ONLINE */}
                    <button 
                        onClick={handleOnlinePayment}
                        className="w-full group relative flex items-center p-4 border-2 border-emerald-500 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-all text-left"
                    >
                        <div className="bg-emerald-100 p-3 rounded-full mr-4 group-hover:bg-white transition-colors">
                            <CreditCard className="text-emerald-600" size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-emerald-900 text-lg">Pagar Online Agora</h4>
                            <p className="text-emerald-700 text-sm">Pix ou Cartão (Liberação Imediata)</p>
                        </div>
                        <ExternalLink size={20} className="text-emerald-600" />
                    </button>

                    <div className="flex items-center justify-center text-gray-400 text-sm py-2">
                        <span>ou</span>
                    </div>

                    {/* OPÇÃO 2: DINHEIRO */}
                    <button 
                        onClick={handleCashPayment}
                        className="w-full group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
                    >
                        <div className="bg-gray-100 p-3 rounded-full mr-4 group-hover:bg-white transition-colors">
                            <Wallet className="text-gray-600 group-hover:text-orange-600" size={24} />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 group-hover:text-orange-800 text-lg">Pagar no Local</h4>
                            <p className="text-gray-500 group-hover:text-orange-700 text-sm">Dinheiro ou Máquina na entrada</p>
                        </div>
                    </button>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                        <AlertTriangle size={12} />
                        Sua vaga fica reservada temporariamente.
                    </p>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // ======================================================
  // TELA 3: SUCESSO FINAL
  // ======================================================
  if (step === 'success') {
    const isCash = isPaidEvent && finalPaymentMethod === 'CASH';

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95">
        <div className={`bg-white rounded-2xl shadow-xl p-8 text-center border ${isCash ? 'border-orange-100' : 'border-green-100'}`}>
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isCash ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
            {isCash ? <Wallet size={40} /> : <CheckCircle size={40} />}
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isCash ? 'Confirmado!' : 'Pagamento Recebido!'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            Olá <strong>{formData.nome}</strong>, sua inscrição para <strong>{event.nomeEvento}</strong> está registrada.
          </p>

          {isCash && (
             <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6 text-sm text-orange-800">
                <strong>Atenção:</strong> Realize o pagamento de <b>R$ {event.preco?.toFixed(2)}</b> na entrada do evento para validar seu acesso.
             </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100">
            <h4 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">Detalhes</h4>
            <p className="text-gray-600 flex items-center mb-1"><Calendar size={14} className="mr-2"/> {new Date(event.dataEvento).toLocaleDateString('pt-BR')}</p>
            <p className="text-gray-600 flex items-center"><MapPin size={14} className="mr-2"/> {event.local}</p>
            
            {!isCash && transactionId && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400">ID Pagamento: <span className="font-mono text-gray-600">{transactionId}</span></p>
                </div>
            )}
          </div>

          <button onClick={() => navigate('/')} className="px-8 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors shadow-lg">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // TELA 1: FORMULÁRIO DE DADOS
  // ======================================================
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in">
        <button onClick={() => navigate('/')} className="flex items-center text-gray-500 mb-6"><ArrowLeft size={20} className="mr-2" /> Voltar</button>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Card Evento */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{event.nomeEvento}</h2>
            <div className="space-y-4 text-sm text-gray-600">
               <div className="flex items-center"><Calendar size={18} className="mr-3 text-blue-600" /> <span>{new Date(event.dataEvento).toLocaleDateString('pt-BR')}</span></div>
               <div className="flex items-center"><Clock size={18} className="mr-3 text-blue-600" /> <span>{event.horario}</span></div>
               <div className="flex items-center"><MapPin size={18} className="mr-3 text-blue-600" /> <span>{event.local}</span></div>
            </div>
            {isPaidEvent && <p className="text-2xl font-bold text-emerald-600 mt-4 border-t pt-4">R$ {event.preco?.toFixed(2)}</p>}
          </div>
        </div>

        {/* Formulário */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
           <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
              <div className="border-b pb-4 mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Dados da Inscrição</h3>
                  <p className="text-sm text-gray-500">Preencha seus dados para reservar sua vaga.</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                <input required className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">Email</label>
                   <input type="email" required className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">Telefone</label>
                   <input type="tel" required className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                </div>
              </div>

              {isPaidEvent && (
                <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">CPF (Para Nota Fiscal)</label>
                   <input required className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="000.000.000-00" value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                </div>
              )}

              <label className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl cursor-pointer">
                 <input type="checkbox" required checked={formData.lgpdConsent} onChange={e => setFormData({...formData, lgpdConsent: e.target.checked})} className="mt-1" />
                 <span className="text-sm text-gray-700">Concordo com os termos e desejo realizar minha inscrição.</span>
              </label>

              <button 
                  type="submit" 
                  disabled={isProcessing}
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 transition-all disabled:opacity-70"
              >
                 {isProcessing ? <Loader className="animate-spin" size={20} /> : 'Finalizar Inscrição'}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationPage;