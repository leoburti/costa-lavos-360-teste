import React, { useState } from 'react';
import { useBonificationPerformance } from '@/hooks/bonificacoes/useBonificationPerformance';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, TrendingUp, TrendingDown, Users, User, ChevronsRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";


const KPICard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const PerformanceRow = ({ item, level, index }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.sellers && item.sellers.length > 0;
    
    const percentage = item.percentage || 0;
    let badgeVariant = "secondary";
    if (percentage < 2) badgeVariant = "success";
    else if (percentage >= 2 && percentage <= 5) badgeVariant = "default";
    else if (percentage > 5) badgeVariant = "destructive";

    return (
        <>
            <motion.tr 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => hasChildren && setIsOpen(!isOpen)}
            >
                <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                         {hasChildren && <ChevronsRight className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-90' : ''}`} />}
                        {item.name}
                    </div>
                </TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(item.totalSales)}</TableCell>
                <TableCell className="text-right font-mono">{formatCurrency(item.totalBonification)}</TableCell>
                <TableCell className="text-right">
                    <Badge variant={badgeVariant}>{formatPercentage(item.percentage)}</Badge>
                </TableCell>
            </motion.tr>
             {hasChildren && isOpen && (
                <AnimatePresence>
                    <motion.tr 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-muted/20"
                    >
                        <TableCell colSpan={4} className="p-0">
                           <div className="p-4">
                             <Table>
                               <TableHeader>
                                 <TableRow>
                                   <TableHead className="pl-6">Vendedor</TableHead>
                                   <TableHead className="text-right">Vendas</TableHead>
                                   <TableHead className="text-right">Bonificação</TableHead>
                                   <TableHead className="text-right">%</TableHead>
                                 </TableRow>
                               </TableHeader>
                               <TableBody>
                                   {item.sellers.map((seller, sellerIndex) => (
                                     <PerformanceRow key={seller.name} item={seller} level={level + 1} index={sellerIndex} />
                                   ))}
                               </TableBody>
                             </Table>
                           </div>
                        </TableCell>
                    </motion.tr>
                </AnimatePresence>
            )}
        </>
    );
};


const BonificationPerformanceExplorer = () => {
    const { data, isLoading, error } = useBonificationPerformance();

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro ao carregar dados de performance</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        );
    }
    
    const kpis = data?.kpis;
    const performanceData = data?.performanceData || [];

    const renderSkeletons = () => (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
    );
    
    if (isLoading) return renderSkeletons();
    
    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <KPICard title="% Médio de Bonificação" value={formatPercentage(kpis?.averagePercentage)} icon={TrendingUp} />
                <KPICard title="Top Supervisor" value={kpis?.topSupervisor?.name || 'N/A'} icon={Users} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Análise por Supervisor e Vendedor</CardTitle>
                    <CardDescription>
                        Explore a performance de bonificação em relação às vendas por equipe. Clique em um supervisor para ver os vendedores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Supervisor</TableHead>
                                <TableHead className="text-right">Vendas Totais</TableHead>
                                <TableHead className="text-right">Bonificação Total</TableHead>
                                <TableHead className="text-right">% Bonificação</TableHead>
                            </TableRow>
                        </TableHeader>
                         <TableBody>
                            {performanceData.length > 0 ? (
                                performanceData.map((item, index) => (
                                    <PerformanceRow key={item.name} item={item} level={0} index={index} />
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="4" className="h-24 text-center">
                                        Nenhum dado de performance encontrado para o período.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default BonificationPerformanceExplorer;