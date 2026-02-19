import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Printer, CheckCircle, Baby, Shield, User, RefreshCw, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../contexts/AppContext';
import { kidsApi } from '../services/api';
import { kidsCheckInSchema, KidsFormData } from '../schemas/kidsSchema';
import { CheckInKids } from '../types';

const formatPhone = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const KidsCheckInPage: React.FC = () => {
  const { currentChurch } = useApp();
  const [checkInSuccess, setCheckInSuccess] = useState<CheckInKids | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<KidsFormData>({
    resolver: zodResolver(kidsCheckInSchema),
    defaultValues: {
        nomeCrianca: '',
        nomeResponsavel: '',
        telefoneResponsavel: '',
        alergias: '',
        observacoes: ''
    }
  });

  const phoneValue = watch('telefoneResponsavel');

  const checkInMutation = useMutation({
    mutationFn: (data: KidsFormData) => {
        const payload = {
            ...data,
            igrejaId: currentChurch!.id,
            telefoneResponsavel: data.telefoneResponsavel.replace(/\D/g, '')
        };
        return kidsApi.checkIn(currentChurch!.id, payload);
    },
    onSuccess: (data: CheckInKids) => {
      setCheckInSuccess(data);
      toast.success("Check-in realizado! Imprima a etiqueta.");
    },
    onError: () => toast.error("Erro ao realizar check-in.")
  });

  const onSubmit = (data: KidsFormData) => {
    if (!currentChurch) return;
    checkInMutation.mutate(data);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewCheckIn = () => {
    setCheckInSuccess(null);
    reset();
  };

  if (checkInSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in zoom-in duration-300">
        <CheckCircle size={64} className="text-emerald-500" />
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Check-in Confirmado!</h2>
          <p className="text-gray-500">Criança liberada para entrar.</p>
        </div>

        <div className="bg-gray-100 p-8 rounded-2xl border-2 border-dashed border-gray-300 min-w-[300px]">
          <p className="text-sm font-bold text-gray-400 uppercase">Código de Segurança</p>
          <p className="text-5xl font-mono font-black text-[#0f172a] tracking-widest my-2">
            {checkInSuccess.codigoSeguranca}
          </p>
          <p className="text-sm text-gray-500">{checkInSuccess.nomeCrianca}</p>
        </div>

        <div className="flex gap-4 print:hidden">
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2 shadow-lg">
            <Printer size={20} /> Imprimir Etiqueta
          </button>
          <button onClick={handleNewCheckIn} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={20} /> Novo Check-in
          </button>
        </div>

        <div className="hidden print:block fixed top-0 left-0 w-[80mm] h-auto bg-white p-1 text-black z-[9999]">
             <div className="text-center border-2 border-black p-2 rounded-lg box-border">
                <h1 className="text-xl font-bold truncate leading-tight">{checkInSuccess.nomeCrianca}</h1>
                <h2 className="text-4xl font-black my-2 tracking-widest">{checkInSuccess.codigoSeguranca}</h2>
                <div className="text-xs text-left mt-2 border-t border-black pt-1 leading-snug">
                    <p><strong>Resp:</strong> {checkInSuccess.nomeResponsavel}</p>
                    <p><strong>Tel:</strong> {checkInSuccess.telefoneResponsavel}</p>
                    {checkInSuccess.alergias && (
                        <p className="font-bold mt-1 uppercase border-2 border-black p-1 text-center">
                           ⚠️ ALERGIA: {checkInSuccess.alergias} 
                        </p>
                    )}
                    <p className="text-[10px] mt-1 text-center">{new Date().toLocaleTimeString()}</p>
                </div>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
          <Baby size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0f172a]">Check-in Kids (Rápido)</h2>
          <p className="text-sm text-gray-500">Cadastro simplificado para visitantes e membros.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="premium-card p-8 space-y-6">
        
        <div className="space-y-4">
            <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                <Baby size={16}/> Dados da Criança
            </h3>
            
            <div>
                <label className="label-field">Nome da Criança</label>
                <input 
                    {...register('nomeCrianca')} 
                    className={`input-field text-lg ${errors.nomeCrianca ? 'border-red-500 bg-red-50' : ''}`}
                    placeholder="Nome completo"
                    autoFocus 
                />
                {errors.nomeCrianca && <p className="text-red-500 text-xs mt-1">{errors.nomeCrianca.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label-field">Alergias / Restrições</label>
                    <input 
                        {...register('alergias')} 
                        className="input-field border-red-200 focus:border-red-500 focus:ring-red-100 placeholder-red-300" 
                        placeholder="Ex: Amendoim, Lactose..." 
                    />
                </div>
                <div>
                    <label className="label-field">Observações Gerais</label>
                    <input 
                        {...register('observacoes')} 
                        className="input-field" 
                        placeholder="Ex: Mochila azul..." 
                    />
                </div>
            </div>
        </div>

        <div className="border-t border-gray-100 my-4"></div>

        <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-2">
                <Shield size={16}/> Dados do Responsável
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-1">
                    <label className="label-field">Nome do Responsável</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3.5 text-gray-400" size={20}/>
                        <input 
                            {...register('nomeResponsavel')} 
                            className={`input-field !pl-10 ${errors.nomeResponsavel ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="Nome de quem trouxe" 
                        />
                    </div>
                    {errors.nomeResponsavel && <p className="text-red-500 text-xs mt-1">{errors.nomeResponsavel.message}</p>}
                </div>

                <div className="col-span-1 md:col-span-1">
                    <label className="label-field">Telefone (Emergência)</label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3.5 text-gray-400" size={20}/>
                        <input 
                            {...register('telefoneResponsavel')}
                            onChange={(e) => {
                                setValue('telefoneResponsavel', formatPhone(e.target.value));
                            }} 
                            className={`input-field !pl-10 ${errors.telefoneResponsavel ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="(99) 99999-9999" 
                            maxLength={15}
                        />
                    </div>
                    {errors.telefoneResponsavel && <p className="text-red-500 text-xs mt-1">{errors.telefoneResponsavel.message}</p>}
                </div>
            </div>
        </div>

        <button 
            type="submit"
            disabled={checkInMutation.isPending}
            className="btn-primary w-full py-4 text-xl shadow-xl mt-6 flex justify-center items-center gap-2 font-bold"
        >
            {checkInMutation.isPending ? 'Gerando Código...' : (
                <><Printer size={24} /> Confirmar e Imprimir</>
            )}
        </button>
      </form>
    </div>
  );
};

export default KidsCheckInPage;