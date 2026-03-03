import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, LogOut, ShieldAlert, Baby, Phone } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { kidsApi } from '../services/api';
import { toast } from 'sonner';

// Função para calcular o tempo que a criança está na sala
const getTempoPermanencia = (dataEntrada: string) => {
  const diffMs = new Date().getTime() - new Date(dataEntrada).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const horas = Math.floor(diffMins / 60);
  const minutos = diffMins % 60;
  
  if (horas > 0) return `${horas}h ${minutos}m`;
  return `${minutos} min`;
};

const KidsDashboardPage: React.FC = () => {
  const { currentChurch } = useApp();
  const queryClient = useQueryClient();
  const [now, setNow] = useState(new Date());

  // Atualiza o relógio interno a cada 1 minuto para manter o "tempo de permanência" real
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const { data: kids = [] } = useQuery({
    queryKey: ['kids-active', currentChurch?.id],
    queryFn: () => kidsApi.listActive(currentChurch!.id),
    enabled: !!currentChurch,
    refetchInterval: 30000,
  });

  const checkOutMutation = useMutation({
    mutationFn: (id: number) => kidsApi.checkOut(currentChurch!.id, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kids-active'] });
      toast.success("Check-out realizado com sucesso!");
    },
  });

  if (!currentChurch) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
                <Baby className="text-indigo-600" size={28}/>
                Painel Kids 
                <span className="bg-indigo-100 text-indigo-800 text-sm py-0.5 px-2.5 rounded-full ml-2">
                    {kids.length} {kids.length === 1 ? 'criança' : 'crianças'}
                </span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">Gerenciamento de entrada e saída em tempo real.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold uppercase tracking-wider">Ao Vivo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kids.map((kid: any) => (
            <div key={kid.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500 group-hover:bg-indigo-600 transition-colors"></div>

                <div>
                    <div className="flex justify-between items-start mb-3 pl-2">
                        <div className="min-w-0 pr-2">
                            <h3 className="font-bold text-lg text-gray-900 truncate leading-tight">{kid.nomeCrianca}</h3>
                            <p className="text-xs font-medium text-gray-500 mt-0.5 flex items-center gap-1">
                                <Clock size={12}/> Entrada: {new Date(kid.dataEntrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                        </div>
                        <span className="bg-gray-100 text-gray-800 font-mono font-bold text-sm px-2.5 py-1 rounded border border-gray-200 shadow-sm shrink-0">
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

                    {/* CORREÇÃO: Usando kid.observacoes que vem do DTO */}
                    {kid.observacoes && (
                        <div className="mt-3 ml-2 bg-red-50 text-red-700 text-xs font-bold p-2.5 rounded-lg border border-red-200 flex items-start gap-2">
                            <span className="shrink-0">⚠️</span>
                            <span>{kid.observacoes}</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 ml-2 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-500 font-medium flex flex-col">
                        <span>Tempo na sala:</span>
                        <span className="text-indigo-600 font-bold">{getTempoPermanencia(kid.dataEntrada)}</span>
                    </div>
                    <button 
                        onClick={() => {
                            if(confirm(`Confirmar a saída e entregar ${kid.nomeCrianca} ao responsável?`)) {
                                checkOutMutation.mutate(kid.id);
                            }
                        }}
                        disabled={checkOutMutation.isPending}
                        className="py-1.5 px-3 bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 border border-gray-200 hover:border-red-200 disabled:opacity-50"
                    >
                        <LogOut size={14}/> Saída
                    </button>
                </div>
            </div>
        ))}

        {kids.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                <Baby size={48} className="text-gray-300 mb-3" />
                <p className="font-medium text-gray-500">Nenhuma criança na sala no momento.</p>
                <p className="text-sm mt-1">Aguardando novos check-ins...</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default KidsDashboardPage;