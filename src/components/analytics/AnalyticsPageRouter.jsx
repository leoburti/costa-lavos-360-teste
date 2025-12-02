
import React, { Suspense, lazy, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAnalyticsPage } from '@/hooks/useAnalyticsPage';
import AnalyticsTemplate from '@/components/analytics/AnalyticsTemplate';
import { LoadingState, ErrorState } from '@/components/common';
import { Helmet } from 'react-helmet-async';

// Mapping of route paths to lazy loaded components
const COMPONENT_MAP = {
  // Dashboard Group
  'dashboard-gerencial': lazy(() => import('@/pages/analytics/DashboardGerencial')),
  'visao-360-cliente': lazy(() => import('@/pages/Visao360Cliente')), 
  'analitico-supervisor': lazy(() => import('@/pages/analytics/AnaliticoSupervisorPage')),
  'analitico-vendedor': lazy(() => import('@/pages/AnaliticoVendedor')),
  'analitico-regiao': lazy(() => import('@/pages/AnaliticoRegiao')),
  'analitico-grupo-clientes': lazy(() => import('@/pages/AnaliticoGrupoClientes')),
  'analitico-produto': lazy(() => import('@/pages/AnaliticoProduto')),
  'analitico-vendas-diarias': lazy(() => import('@/pages/AnaliticoVendasDiarias')),

  // Analysis Group
  'analise-churn': lazy(() => import('@/pages/AnaliseChurn')),
  'analise-rfm': lazy(() => import('@/pages/AnaliseDesempenhoFidelidade')),
  'analise-abc-produtos': lazy(() => import('@/pages/dashboard/CurvaABC')), 
  'analise-abc-clientes': lazy(() => import('@/pages/dashboard/CurvaABC')), 
  'analise-sazonalidade': lazy(() => import('@/pages/AnaliseSazonalidade')),
  'analise-margem-lucro': lazy(() => import('@/pages/AnaliseMargem')),
  'analise-ticket-medio': lazy(() => import('@/pages/AnaliseValorUnitario')),
  'analise-preditiva': lazy(() => import('@/pages/analytics/AnalisePreditiva')), // Pointing to the new file

  // Reports Group
  'relatorio-financeiro-receita': lazy(() => import('@/pages/relatorios/financeiro/RelatoriFinanceiroReceita')),
  'relatorio-financeiro-margem': lazy(() => import('@/pages/relatorios/financeiro/RelatoriFinanceiroMargem')),
  'relatorio-financeiro-lucratividade': lazy(() => import('@/pages/relatorios/financeiro/RelatoriFinanceiroLucratividade')),
  
  'relatorio-desempenho-meta': lazy(() => import('@/pages/relatorios/desempenho/RelatoriDesempenhoMeta')),
  'relatorio-desempenho-ranking': lazy(() => import('@/pages/relatorios/desempenho/RelatoriDesempenhoRanking')),
  
  'relatorio-operacional-sla': lazy(() => import('@/pages/relatorios/operacional/RelatoriOperacionalSla')),
};

const AnalyticsPageRouter = ({ page: propPage }) => {
  const { page: paramPage } = useParams();
  const page = propPage || paramPage;

  const { config, data, loading, error, refetch, isMock } = useAnalyticsPage(page);
  const Component = useMemo(() => COMPONENT_MAP[page], [page]);

  if (!config) {
    console.warn(`[Router] Page config not found for: ${page}`);
    return <Navigate to="/404" replace />;
  }

  if (!Component) {
    return (
      <AnalyticsTemplate title="Erro de Configuração">
        <ErrorState 
          title="Componente não encontrado" 
          description={`O componente para a rota '${page}' não foi mapeado corretamente.`} 
        />
      </AnalyticsTemplate>
    );
  }

  return (
    <AnalyticsTemplate
      title={config.label}
      description={config.description || `Visualização de ${config.label}`}
      loading={loading}
      onRefresh={refetch}
      isMock={isMock}
      breadcrumbs={[
        { label: 'Analytics', path: '/analytics' },
        { label: config.group, path: '#' },
        ...(config.subgroup ? [{ label: config.subgroup, path: '#' }] : []),
        { label: config.label, path: `/analytics/${page}` }
      ]}
    >
      <Helmet>
        <title>{config.label} | Costa Lavos Analytics</title>
      </Helmet>

      <Suspense fallback={<LoadingState message="Carregando visualização..." />}>
        <Component 
          data={data} 
          loading={loading} 
          error={error}
          isMock={isMock} 
        />
      </Suspense>
    </AnalyticsTemplate>
  );
};

export default AnalyticsPageRouter;
