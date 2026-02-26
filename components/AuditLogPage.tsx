import React, { useState } from 'react';
// 1. Importe keepPreviousData do pacote do react-query
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { FileText, User, Calendar, Activity, Loader, ShieldAlert } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
// 2. Importe a nova interface SpringPage
import { auditApi,  } from '../services/api';
import {AuditLogEntry, SpringPage} from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const AuditLogPage: React.FC = () => {
  const { currentChurch } = useApp();
  const [page, setPage] = useState(0);

  // 3. Tipagem explícita no useQuery <SpringPage<AuditLogEntry>>
  const { data, isLoading, isError } = useQuery<SpringPage<AuditLogEntry>>({
    queryKey: ['auditLogs', currentChurch?.id, page],
    queryFn: () => auditApi.getLogs(currentChurch!.id, page),
    enabled: !!currentChurch,
    // 4. CORREÇÃO: Na v5, 'keepPreviousData' virou 'placeholderData'
    placeholderData: keepPreviousData, 
  });

  // Agora o TypeScript sabe que 'content' e 'totalPages' existem!
  const logs = data?.content || [];
  const totalPages = data?.totalPages || 0;

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('EXCLUIR')) return 'text-red-600 bg-red-50 border-red-200';
    if (action.includes('UPDATE') || action.includes('ATUALIZAR')) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (action.includes('CREATE') || action.includes('CRIAR')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-[#0f172a] mb-1 flex items-center gap-2">
          <Activity className="text-[#1e3a8a]" /> Log de Auditoria
        </h1>
        <p className="text-gray-500 text-sm">
          Rastreamento de segurança e histórico de alterações no sistema.
        </p>
      </div>

      <div className="premium-card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Loader className="animate-spin text-[#1e3a8a] mb-2" size={32} />
            <p className="text-gray-500">Carregando registros...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">
            <ShieldAlert size={48} className="mx-auto mb-2 opacity-50" />
            <p>Erro ao carregar logs. Verifique suas permissões.</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhum registro de atividade encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                  <th className="p-4">Ação</th>
                  <th className="p-4">Entidade</th>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Data e Hora</th>
                  <th className="p-4">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {log.entityName}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={14} />
                        {log.username}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {log.timestamp ? format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '-'}
                      </div>
                    </td>
                    <td className="p-4 text-gray-500 italic max-w-xs truncate" title={log.details}>
                      {log.details || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/30">
            <button 
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-500">
              Página {page + 1} de {totalPages}
            </span>
            <button 
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;