import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const BonificationStatusBadge = ({ status }) => {
    const variants = {
        'Pendente': 'bg-yellow-500',
        'Aguardando Aprovação': 'bg-yellow-500',
        'Aprovado': 'bg-green-500',
        'Aprovado Automaticamente': 'bg-teal-500',
        'Rejeitado': 'bg-red-500',
        'Aprovada - Faturamento': 'bg-purple-600',
        'Finalizado': 'bg-blue-600',
        'Faturado': 'bg-blue-600',
    };
    return <Badge className={cn('text-white', variants[status] || 'bg-gray-400')}>{status}</Badge>;
};

export default BonificationStatusBadge;