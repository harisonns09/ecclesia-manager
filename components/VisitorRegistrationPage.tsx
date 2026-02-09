import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone , Mail, Calendar, HeartHandshake, ArrowLeft, Send, CheckCircle, MessageCircle, Star } from 'lucide-react';
import { visitorApi } from '../services/api';
import { Church } from '../types';

interface VisitorRegistrationPageProps {
  church: Church | null;
}

const VisitorRegistrationPage: React.FC<VisitorRegistrationPageProps> = ({ church }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    birthDate: '',
    observation: '' // Como conheceu a igreja?
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!church) return;

    setIsSubmitting(true);
    try {
      // Envia como status 'Visitante' automaticamente
      await visitorApi.create(church.id, {
        ...formData,
        visitDate: new Date().toISOString(),
        status: 'Visitante'
      });
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar cadastro. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!church) return <div className="p-8 text-center">Selecione uma igreja primeiro.</div>;

  // TELA DE SUCESSO
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
            <br/>Nossa equipe de recepção entrará em contato em breve.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-[#1e3a8a] text-white rounded-xl font-bold hover:bg-[#172554] transition-all shadow-lg"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  // FORMULÁRIO
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header Mobile Friendly */}
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
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-1">Como podemos te chamar?</label>
                <div className="relative">
                    <input 
                        required
                        className="input-field !pl-11 py-3.5 bg-gray-50 focus:bg-white"
                        placeholder="Seu nome completo"
                        value={formData.nome}
                        onChange={e => setFormData({...formData, nome: e.target.value})}
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
                        onChange={e => setFormData({...formData, telefone: e.target.value})}
                    />
                    <Phone size={20} className="absolute left-3.5 top-3.5 text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                    <label className="text-sm font-bold text-gray-700 ml-1">Data de Nascimento</label>
                    <div className="relative">
                        <input 
                            type="date"
                            className="input-field !pl-11 py-3.5 bg-gray-50 focus:bg-white"
                            value={formData.birthDate}
                            onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        />
                        <Calendar size={20} className="absolute left-3.5 top-3.5 text-gray-400" />
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
                        value={formData.observation}
                        onChange={e => setFormData({...formData, observation: e.target.value})}
                    />
                    <MessageCircle size={20} className="absolute left-3.5 top-3.5 text-gray-400" />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-[#1e3a8a] text-white rounded-xl font-bold hover:bg-[#172554] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center mt-4 disabled:opacity-70"
            >
                {isSubmitting ? (
                    "Enviando..."
                ) : (
                    <>
                        <Send size={20} className="mr-2" /> Enviar
                    </>
                )}
            </button>

            <p className="text-xs text-center text-gray-400 mt-4">
                Seus dados estão seguros conosco e serão usados apenas para contato da igreja.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VisitorRegistrationPage;