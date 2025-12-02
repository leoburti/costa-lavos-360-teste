import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { subDays } from 'date-fns';
import { Users, LayoutDashboard, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ClientList from '@/components/Client360/ClientList';
import Client360Dashboard from '@/components/Client360/Client360Dashboard';
import ClientGroupDashboard from '@/components/Client360/ClientGroupDashboard';
import DateRangePicker from '@/components/DateRangePicker';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClient360 } from '@/hooks/useClient360';
import { useFilters } from '@/contexts/FilterContext';

export default function Visao360ClientePage() {
  const { filters, setDateRange } = useFilters();
  // Initialize date range if not set in context
  const [dateRangeState, setDateRangeState] = useState(
    filters.dateRange || { from: subDays(new Date(), 30), to: new Date() }
  );

  // Hook to manage selection state and data fetching
  const { 
    selectedItem, 
    clientData, 
    groupData, 
    loading, 
    handleSelect, 
    handleBack 
  } = useClient360({ 
    ...filters, 
    dateRange: dateRangeState 
  }, null);

  const handleDateChange = (newRange) => {
    setDateRangeState(newRange);
    setDateRange(newRange); // Sync with context
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 gap-4 overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
      <Helmet>
        <title>Visão 360° | Costa Lavos</title>
      </Helmet>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl shadow-sm">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Visão 360°</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              Análise de performance e histórico
              {selectedItem && (
                <>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="font-medium text-primary">
                    {selectedItem.type === 'client' ? 'Cliente' : 'Grupo'} Selecionado
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
          <DateRangePicker date={dateRangeState} setDate={handleDateChange} />
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sidebar List */}
        <Card className={`
          w-full md:w-[380px] lg:w-[420px] flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900
          ${selectedItem ? 'hidden md:flex' : 'flex'}
        `}>
          <ClientList 
            onSelect={handleSelect} 
            selectedItem={selectedItem}
            dateRange={dateRangeState}
          />
        </Card>

        {/* Main Content Area */}
        <Card className={`
          flex-1 overflow-hidden flex flex-col border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900
          ${!selectedItem ? 'hidden md:flex' : 'flex'}
        `}>
          <AnimatePresence mode="wait">
            {selectedItem ? (
              <motion.div 
                key={selectedItem.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col overflow-hidden relative"
              >
                 {/* Mobile Back Button */}
                 <div className="md:hidden p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                    <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
                    </Button>
                    <span className="font-medium truncate flex-1 text-center pr-8">
                      {selectedItem.nome_fantasia || selectedItem.nome}
                    </span>
                 </div>

                 <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    {loading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                <p className="text-sm text-muted-foreground">Carregando dados detalhados...</p>
                            </div>
                        </div>
                    ) : selectedItem.type === 'client' && clientData ? (
                      <div className="h-full">
                        <Client360Dashboard 
                          data={clientData} 
                          dateRange={dateRangeState}
                          headerInfo={selectedItem} // Pass selected item for header details
                        />
                      </div>
                    ) : selectedItem.type === 'group' && groupData ? (
                      <div className="h-full">
                        <ClientGroupDashboard 
                          groupName={selectedItem.nome}
                          clients={groupData.clients_analysis ? Object.values(groupData.clients_analysis) : []} // Normalize structure if needed
                          onBack={handleBack}
                          filters={{...filters, dateRange: dateRangeState}}
                        />
                      </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            Dados não disponíveis.
                        </div>
                    )}
                 </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <LayoutDashboard className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Selecione um item para analisar
                </h3>
                <p className="max-w-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Escolha um <span className="font-medium text-primary">Cliente</span> ou <span className="font-medium text-primary">Grupo</span> na lista lateral para visualizar indicadores 360° de vendas, produtos e equipamentos.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}