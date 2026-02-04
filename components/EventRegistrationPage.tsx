import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Hooks de Rota
import { Calendar, Clock, MapPin, User, Mail, Phone, ArrowLeft, CheckCircle, CreditCard, QrCode, Loader, AlertCircle } from 'lucide-react';
import { eventApi } from '../services/api';
import { Event } from '../types';

const EventRegistrationPage: React.FC = () => {
  // 1. Pega o ID da URL (/evento/:id/inscricao)
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [error, setError] = useState('');
  
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    lgpdConsent: false
  });

  // Carrega o evento ao iniciar
  useEffect(() => {
    if (id) {
      loadEvent(id);
    } else {
      setError("Evento não identificado.");
      setIsLoading(false);
    }
  }, [id]);

  const loadEvent = async (eventId: string) => {
    try {
      setIsLoading(true);
      // Busca o evento. 
      // Nota: Assume que getById aceita "public" ou lida com a busca sem churchId se for endpoint público
      // Se der erro aqui, certifique-se que seu backend libera o GET /api/evento/{id} sem autenticação
      const data = await eventApi.getById("public", eventId); 
      setEvent(data);
    } catch (err) {
      console.error("Erro ao carregar evento:", err);
      setError("Evento não encontrado ou indisponível.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para voltar
  const handleBack = () => {
    navigate('/'); // Volta para a Home Pública ou onde preferir
  };

  const isPaidEvent = event && (event.preco || 0) > 0;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.lgpdConsent) return;
    
    if (isPaidEvent) {
      setStep('payment');
    } else {
      completeRegistration();
    }
  };

  const completeRegistration = async () => {
    if (!event || !id) return;
    
    try {
      setIsLoading(true);
      await eventApi.register("public", id, {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone
      });
      setStep('success');
    } catch (err) {
      console.error("Erro na inscrição", err);
      alert("Erro ao realizar inscrição. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={handleBack} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Voltar para Início
        </button>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 animate-in zoom-in-95 duration-300 font-sans">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Inscrição Confirmada!</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Parabéns, <strong>{formData.nome}</strong>. Sua presença no evento <strong>{event.nomeEvento}</strong> está garantida.
            <br />
            Enviamos os detalhes para o email: {formData.email}.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleBack}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 animate-in slide-in-from-right duration-300 font-sans">
        <button onClick={() => setStep('form')} className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Voltar para dados
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-emerald-600 p-6 text-white text-center">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
              <CreditCard size={28} />
              Pagamento do Evento
            </h2>
            <p className="opacity-90 mt-2">Finalize sua inscrição realizando o pagamento</p>
          </div>

          <div className="p-8">
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">{event.nomeEvento} (Inscrição)</span>
                <span className="font-medium text-gray-900">R$ {event.preco?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-4 text-xl font-bold text-emerald-600">
                <span>Total</span>
                <span>R$ {event.preco?.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-xl">
                <QrCode size={64} className="mx-auto text-gray-400 mb-4" />
                <h4 className="font-bold text-gray-800 mb-2">Pagamento via PIX</h4>
                <p className="text-sm text-gray-500 mb-4">Escaneie o QR Code ou copie a chave abaixo</p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono break-all text-gray-600 select-all cursor-pointer hover:bg-gray-200 transition-colors">
                  00020126580014br.gov.bcb.pix0136123e4567-e89b-12d3-a456-426614174000
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-1">Instruções:</h4>
                  <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
                    <li>Realize o pagamento do valor exato.</li>
                    <li>Envie o comprovante para o WhatsApp da secretaria.</li>
                    <li>Sua inscrição será confirmada após compensação.</li>
                  </ol>
                </div>
                <button 
                  onClick={completeRegistration}
                  className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Já fiz o pagamento, Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // FORM STEP
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-300 font-sans">
      <button onClick={handleBack} className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" />
        Voltar
      </button>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Event Info Sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{event.nomeEvento}</h2>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar size={18} className="mr-3 text-blue-600" />
                <span>{new Date(event.dataEvento).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex items-center">
                <Clock size={18} className="mr-3 text-blue-600" />
                <span>{event.horario}</span>
              </div>
              <div className="flex items-center">
                <MapPin size={18} className="mr-3 text-blue-600" />
                <span>{event.local}</span>
              </div>
              {isPaidEvent && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-gray-500 mb-1">Valor da Inscrição</p>
                  <p className="text-2xl font-bold text-emerald-600">R$ {event.preco?.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Ficha de Inscrição</h3>
              <p className="text-gray-500 text-sm mt-1">Preencha seus dados corretamente</p>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center">
                  <User size={16} className="mr-2 text-gray-400" />
                  Nome Completo
                </label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Seu nome"
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Mail size={16} className="mr-2 text-gray-400" />
                    Email
                  </label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    <Phone size={16} className="mr-2 text-gray-400" />
                    Telefone / WhatsApp
                  </label>
                  <input 
                    type="tel" 
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={e => setFormData({...formData, telefone: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <label className="flex items-start cursor-pointer">
                  <input 
                    type="checkbox" 
                    required
                    className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={formData.lgpdConsent}
                    onChange={e => setFormData({...formData, lgpdConsent: e.target.checked})}
                  />
                  <div className="text-sm text-gray-700">
                    <span className="font-bold">Termo de Consentimento (LGPD)</span>
                    <p className="mt-1 text-gray-600">
                      Autorizo o uso dos meus dados pessoais para fins de comunicação referente a este evento e atividades da igreja.
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-4">
                <button 
                  type="submit" 
                  className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                >
                  {isPaidEvent ? 'Continuar para Pagamento' : 'Confirmar Inscrição Gratuita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventRegistrationPage;