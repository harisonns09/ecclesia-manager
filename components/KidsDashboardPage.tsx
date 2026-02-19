import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, LogOut, ShieldAlert, Baby } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { kidsApi } from '../services/api';
import { toast } from 'sonner';

const KidsDashboardPage: React.FC = () => {
  const { currentChurch } = useApp();
  const queryClient = useQueryClient();

  // Busca em tempo real (a cada 30 segundos atualiza a lista)
  const { data: kids = [] } = useQuery({
    queryKey: ['kids-active', currentChurch?.id],
    queryFn: () => kidsApi.listActive(currentChurch!.id),
    enabled: !!currentChurch,
    refetchInterval: 30000, // 30 segundos
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#0f172a] flex items-center gap-2">
            <Baby className="text-indigo-600"/>
            Sala Kids ({kids.length})
        </h2>
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full animate-pulse">
            ● Atualização em Tempo Real
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kids.map(kid => (
            <div key={kid.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
                {/* Faixa decorativa */}
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>

                <div>
                    <div className="flex justify-between items-start mb-2 pl-2">
                        <h3 className="font-bold text-lg text-gray-800 truncate">{kid.nomeCrianca}</h3>
                        <span className="bg-gray-100 text-gray-600 font-mono font-bold text-xs px-2 py-1 rounded">
                            {kid.codigoSeguranca}
                        </span>
                    </div>

                    <div className="text-sm text-gray-500 pl-2 space-y-1">
                        <p className="flex items-center gap-1"><ShieldAlert size={12}/> Resp: {kid.nomeResponsavel}</p>
                        <p className="text-xs">Tel: {kid.telefoneResponsavel}</p>
                        <p className="flex items-center gap-1 text-xs mt-2">
                            <Clock size={12}/> Entrada: {new Date(kid.dataEntrada).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </div>

                    {kid.alergias && (
                        <div className="mt-3 bg-red-50 text-red-700 text-xs font-bold p-2 rounded border border-red-100">
                            ⚠️ {kid.alergias}
                        </div>
                    )}
                </div>

                <button 
                    onClick={() => {
                        if(confirm(`Confirmar saída de ${kid.nomeCrianca}?`)) {
                            checkOutMutation.mutate(kid.id);
                        }
                    }}
                    className="mt-4 w-full py-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-gray-200 hover:border-red-200"
                >
                    <LogOut size={16}/> Realizar Check-out
                </button>
            </div>
        ))}

        {kids.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                Nenhuma criança na sala no momento.
            </div>
        )}
      </div>
    </div>
  );
};

export default KidsDashboardPage;