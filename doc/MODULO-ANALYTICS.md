# Relatório do Módulo: Analytics & BI

**Data:** 02/12/2025
**Responsável:** Hostinger Horizons
**Status Geral:** ⚠️ Fragmentado (Necessita Consolidação)

---

## 1. Visão Geral
O módulo de Analytics é responsável pela visualização de dados, dashboards executivos, relatórios de vendas e KPIs. Atualmente, apresenta uma estrutura fragmentada entre arquivos na raiz (`src/pages/Analise*.jsx`), pasta `dashboard` e pasta `analytics`.

### Estatísticas
*   **Total de Páginas:** 18 arquivos identificados.
*   **Páginas Ativas:** ~8 (Estimado com base no uso).
*   **Páginas Legadas/Shadow:** ~10 (Arquivos na raiz que duplicam lógica).

---

## 2. Inventário de Páginas

### Grupo: Dashboards Principais
| Página | Caminho | Status | Tipo | Dados | Problemas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Dashboard Comercial** | `src/pages/dashboard/DashboardPage.jsx` | ✅ Ativa | Dashboard | RPC: `get_dashboard_and_daily_sales_kpis` | N/A |
| **Dashboard Analítico** | `src/pages/dashboard/DashboardAnalytico.jsx` | ✅ Ativa | Dashboard | RPC: `get_daily_sales_data_v2` | Renderização pesada de múltiplos gráficos. |
| **Visão 360 Cliente** | `src/pages/dashboard/Visao360ClientePage.jsx` | ✅ Ativa | Detalhes | RPC: `get_client_360_data_v2` | Complexidade alta. |

### Grupo: Análises Específicas
| Página | Caminho | Status | Tipo | Dados | Problemas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Curva ABC** | `src/pages/dashboard/CurvaABC.jsx` | ✅ Ativa | Relatório | RPC: `get_projected_abc_analysis` | - |
| **Análise Churn** | `src/pages/AnaliseChurn.jsx` | ⚠️ Raiz | Relatório | RPC: `get_churn_analysis_data_v3_optimized` | Arquivo fora da estrutura de pastas. |
| **Análise Preditiva** | `src/pages/AnalisePreditivaVendas.jsx` | ⚠️ Raiz | Dashboard | RPC: `get_sales_forecast_data` | Arquivo fora da estrutura de pastas. |
| **Análise Fidelidade** | `src/pages/AnaliseDesempenhoFidelidade.jsx` | ⚠️ Raiz | Relatório | RPC: `get_rfm_analysis` | Arquivo fora da estrutura de pastas. |
| **Explorador Vendas** | `src/pages/ExploradoreVendas.jsx` | ⚠️ Raiz | Ferramenta | RPC: `get_sales_explorer_treemap` | Arquivo fora da estrutura de pastas. |

### Grupo: Legado / Wrappers
| Página | Caminho | Status | Tipo | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Analytics Wrapper** | `src/pages/analytics/DashboardGerencial.jsx` | ⚠️ Legado | Wrapper | Redireciona para `DashboardPage`. |
| **Vendedor Wrapper** | `src/pages/analytics/AnaliticoVendedor.jsx` | ⚠️ Legado | Wrapper | Redireciona para componente legado. |

---

## 3. Análise Técnica

### Componentes Críticos
*   `ChartContainer`, `KPIGrid`, `AnalyticsTable`: Componentes base bem reutilizados.
*   `DrilldownExplorer`: Componente complexo usado em várias páginas de análise. Precisa de testes de performance.

### Segurança & Dados
*   **Acesso a Dados:** Predominantemente via RPC (`get_*`). Isso é excelente para segurança (Security Definer) e performance.
*   **RLS:** As RPCs encapsulam a lógica de RLS filtrando por `p_supervisors`, `p_sellers` baseados no contexto do usuário.

### Métricas de Código (Estimadas)
*   **Complexidade Ciclomática:** Alta em `DashboardAnalytico.jsx` devido à lógica de transformação de dados para múltiplos gráficos (Pie, Bar, Line) no frontend.
*   **Duplicação:** Alta. Várias páginas na raiz (`src/pages/Analise*.jsx`) têm correspondentes ou lógica similar dentro de `src/pages/dashboard/`.

---

## 4. Recomendações

1.  **Consolidação de Pastas:** Mover todos os arquivos `src/pages/Analise*.jsx` para `src/pages/analytics/` ou `src/pages/dashboard/`.
2.  **Eliminação de Wrappers:** Atualizar o `ModuleRouter` para apontar diretamente para os componentes finais, removendo arquivos que apenas fazem `return <OutroComponente />`.
3.  **Otimização de `Visao360ClientePage`:** Refatorar para usar `useQuery` com cache mais agressivo, dado que os dados do cliente não mudam a cada segundo.