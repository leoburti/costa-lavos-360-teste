import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { HardHat, TrendingUp, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from '@/components/MetricCard';

const formatCurrency = (value) => value != null ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'R$ 0,00';
const formatNumber = (value) => value != null ? value.toLocaleString('pt-BR') : '0';
const formatPercentage = (value) => value != null && isFinite(value) ? `${value.toFixed(2)}%` : 'N/A';

const EquipmentTable = ({ data }) => {
    return (
        <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Equipamento</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data && data.length > 0 ? data.map((row, index) => (
                    <TableRow key={`${row.name}-${index}`}>
                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-right">{formatNumber(row.quantity)}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan="2" className="text-center text-muted-foreground">Nenhum equipamento em campo.</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
        </div>
    );
};

const EquipmentROIAnalysisTab = ({ groupAnalysisData, clients, isGroupView }) => {
  
  const consolidatedData = useMemo(() => {
    if (isGroupView) {
        if (!groupAnalysisData || !groupAnalysisData.kpis) return null;
        return {
            total_sales_12m: groupAnalysisData.kpis.total_revenue || 0,
            equipment_estimated_value: groupAnalysisData.kpis.total_equipment_value || 0,
            equipment_details: groupAnalysisData.equipment_inventory_summary || []
        };
    } else {
        if (!clients || clients.length === 0) return null;
        const client = clients[0];
        return {
            total_sales_12m: client.total_revenue || 0,
            equipment_estimated_value: client.total_equipment || 0,
            equipment_details: client.equipment_inventory || []
        };
    }
  }, [groupAnalysisData, clients, isGroupView]);

  if (!consolidatedData) {
     return <div className="text-center p-8 text-muted-foreground">Dados de ROI não disponíveis.</div>
  }
  
  const contributionMargin = consolidatedData.total_sales_12m * 0.15;
  const consolidatedROI = consolidatedData.equipment_estimated_value > 0 
    ? (contributionMargin / consolidatedData.equipment_estimated_value) * 100 
    : 0;
  
  return (
     <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard title="ROI (Margem 15%)" value={formatPercentage(consolidatedROI)} icon={TrendingUp} />
            <MetricCard title="Vendas (Período)" value={formatCurrency(consolidatedData.total_sales_12m)} icon={DollarSign} />
            <MetricCard title="Valor dos Ativos" value={formatCurrency(consolidatedData.equipment_estimated_value)} icon={HardHat} />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Detalhes dos Equipamentos em Campo</CardTitle>
            </CardHeader>
            <CardContent>
                <EquipmentTable data={consolidatedData.equipment_details} />
            </CardContent>
        </Card>
     </motion.div>
  );
};

export default EquipmentROIAnalysisTab;