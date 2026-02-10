import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, Calendar, HeartHandshake, ArrowLeft, Send, Star, MessageCircle, AlertCircle } from 'lucide-react'; // Adicionei AlertCircle
import { visitorApi } from '../services/api';
import { Church, Member, MemberStatus } from '../types';
import ConfirmationModal from './ConfirmationModal';

interface VisitorRegistrationPageProps {
  church: Church | null;
}

const VisitorRegistrationPage: React.FC<VisitorRegistrationPageProps> = ({ church }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para erros de validação
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    igrejaId: church?.id || '',
    nome: '',
    telefone: '',
    email: '',
    dataNascimento: '',
    status: MemberStatus.VISITOR,
    ministerio: '',
    genero: '',
    estadoCivil: '',
    cep: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    dataBatismo: '',
    observacao: ''
  });

  useEffect(() => {
    if (church) {
      setFormData(prev => ({ ...prev, igrejaId: church.id }));
    }
  }, [church]);

  // --- FUNÇÃO DE VALIDAÇÃO DE DATA ---
  const validateDate = (dateString: string | undefined): string | null => {
    if (!dateString) return null; // Campo vazio é tratado pelo 'required' do input

    const selectedDate = new Date(dateString);
    const today = new Date();
    // Zera as horas para comparar apenas o dia
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
        return "A data de nascimento não pode estar no futuro.";
    }
    
    if (selectedDate.getFullYear() < 1900) {
        return "Ano inválido.";
    }

    return null;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setFormData({ ...formData, dataNascimento: newDate });
    
    // Valida em tempo real e limpa o erro se corrigir
    const error = validateDate(newDate);
    if (error) {
        setErrors(prev => ({ ...prev, dataNascimento: error }));
    } else {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.dataNascimento;
            return newErrors;
        });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.substring(0, 11);

    let formatted = value;
    if (value.length > 10) {
      formatted = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
      formatted = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      formatted = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }

    setFormData({ ...formData, telefone: formatted });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!church) return;

    // Validação Final antes de abrir o modal
    const dateError = validateDate(formData.dataNascimento);
    if (dateError) {
        setErrors(prev => ({ ...prev, dataNascimento: dateError }));
        // Foca no campo com erro (opcional) e interrompe
        return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!church) return;

    setIsSubmitting(true);
    try {
      const payload: Omit<Member, 'id'> = {
        ...formData,
        igrejaId: church.id,
        telefone: formData.telefone.replace(/\D/g, ''),
        observacao: formData.observacao 
      };

      await visitorApi.create(church.id, payload);
      
      setIsModalOpen(false);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar cadastro. Tente novamente.");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!church) return <div className="p-8 text-center">Selecione uma igreja primeiro.</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-500">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 text-center p-10">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <HeartHandshake size={48} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#0f172a] mb-4">Seja Bem-vindo!</h2>
          <p className="text-gray-600 mb-8 text-lg leading-relaxed">
            Ficamos muito felizes com sua presença na <strong>{church.name}</strong>.
            <br />Nossa equipe de recepção entrará em contato em breve.
          </p>
          <button onClick={() => navigate('/')} className="w-full py-4 bg-[#1e3a8a] text-white rounded-xl font-bold hover:bg-[#172554] transition-all shadow-lg">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAction}
        title="Confirmar Cadastro"
        description={
          <>
            Você confirma o envio dos seus dados para a <strong>{church.name}</strong>?
            <br/><br/>
            <span className="text-sm text-gray-500">
              Nossa equipe entrará em contato pelo WhatsApp informado.
            </span>
          </>
        }
        confirmText="Sim, Confirmar"
        isProcessing={isSubmitting}
        colorClass="blue"
      />

      {/* Header */}
      <div className="bg-[#1e3a8a] px-6 pt-12 pb-24 text-center rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <button onClick={() => navigate('/')} className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-lg">
            <Star size={32} className="text-yellow-400 fill-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Cartão de Visitante</h1>
          <p className="text-blue-200 text-sm">Preencha seus dados para mantermos contato.</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-20 pb-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 animate-in slide-in-from-bottom-8 duration-700">
          
          <form onSubmit={handleFormSubmit} className="space-y-5">

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Como podemos te chamar?</label>
              <div className="relative">
                <input
                  required
                  className="input-field !pl-11 py-3.5 bg-gray-50 focus:bg-white"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                />
                <User size={20} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Seu WhatsApp</label>
              <div className="relative">
                <input
                  required
                  type="tel"
                  className="input-field !pl-11 py-3.5 bg-gray-50 focus:bg-white"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handlePhoneChange}
                />
                <Phone size={20} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* --- CAMPO DE DATA COM VALIDAÇÃO --- */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Data de Nascimento</label>
                <div className="relative">
                  <input
                    type="date"
                    // Trava datas futuras no calendário nativo
                    max={new Date().toISOString().split("T")[0]} 
                    className={`input-field !pl-11 py-3.5 bg-gray-50 focus:bg-white ${errors.dataNascimento ? '!border-red-500 !bg-red-50' : ''}`}
                    value={formData.dataNascimento}
                    onChange={handleDateChange} // Handler atualizado
                  />
                  <Calendar size={20} className={`absolute left-3.5 top-3.5 ${errors.dataNascimento ? 'text-red-500' : 'text-gray-400'}`} />
                </div>
                {/* Mensagem de Erro */}
                {errors.dataNascimento && (
                    <p className="text-red-500 text-xs mt-1 flex items-center font-medium animate-in slide-in-from-top-1">
                        <AlertCircle size={12} className="mr-1" /> {errors.dataNascimento}
                    </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Email (Opcional)</label>
                <div className="relative">
                  <input
                    type="email"
                    className="input-field !pl-11 py-3.5 bg-gray-50 focus:bg-white"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Mail size={20} className="absolute left-3.5 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 ml-1">Como nos conheceu?</label>
              <div className="relative">
                <textarea
                  rows={2}
                  className="input-field !pl-11 py-3.5 bg-gray-50 focus:bg-white resize-none"
                  placeholder="Ex: Convite de amigo, Instagram..."
                  value={formData.observacao}
                  onChange={e => setFormData({ ...formData, observacao: e.target.value })}
                />
                <MessageCircle size={20} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1e3a8a] text-white rounded-xl font-bold hover:bg-[#172554] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center mt-4 disabled:opacity-70"
            >
              <Send size={20} className="mr-2" /> Enviar Cadastro
            </button>

            <p className="text-xs text-center text-gray-400 mt-4">
              Seus dados estão seguros conosco.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VisitorRegistrationPage;