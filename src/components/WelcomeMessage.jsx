import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const WelcomeMessage = ({ user, lastSaleDate, projectedRevenue }) => {
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const userName = user?.user_metadata?.full_name?.split(' ')[0] || 'Guerreiro(a)';
    const today = format(new Date(), "eeee, d 'de' MMMM", { locale: ptBR });

    return (
        <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                {getGreeting()}, {userName}!
            </h1>
            <p className="text-muted-foreground text-base">
                Hoje é {today}.
                {projectedRevenue > 0 && ` A projeção de receita para este mês é de ${formatCurrency(projectedRevenue)}.`}
            </p>
        </div>
    );
};