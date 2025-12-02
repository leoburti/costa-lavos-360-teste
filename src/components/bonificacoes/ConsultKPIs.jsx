import React from 'react';
import { Percent, DollarSign, AlertCircle, Package, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

const KPICard = ({ title, value, subtext, icon: Icon, loading }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            {loading ? (
                <>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-2" />
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-xs text-muted-foreground">{subtext}</p>
                </>
            )}
        </CardContent>
    </Card>
);

const ConsultKPIs = ({ kpis, loading, onRefresh }) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
                title="Limite Global (Mês)"
                value={formatCurrency(kpis.globalLimit)}
                subtext={`Baseado em ${formatCurrency(kpis.previousMonthNetSales)}`}
                icon={Percent}
                loading={loading}
            />
            <KPICard
                title="Bonificado no Mês"
                value={formatCurrency(kpis.bonifiedThisMonth)}
                subtext={`Pendente: ${formatCurrency(kpis.pendingThisMonth)}`}
                icon={DollarSign}
                loading={loading}
            />
            <KPICard
                title="Aprovações Pendentes"
                value={kpis.pendingRequestsCount}
                subtext={`Totalizando ${formatCurrency(kpis.pendingRequestsValue)}`}
                icon={AlertCircle}
                loading={loading}
            />
            <KPICard
                title="Total de Registros"
                value={kpis.totalRecords}
                subtext="No período selecionado"
                icon={Package}
                loading={loading}
            />
        </div>
    );
};

export default ConsultKPIs;