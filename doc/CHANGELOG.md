# Changelog

## [2.0.0] - 2025-12-01

### Adicionado
- **AnalyticsTemplate:** Novo componente base para todas as páginas de analytics.
- **DataValidator:** Utilitário para sanitização de dados e prevenção de erros de renderização de objetos.
- **MockGenerator:** Sistema de fallback para dados mockados em caso de falha de API.
- **useAnalyticsData:** Hook centralizado com React Query para fetch de dados.
- **Documentação:** Relatórios de status, guias de teste e padronização.

### Corrigido
- **Erro Crítico:** "Objects are not valid as a React child" resolvido globalmente via `dataValidator` e `KPIGrid`.
- **RPCs:** Correção de sobrecarga e erros de sintaxe em funções SQL críticas (`get_churn_analysis_data_v3_optimized`, etc).
- **Navegação:** Menu lateral reestruturado e otimizado.

### Melhorado
- **Performance:** Implementação de cache e tratamento de erros robusto.
- **UX:** Skeleton loaders e estados de erro amigáveis em todas as páginas.