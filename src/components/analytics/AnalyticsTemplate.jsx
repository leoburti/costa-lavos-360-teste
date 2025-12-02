import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database } from 'lucide-react';
import AdvancedFilters from '@/components/AdvancedFilters';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

export default function AnalyticsTemplate({ 
  title, 
  description, 
  breadcrumbs, 
  children, 
  onRefresh, 
  loading, 
  isMock,
  filters, 
  setFilters
}) {
  return (
    <div className="flex flex-col min-h-full w-full bg-slate-50/30">
      <Helmet>
        <title>{title} | Costa Lavos 360</title>
      </Helmet>

      <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {/* Header */}
        <PageHeader 
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center gap-2">
              {filters && setFilters && (
                <AdvancedFilters filters={filters} setFilters={setFilters} />
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh} 
                disabled={loading}
                className="bg-white h-9"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          }
        />

        {/* Mock Data Warning */}
        {isMock && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
              <Database className="h-4 w-4" />
              <AlertDescription className="ml-2 font-medium text-xs">
                Usando dados simulados. A conexão com o banco de dados pode estar instável ou não retornou resultados.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Content */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}