/**
 * ROTAS DO APLICATIVO
 * Centraliza todas as rotas para evitar erros de digitação e facilitar manutenção.
 */

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  VISAO_360_CLIENTE: '/visao-360-cliente',
  
  // Analytics (Analítico)
  ANALITICO_SUPERVISOR: '/analitico-supervisor',
  ANALITICO_VENDEDOR: '/analitico-vendedor',
  ANALITICO_REGIAO: '/analitico-regiao',
  ANALITICO_GRUPO_CLIENTES: '/analitico-grupo-clientes',
  ANALITICO_PRODUTO: '/analitico-produto',
  ANALITICO_VENDAS_DIARIAS: '/analitico-vendas-diarias',
  
  // Analytics (Análise)
  CURVA_ABC: '/curva-abc',
  ANALISE_VALOR_UNITARIO: '/analise-valor-unitario',
  ANALISE_DESEMPENHO_FIDELIDADE: '/analise-desempenho-fidelidade',
  ANALISE_CLIENTES: '/analise-clientes',
  ANALISE_PRODUTOS: '/analise-produtos',
  ANALISE_SAZONALIDADE: '/analise-sazonalidade',
  ANALISE_MARGEM: '/analise-margem',
  ANALISE_PREDITIVA_VENDAS: '/analise-preditiva-vendas',
  ANALISE_CHURN: '/analise-churn',
  
  // System
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized'
};