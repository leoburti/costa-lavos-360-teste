# Relatório de Métricas de Código

**Data:** 02/12/2025

## 1. Maiores Arquivos (Linhas de Código - LOC)
Indicadores de complexidade e possível necessidade de refatoração (quebra em componentes menores).

1.  `src/components/crm/ContactForm.jsx`: 861 linhas
2.  `src/components/Client360/ClientDashboard.jsx`: 750 linhas
3.  `src/pages/delivery-management/Deliveries.jsx`: 734 linhas
4.  `src/pages/apoio/chamados/ChamadoForm.jsx`: 720 linhas
5.  `src/pages/crm/Pipeline.jsx`: 716 linhas
6.  `src/pages/delivery-management/Disputes.jsx`: 716 linhas
7.  `src/components/crm/RelationshipDashboard.jsx`: 707 linhas

## 2. Cobertura de Testes
*   **Estado Atual:** Baixa/Inexistente para a maioria das páginas.
*   **Exceções:** Existem alguns arquivos de teste em `src/__tests__`, mas parecem ser testes básicos ou de infraestrutura (`config.test.js`, `routing.test.js`).
*   **Risco:** Alto risco de regressão em refatorações, especialmente no módulo CRM e Apoio que têm lógicas complexas.

## 3. Performance (Estimada)
*   **Time-to-Interactive (TTI):** Preocupante em Dashboards (`DashboardAnalytico.jsx`) devido ao carregamento síncrono de múltiplos datasets grandes.
*   **Bundle Size:** O uso de bibliotecas pesadas como `recharts`, `leaflet`, `jspdf`, `html2canvas` sugere que o bundle principal pode ser grande. O Code Splitting (Lazy Loading) implementado nas rotas ajuda, mas widgets internos também deveriam ser lazy loaded.