import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, ArrowLeft, Loader, CheckCircle, Star } from 'lucide-react';
import { memberApi } from '../services/api';
import { Member, MemberStatus } from '../types';
import ConfirmationModal from './ConfirmationModal';
import { useApp } from '../contexts/AppContext'; // Importe o Contexto
import { toast } from 'sonner'; // Importe o Toast

// Não precisa mais receber props
const MemberRegistrationPublic: React.FC = () => {
  const navigate = useNavigate();
  
  // Consumindo a igreja do contexto (renomeando para church para manter compatibilidade com código existente)
  const { currentChurch: church } = useApp();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    igrejaId: church?.id || '',
    nome: '', email: '', telefone: '',
    dataNascimento: '', genero: 'M', estadoCivil: 'Solteiro(a)',
    cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '',
    ministerio: 'Membro',
    status: MemberStatus.ACTIVE,
    dataBatismo: ''
  });

  // Atualiza o ID da igreja se o contexto carregar depois
  useEffect(() => {
    if (church) {
      setFormData(prev => ({ ...prev, igrejaId: church.id }));
    }
  }, [church]);

  // --- Helpers ---
  const validateDate = (dateString: string | undefined): string | null => {
    if (!dateString) return null;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate > today) return "A data não pode estar no futuro.";
    if (selectedDate.getFullYear() < 1900) return "Ano inválido.";
    return null;
  };

  const handleDateChange = (field: keyof Member) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });
    const error = validateDate(value);
    setErrors(prev => {
      const newErrors = { ...prev };
      error ? (newErrors[field] = error) : delete newErrors[field];
      return newErrors;
    });
  };

  const formatPhoneNumber = (value: string | undefined) => {
    if (!value) return '';
    const n = value.replace(/\D/g, '');
    if (n.length > 10) return n.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    if (n.length > 6) return n.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    if (n.length > 2) return n.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    return n;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, telefone: formatPhoneNumber(e.target.value) });
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf
          }));
          toast.success("Endereço encontrado!");
        } else {
            toast.error("CEP não encontrado.");
        }
      } catch (error) { 
          console.error("Erro CEP", error);
          toast.error("Erro ao buscar CEP."); 
      } finally { 
          setLoadingCep(false); 
      }
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!church) {
        toast.error("Nenhuma igreja selecionada.");
        return;
    }

    const newErrors: { [key: string]: string } = {};
    const birthErr = validateDate(formData.dataNascimento);
    if (birthErr) newErrors.dataNascimento = birthErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Verifique os erros no formulário.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!church) return;
    setIsSubmitting(true);
    
    // Toast de loading
    const toastId = toast.loading('Enviando seu cadastro...');

    try {
      const payload = {
        ...formData,
        igrejaId: church.id,
        telefone: formData.telefone.replace(/\D/g, ''),
      };

      await memberApi.createPublic(church.id, payload);
      
      toast.success('Cadastro realizado com sucesso!', {
        id: toastId, // Atualiza o toast de loading
        description: `Seus dados foram enviados para ${church.name}.`
      });

      setIsSuccess(true);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar cadastro", {
        id: toastId,
        description: "Verifique sua conexão ou tente novamente."
      });
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!church) return <div className="p-8 text-center text-gray-500">Carregando dados da igreja...</div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-500">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 text-center p-10">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0f172a] mb-4">Cadastro Realizado!</h2>
          <p className="text-gray-600 mb-8">
            Seus dados foram enviados para a secretaria da <strong>{church.name}</strong>.
          </p>
          <button onClick={() => navigate('/')} className="w-full py-3 bg-[#1e3a8a] text-white rounded-xl font-bold shadow-lg hover:bg-[#172554] transition-colors">
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        title="Confirmar Cadastro"
        description="Confirma o envio dos seus dados para a ficha de membros da igreja?"
        confirmText="Sim, Enviar Ficha"
        isProcessing={isSubmitting}
        colorClass="blue"
      />

      {/* Header Público */}
      <div className="bg-[#1e3a8a] px-6 pt-10 pb-20 text-center rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <button onClick={() => navigate('/')} className="absolute top-6 left-6 text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-lg">
            <Star size={32} className="text-yellow-400 fill-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Ficha de Membro</h1>
          <p className="text-blue-200 text-sm">Atualize seus dados ou faça parte da nossa família.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8 animate-in slide-in-from-bottom-8">
          <form onSubmit={handlePreSubmit} className="space-y-8">

            {/* SEÇÃO 1: DADOS PESSOAIS */}
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <User size={14} className="mr-2" /> Dados Pessoais
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Nome Completo</label>
                  <input required className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} placeholder="Seu nome completo" />
                </div>

                <div>
                  <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Data de Nascimento</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    className={`input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100 ${errors.dataNascimento ? '!border-red-500 bg-red-50' : ''}`}
                    value={formData.dataNascimento}
                    onChange={handleDateChange('dataNascimento')}
                  />
                  {errors.dataNascimento && <p className="text-red-500 text-xs mt-1">{errors.dataNascimento}</p>}
                </div>
                <div>
                  <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Gênero</label>
                  <select className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.genero} onChange={e => setFormData({ ...formData, genero: e.target.value as 'M' | 'F' })}>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                  </select>
                </div>
                <div>
                  <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Estado Civil</label>
                  <select className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.estadoCivil} onChange={e => setFormData({ ...formData, estadoCivil: e.target.value })}>
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: CONTATO E ENDEREÇO */}
            <div className="border-t border-gray-100 pt-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                <MapPin size={14} className="mr-2" /> Contato e Endereço
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Email</label>
                  <input type="email" className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="seu@email.com" />
                </div>
                <div>
                  <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Telefone / WhatsApp</label>
                  <input className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.telefone} onChange={handlePhoneChange} placeholder="(00) 00000-0000" maxLength={15} />
                </div>

                <div className="relative md:col-span-2">
                  <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">CEP {loadingCep && <Loader size={12} className="inline animate-spin text-blue-600" />}</label>
                  <input className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.cep} onChange={e => setFormData({ ...formData, cep: e.target.value })} onBlur={handleCepBlur} placeholder="00000-000" />
                </div>

                <div className="md:col-span-2">
                  <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Endereço</label>
                  <input className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })} placeholder="Rua, Avenida..." />
                </div>

                <div className="grid grid-cols-2 gap-4 md:col-span-2">
                  <div>
                    <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Número</label>
                    <input className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.numero} onChange={e => setFormData({ ...formData, numero: e.target.value })} />
                  </div>

                  <div>
                    <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Complemento</label>
                    <input className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.complemento || ''} onChange={e => setFormData({ ...formData, complemento: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Bairro</label>
                  <input className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.bairro} onChange={e => setFormData({ ...formData, bairro: e.target.value })} />
                </div>


                <div className="grid grid-cols-3 gap-4 md:col-span-2">
                  <div className="col-span-2">
                    <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">Cidade</label>
                    <input className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.cidade} onChange={e => setFormData({ ...formData, cidade: e.target.value })} />
                  </div>
                  <div>
                    <label className="label-field block text-sm font-bold text-gray-700 mb-1 ml-1">UF</label>
                    <input className="input-field w-full p-3 bg-gray-50 rounded-lg border-none focus:ring-2 focus:ring-blue-100" value={formData.estado} onChange={e => setFormData({ ...formData, estado: e.target.value })} maxLength={2} />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#1e3a8a] text-white rounded-xl font-bold hover:bg-[#172554] transition-all shadow-lg mt-4 disabled:opacity-70 flex items-center justify-center"
            >
              {isSubmitting ? "Enviando..." : <><Save size={20} className="mr-2" /> Enviar Cadastro</>}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default MemberRegistrationPublic;