import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { User } from 'lucide-react';

import { useFilters } from '@/contexts/FilterContext';
import { Card, CardContent } from '@/components/ui/card';
import SupervisorDetailPanel from '@/components/supervisor/SupervisorDetailPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';

const RaioXSupervisor = () => {
  const { filters } = useFilters();
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  const startDate = filters.dateRange?.from ? format(filters.dateRange.from, 'yyyy-MM-dd') : format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const endDate = filters.dateRange?.to ? format(filters.dateRange.to, 'yyyy-MM-dd') : format(endOfMonth(new Date()), 'yyyy-MM-dd');

  // Fetch list of supervisors names only
  const { data: supervisorsList } = useAnalyticalData('get_supervisor_reports', {
    p_start_date: startDate,
    p_end_date: endDate,
    p_exclude_employees: true,
    p_supervisors: null,
    p_sellers: null,
    p_customer_groups: null,
    p_regions: null,
    p_clients: null,
    p_search_term: null,
    p_fetch_only_names: true,
    p_target_supervisor: null
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Raio-X Supervisor | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Raio-X do Supervisor</h1>
          <p className="text-muted-foreground">Análise profunda de performance individual (One-on-One).</p>
        </div>
        
        <div className="w-full md:w-64">
          <Select value={selectedSupervisor || ''} onValueChange={setSelectedSupervisor}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um Supervisor" />
            </SelectTrigger>
            <SelectContent>
              {supervisorsList?.map((name) => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedSupervisor ? (
        <Card className="border-dashed border-2 border-slate-200 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <div className="p-4 bg-white rounded-full shadow-sm mb-4">
              <User className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Nenhum Supervisor Selecionado</h3>
            <p className="text-slate-500 max-w-md mt-2">
              Selecione um supervisor no menu acima para visualizar o relatório detalhado de performance, carteira e equipe.
            </p>
          </CardContent>
        </Card>
      ) : (
        <SupervisorDetailPanel 
          supervisorName={selectedSupervisor} 
          dateRange={{ from: new Date(startDate), to: new Date(endDate) }} 
        />
      )}
    </div>
  );
};

export default RaioXSupervisor;