import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, LogOut, ShieldAlert, Baby, Phone, RefreshCw, AlertTriangle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { kidsApi } from '../services/api';
// Importação dos tipos que você forneceu
import { CheckInKids } from '../types'; 
import { toast } from 'sonner';
import ConfirmationModal from './ConfirmationModal';

const getTempoPermanencia = (dataEntrada: string) => {
  const diffMs = new Date().getTime() - new Date(dataEntrada).getTime();
  const totalMinutos = Math.floor(diffMs / 60000);
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  
  return {
    texto: horas > 0 ? `${horas}h ${minutos}m` : `${minutos} min`,
    totalMinutos
  };
};

const KidsDashboardPage: React.FC = () => {
  const { currentChurch } = useApp();
  const queryClient = useQueryClient();
  const [, setNow] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKid, setSelectedKid] = useState<CheckInKids | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // QUERY: Tipada com a Interface CheckInKids
  const { data: kids = [], isLoading, isFetching, refetch } = useQuery<CheckInKids[]>({
    queryKey: ['kids-active', currentChurch?.id],
    queryFn: () => kidsApi.listActive(currentChurch!.id),
    enabled: !!currentChurch?.id,
    refetchInterval: 30000,
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: number) => kidsApi.checkOut(currentChurch!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids-active'] });
      toast.success("Check-out realizado com sucesso!");
      setIsModalOpen(false);
      setSelectedKid(null);
    },
    onError: () => {
      toast.error("Erro ao realizar check-out.");
    }
  });

  const handleCheckOutClick = (kid: CheckInKids) => {
    setSelectedKid(kid);
    setIsModalOpen(true);
  };

  if (!currentChurch) return (
    <div className="p-8 text-center text-gray-500">Selecione uma igreja para visualizar o painel.</div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => selectedKid && checkOutMutation.mutate(selectedKid.id)}
        title="Confirmar Saída"
        description={
          <>
            Deseja confirmar a saída de <strong>{selectedKid?.nomeCrianca}</strong>?
            <p className="text-sm text-gray-500 mt-2">Responsável: {selectedKid?.nomeResponsavel}</p>
          </>
        }
        confirmText="Confirmar Saída"
        isProcessing={checkOutMutation.isPending}
        colorClass="blue"
      />

      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                <Baby className="text-indigo-600" size={28}/>
                Painel Kids 
                <span className="bg-indigo-100 text-indigo-800 text-sm py-0.5 px-2.5 rounded-full ml-2">
                    {kids.length} {kids.length === 1 ? 'criança' : 'crianças'}
                </span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Gerenciamento em tempo real.</p>
        </div>
        
        <div className="flex items-center gap-3">
            {(isFetching || isLoading) && <RefreshCw size={16} className="animate-spin text-indigo-500" />}
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-wider">Ao Vivo</span>
            </div>
            <button onClick={() => refetch()} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <RefreshCw size={18} />
            </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="animate-spin text-indigo-600 mb-4" size={48} />
            <p className="text-gray-500 animate-pulse">Carregando painel...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kids.map((kid) => {
              const permanencia = getTempoPermanencia(kid.dataEntrada);
              const isOverdue = permanencia.totalMinutos >= 120; // Alerta após 2h

              return (
                <div key={kid.id} className={`bg-white rounded-xl p-5 shadow-sm border ${isOverdue ? 'border-amber-200 ring-1 ring-amber-100' : 'border-gray-200'} flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group`}>
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${isOverdue ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>

                    <div>
                        <div className="flex justify-between items-start mb-3 pl-2">
                            <div className="min-w-0 pr-2">
                                <h3 className="font-bold text-lg text-gray-900 truncate">{kid.nomeCrianca}</h3>
                                <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                    <Clock size={12}/> Entrada: {new Date(kid.dataEntrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                            <span className="bg-gray-100 text-gray-800 font-mono font-bold text-sm px-2.5 py-1 rounded border border-gray-200 shrink-0">
                                {kid.codigoSeguranca}
                            </span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 ml-2 space-y-2 border border-gray-100">
                            <p className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                <ShieldAlert size={14} className="text-indigo-400"/> {kid.nomeResponsavel}
                            </p>
                            <p className="flex items-center gap-2 text-xs text-gray-600">
                                <Phone size={14} className="text-gray-400"/> {kid.telefoneResponsavel}
                            </p>
                        </div>

                        {/* Campo Alergias vindo da Interface CheckInKids */}
                        {kid.alergias && (
                            <div className="mt-3 ml-2 bg-red-50 text-red-700 text-[11px] font-bold p-2 rounded border border-red-100 flex items-start gap-2">
                                <AlertTriangle size={14} className="shrink-0" />
                                <span>ALERGIA: {kid.alergias}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 ml-2 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-xs font-medium flex flex-col">
                            <span className="text-gray-400">Permanência:</span>
                            <span className={`${isOverdue ? 'text-amber-600' : 'text-indigo-600'} font-bold`}>
                                {permanencia.texto}
                            </span>
                        </div>
                        <button 
                            onClick={() => handleCheckOutClick(kid)}
                            disabled={checkOutMutation.isPending}
                            className="py-1.5 px-3 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-gray-200 disabled:opacity-50"
                        >
                            <LogOut size={14}/> Saída
                        </button>
                    </div>
                </div>
              );
            })}

            {kids.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                    <Baby size={48} className="text-gray-300 mb-3" />
                    <p className="font-medium text-gray-500">Nenhuma criança na sala no momento.</p>
                    <p className="text-sm mt-1">Aguardando novos check-ins...</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default KidsDashboardPage;