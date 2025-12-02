# Alterações Pendentes e Roadmap

Este documento rastreia tarefas técnicas, débitos e funcionalidades que precisam ser implementadas ou melhoradas.

## 🚨 Alta Prioridade (Funcionalidades Críticas)

### Relatórios Ainda Mockados
As seguintes funções RPC retornam atualmente stubs ("Funcionalidade em desenvolvimento") e precisam ser implementadas com lógica real de negócio:
- [ ] **Relatório Operacional**: Função `get_relatorio_operacional`.
- [ ] **Relatório de Comodato**: Função `get_relatorio_comodato`.
- [ ] **Métricas de Profissional**: Função `get_metricas_profissional` (usada na análise de técnicos).
- [ ] **Métricas de Cliente**: Função `get_metricas_cliente`.

### Dashboard de Gestão
- [ ] Implementar a lógica real para `get_dashboard_gestor`.

## ⚡ Performance e Otimização

- [ ] **Cache de Rankings**: Implementar cache (via tabela `dashboard_cache`) para a nova função `get_performance_ranking` caso o volume de dados históricos cresça muito.
- [ ] **Virtualização de Tabelas**: Implementar virtualização (windowing) nas tabelas de relatórios analíticos que podem retornar >1000 linhas.

## 🎨 UX / UI

- [ ] **Dashboard Mobile**: Melhorar a responsividade do componente `PerformanceRanking` em telas muito pequenas (atualmente as abas podem quebrar o layout).
- [ ] **Feedback de Exportação**: Adicionar notificações de progresso mais detalhadas durante a geração de PDF/Excel de relatórios grandes.

## 🔒 Segurança e Governança

- [ ] **Auditoria de RLS**: Revisar todas as políticas RLS das novas tabelas criadas recentemente (`dashboard_kpis_cache`, etc.) para garantir isolamento estrito entre tenants (se aplicável) ou níveis de permissão.
- [ ] **Limpeza de Código**: Remover arquivos marcados como `@deprecated` (ex: `src/services/analyticsRpcService.js`) após garantir que nenhuma referência residual exista.