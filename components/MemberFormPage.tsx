import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Save, ArrowLeft, MapPin, Loader, Church as ChurchIcon, FileText, AlertCircle } from 'lucide-react';
import { Member, MemberStatus } from '../types';
import { memberApi } from '../services/api';
import ConfirmationModal from './ConfirmationModal';

interface MemberFormProps {
  churchId: string;
}

const MemberFormPage: React.FC<MemberFormProps> = ({ churchId }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const initialFormState: Partial<Member> = {
    nome: '', email: '', telefone: '', 
    dataNascimento: '', genero: 'M', estadoCivil: 'Solteiro(a)',
    cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '',
    ministerio: 'Membro', status: MemberStatus.ACTIVE, dataBatismo: ''
  };

  const [formData, setFormData] = useState<Partial<Member>>(initialFormState);

  const validateDate = (dateString: string | undefined): string | null => {
    if (!dateString) return null;

    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
        return "A data não pode estar no futuro.";
    }
    if (selectedDate.getFullYear() < 1900) {
        return "Ano inválido.";
    }
    return null;
  };

  const handleDateChange = (field: keyof Member) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, [field]: value });

    const error = validateDate(value);
    setErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
            newErrors[field] = error;
        } else {
            delete newErrors[field];
        }
        return newErrors;
    });
  };

  const formatPhoneNumber = (value: string | undefined) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.substring(0, 11);

    if (limited.length > 10) {
        return limited.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (limited.length > 6) {
        return limited.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (limited.length > 2) {
        return limited.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }
    return limited;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, telefone: formatted });
  };

  useEffect(() => {
    if (churchId && isEditing) {
       loadMemberData();
    }
  }, [churchId, id]);

  const loadMemberData = async () => {
    setIsLoading(true);
    try {
        const member = await memberApi.getById(churchId, id!);
        if (member) {
            setFormData({
                ...member,
                telefone: formatPhoneNumber(member.telefone || '')
            });
        } else {
            alert("Membro não encontrado");
            navigate('/admin/members');
        }
    } catch (error) {
        console.error("Erro ao carregar membro", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    endereco: data.logradouro,
                    bairro: data.bairro,
                    cidade: data.localidade,
                    estado: data.uf
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP");
        } finally {
            setLoadingCep(false);
        }
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!churchId) return;

    const errorsMap: {[key:string]: string} = {};
    const birthError = validateDate(formData.dataNascimento);
    if(birthError) errorsMap.dataNascimento = birthError;

    const baptismError = validateDate(formData.dataBatismo);
    if(baptismError) errorsMap.dataBatismo = baptismError;

    if (Object.keys(errorsMap).length > 0) {
        setErrors(errorsMap);
        return;
    }

    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsSubmitting(true);

    const dataToSend = {
        ...formData,
        telefone: formData.telefone?.replace(/\D/g, '') || '',
        igrejaId: churchId
    };

    try {
      if (isEditing && id) {
        await memberApi.update(churchId, id, dataToSend);
      } else {
        await memberApi.create(churchId, dataToSend as Member);
      }
      setIsModalOpen(false);
      navigate('/admin/members');
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar membro. Tente novamente.");
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader className="animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Modal de Confirmação */}
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmSave}
        title={isEditing ? "Salvar Alterações" : "Cadastrar Membro"}
        description={
            <>
                Deseja confirmar {isEditing ? "as alterações no cadastro de" : "o cadastro de"} <strong>{formData.nome}</strong>?
            </>
        }
        confirmText="Sim, Salvar"
        isProcessing={isSubmitting}
        colorClass="emerald"
      />

      {/* Header com Botão Voltar */}
      <div className="flex items-center gap-4 mb-2">
        <button 
            onClick={() => navigate('/admin/members')}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
        >
            <ArrowLeft size={24} />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a]">
                {isEditing ? 'Editar Membro' : 'Novo Membro'}
            </h2>
            <p className="text-gray-500 text-sm">Preencha as informações abaixo.</p>
        </div>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
           <h3 className="font-bold text-lg text-[#0f172a]">Ficha Cadastral</h3>
           <div className={`px-3 py-1 rounded-full text-xs font-bold border ${isEditing ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
               {isEditing ? 'MODO EDIÇÃO' : 'NOVO CADASTRO'}
           </div>
        </div>
        
        <form onSubmit={handlePreSubmit} className="p-8 space-y-8">
          
          {/* Seção 1: Dados Pessoais */}
          <div>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <User size={16} className="mr-2" /> Dados Pessoais
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                      <label className="label-field">Nome Completo</label>
                      <input required className="input-field" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Nome completo" />
                  </div>
                  
                  
                  {/* DATA DE NASCIMENTO (Com Validação) */}
                  <div>
                      <label className="label-field">Data de Nascimento</label>
                      <input 
                        type="date" 
                        max={new Date().toISOString().split("T")[0]} // Trava HTML5
                        className={`input-field ${errors.dataNascimento ? '!border-red-500 !bg-red-50' : ''}`}
                        value={formData.dataNascimento} 
                        onChange={handleDateChange('dataNascimento')} 
                      />
                      {errors.dataNascimento && (
                        <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={12} className="mr-1"/> {errors.dataNascimento}</p>
                      )}
                  </div>

                  <div>
                      <label className="label-field">Gênero</label>
                      <select className="input-field bg-white" value={formData.genero} onChange={e => setFormData({...formData, genero: e.target.value as 'M'|'F'})}>
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                      </select>
                  </div>
                  <div>
                      <label className="label-field">Estado Civil</label>
                      <select className="input-field bg-white" value={formData.estadoCivil} onChange={e => setFormData({...formData, estadoCivil: e.target.value})}>
                          <option value="Solteiro(a)">Solteiro(a)</option>
                          <option value="Casado(a)">Casado(a)</option>
                          <option value="Viúvo(a)">Viúvo(a)</option>
                          <option value="Divorciado(a)">Divorciado(a)</option>
                      </select>
                  </div>
              </div>
          </div>

          {/* Seção 2: Contato e Endereço */}
          <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <MapPin size={16} className="mr-2" /> Contato e Endereço
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                      <label className="label-field">Email</label>
                      <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@exemplo.com" />
                  </div>
                  
                  <div>
                      <label className="label-field">Telefone / WhatsApp</label>
                      <input 
                        className="input-field" 
                        value={formData.telefone} 
                        onChange={handlePhoneChange} 
                        placeholder="(00) 00000-0000" 
                        maxLength={15} 
                      />
                  </div>

                  <div className="relative">
                      <label className="label-field">CEP {loadingCep && <Loader size={12} className="inline animate-spin text-blue-600"/>}</label>
                      <input className="input-field" value={formData.cep} onChange={e => setFormData({...formData, cep: e.target.value})} onBlur={handleCepBlur} placeholder="00000-000" />
                  </div>
                  <div className="md:col-span-2">
                      <label className="label-field">Endereço (Rua)</label>
                      <input className="input-field" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} />
                  </div>
                  <div>
                      <label className="label-field">Número</label>
                      <input className="input-field" value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
                  </div>
                  <div>
                      <label className="label-field">Complemento</label>
                      <input className="input-field" value={formData.complemento} onChange={e => setFormData({...formData, complemento: e.target.value})} />
                  </div>
                  <div>
                      <label className="label-field">Bairro</label>
                      <input className="input-field" value={formData.bairro} onChange={e => setFormData({...formData, bairro: e.target.value})} />
                  </div>
                  <div>
                      <label className="label-field">Cidade</label>
                      <input className="input-field" value={formData.cidade} onChange={e => setFormData({...formData, cidade: e.target.value})} />
                  </div>
                  <div>
                      <label className="label-field">Estado (UF)</label>
                      <input className="input-field" value={formData.estado} onChange={e => setFormData({...formData, estado: e.target.value})} maxLength={2} />
                  </div>
              </div>
          </div>

          {/* Seção 3: Dados Eclesiásticos */}
          <div className="border-t border-gray-100 pt-6">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                  <ChurchIcon size={16} className="mr-2" /> Vida Eclesiástica
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                      <label className="label-field">Ministério / Cargo</label>
                      <select className="input-field bg-white" value={formData.ministerio} onChange={e => setFormData({...formData, ministerio: e.target.value})}>
                          <option value="Membro">Membro</option>
                          <option value="Líder">Líder</option>
                          <option value="Diácono">Diácono</option>
                          <option value="Presbítero">Presbítero</option>
                          <option value="Pastor">Pastor</option>
                          <option value="Músico">Músico</option>
                      </select>
                  </div>
                  <div>
                      <label className="label-field">Status</label>
                      <select className="input-field bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as MemberStatus})}>
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                          <option value="Visitante">Visitante</option>
                      </select>
                  </div>
                  
                  {/* DATA DE BATISMO (Com Validação) */}
                  <div>
                      <label className="label-field">Data de Batismo</label>
                      <input 
                        type="date" 
                        max={new Date().toISOString().split("T")[0]}
                        className={`input-field ${errors.dataBatismo ? '!border-red-500 !bg-red-50' : ''}`}
                        value={formData.dataBatismo} 
                        onChange={handleDateChange('dataBatismo')} 
                      />
                      {errors.dataBatismo && (
                        <p className="text-red-500 text-xs mt-1 flex items-center"><AlertCircle size={12} className="mr-1"/> {errors.dataBatismo}</p>
                      )}
                  </div>
              </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
             <button type="button" onClick={() => navigate('/admin/members')} className="btn-secondary">Cancelar</button>
             <button type="submit" className="btn-primary shadow-md px-6"><Save size={18} className="mr-2" /> {isEditing ? 'Salvar Alterações' : 'Cadastrar Membro'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberFormPage;