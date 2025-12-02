/**
 * DEFINIÇÃO DA SUÍTE DE SMOKE TEST
 * 
 * Este arquivo define os casos de teste para a verificação de integridade do sistema.
 * Ele é consumido pela página de diagnóstico (/smoke-test) para execução em tempo real.
 */

import { getDateRange, formatDateForAPI } from '@/lib/utils';

const dateRange = getDateRange('last_30_days');
const startDate = formatDateForAPI(dateRange.from);
const endDate = formatDateForAPI(dateRange.to);

const DEFAULT_PARAMS = {
  p_start_date: startDate,
  p_end_date: endDate,
  p_exclude_employees: true
};

export const SMOKE_TEST_SUITE = [
  // --- 1. Rotas Analíticas Principais (DrilldownExplorer) ---
  {
    id: 'analitico_supervisor',
    category: 'Analytics',
    name: 'Analítico Supervisor',
    route: '/analitico-supervisor',
    rpc: 'get_supervisor_summary_v2',
    params: { ...DEFAULT_PARAMS, p_analysis_mode: 'supervisor' },
    description: 'Verifica se a sumarização por supervisor retorna dados e se a RPC responde.'
  },
  {
    id: 'analitico_vendedor',
    category: 'Analytics',
    name: 'Analítico Vendedor',
    route: '/analitico-vendedor',
    rpc: 'get_seller_summary_v2',
    params: { ...DEFAULT_PARAMS, p_analysis_mode: 'seller' },
    description: 'Verifica sumarização por vendedor.'
  },
  {
    id: 'analitico_regiao',
    category: 'Analytics',
    name: 'Analítico Região',
    route: '/analitico-regiao',
    rpc: 'get_regional_summary_v2',
    params: { ...DEFAULT_PARAMS, p_analysis_mode: 'region' },
    description: 'Verifica sumarização por região.'
  },
  {
    id: 'analitico_grupo',
    category: 'Analytics',
    name: 'Analítico Grupos',
    route: '/analitico-grupo-clientes',
    rpc: 'get_regional_summary_v2',
    params: { ...DEFAULT_PARAMS, p_analysis_mode: 'customerGroup' },
    description: 'Verifica sumarização por grupo de clientes.'
  },
  {
    id: 'analitico_produto',
    category: 'Analytics',
    name: 'Analítico Produto',
    route: '/analitico-produto',
    rpc: 'get_product_mix_analysis',
    params: { ...DEFAULT_PARAMS },
    description: 'Verifica matriz de mix de produtos (Força x Confiabilidade).'
  },

  // --- 2. Outras Análises ---
  {
    id: 'vendas_diarias',
    category: 'Analytics',
    name: 'Vendas Diárias',
    route: '/analitico-vendas-diarias',
    rpc: 'get_daily_sales_data_v2',
    params: { ...DEFAULT_PARAMS },
    description: 'Verifica dados de tendência diária.'
  },
  {
    id: 'curva_abc',
    category: 'Analytics',
    name: 'Curva ABC',
    route: '/curva-abc',
    rpc: 'get_projected_abc_analysis',
    params: { ...DEFAULT_PARAMS },
    description: 'Verifica cálculo de Pareto/ABC.'
  },
  {
    id: 'valor_unitario',
    category: 'Analytics',
    name: 'Análise Valor Unitário',
    route: '/analise-valor-unitario',
    rpc: 'get_price_analysis',
    params: { ...DEFAULT_PARAMS },
    description: 'Verifica análise de variação de preço.'
  },
  {
    id: 'fidelidade',
    category: 'Analytics',
    name: 'Desempenho e Fidelidade',
    route: '/analise-desempenho-fidelidade',
    rpc: 'get_loyalty_analysis',
    params: { ...DEFAULT_PARAMS },
    description: 'Verifica KPIs de fidelidade e churn.'
  },

  // --- 3. Visão 360 ---
  {
    id: 'client_360_search',
    category: 'Client360',
    name: 'Busca de Cliente (360)',
    route: '/visao-360-cliente',
    rpc: 'get_clientes_visao_360_faturamento',
    params: { p_start_date: startDate, p_end_date: endDate, p_search_term: '' },
    description: 'Verifica se a lista de clientes para o 360 carrega.'
  },
  {
    id: 'client_360_invalid',
    category: 'Client360',
    name: 'Cliente Inválido (Teste de Erro)',
    route: '/visao-360-cliente/99999999-X',
    rpc: 'get_client_360_data_v2',
    params: { ...DEFAULT_PARAMS, p_target_client_code: '99999999', p_target_store: 'X' },
    expectEmpty: true,
    description: 'Verifica se o sistema lida corretamente com ID inexistente.'
  }
];