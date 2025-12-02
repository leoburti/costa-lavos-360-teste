import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { useFilters } from '@/contexts/FilterContext';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Standard Layout for Analytics Pages
 * Ensures consistent spacing, header, and container behavior.
 */
const AnalyticsPageTemplate = ({ 
  title, 
  breadcrumbs = [], 
  description, 
  children, 
  actions,
  onRefresh 
}) => {
  const { loading } = useFilters();

  return (
    <div className="flex flex-col min-h-full w-full bg-slate-50/30">
      <Helmet>
        <title>{title} | Costa Lavos Analytics</title>
      </Helmet>

      <div className="flex-1 space-y-6 p-6 md:p-8 pt-6 max-w-[1600px] mx-auto w-full">
        <PageHeader 
          title={title} 
          breadcrumbs={breadcrumbs}
          description={description}
          actions={
            <div className="flex items-center gap-2">
              {actions}
              <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          }
        />

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPageTemplate;