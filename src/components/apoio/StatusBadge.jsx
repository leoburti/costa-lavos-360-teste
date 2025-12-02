import React from 'react';
import { Badge } from '@/components/ui/badge';

const StatusBadge = ({ status, type = 'ticket' }) => {
  // Ticket Statuses
  const ticketVariants = {
    aberto: { label: 'Aberto', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' },
    em_andamento: { label: 'Em Andamento', className: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' },
    resolvido: { label: 'Resolvido', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200' },
    fechado: { label: 'Fechado', className: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200' },
    aguardando: { label: 'Aguardando', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200' },
    critica: { label: 'Crítica', className: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' },
    alta: { label: 'Alta', className: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200' },
    media: { label: 'Média', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200' },
    baixa: { label: 'Baixa', className: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' },
  };

  // System Statuses
  const serviceVariants = {
    operacional: { label: 'Operacional', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200' },
    degradado: { label: 'Degradado', className: 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200' },
    indisponivel: { label: 'Indisponível', className: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200' },
    manutencao: { label: 'Manutenção', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200' },
  };

  const variants = type === 'service' ? serviceVariants : ticketVariants;
  const config = variants[status?.toLowerCase()] || { label: status, className: 'bg-slate-100 text-slate-700' };

  return (
    <Badge variant="outline" className={`font-medium border ${config.className}`}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;