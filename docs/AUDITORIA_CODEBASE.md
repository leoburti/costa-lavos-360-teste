# Relatório de Auditoria de Codebase

**Data:** 01/12/2025
**Escopo:** `src/pages/dashboard/`, `src/App.jsx` e integridade de rotas.

## 1. Arquivos em `src/pages/dashboard/`

Abaixo estão os arquivos físicos encontrados no diretório `src/pages/dashboard/`:

| Arquivo | Descrição Presumida |
| :--- | :--- |
| `DashboardPage.jsx` | Componente visual do Dashboard legado/específico. |
| `Visao360ClientePage.jsx` | Página de detalhes do cliente (Visão 360º). |
| `DashboardAnalytico.jsx` | (Detectado em listagens anteriores) Versão analítica do dashboard. |

> **Nota:** Existem arquivos similares na raiz `src/pages/` (ex: `DashboardPage.jsx`, `DashboardAnalytico.jsx`), indicando duplicidade ou estrutura de migração incompleta.

---

## 2. Rotas Definidas (`src/App.jsx`)

As seguintes rotas estão ativas no roteador principal:

### Principais
- `/` -> Redireciona para `/dashboard`
- `/dashboard` -> `DashboardPage`
- `/login`, `/forgot-password`, `/reset-password`, `/unauthorized`

### Visão 360º
- `/visao-360-cliente/:clientId` -> `Visao360ClientePage` (Detalhe)
- `/visao-360-cliente` -> `Visao360Search` (Busca)
- `/cliente/:clientId` -> `Client360` (Nova rota direta)

### Analítico (Novos)
- `/analitico-supervisor` -> `AnalyticsSupervisor`
- `/analitico-vendedor` -> `AnalyticsSeller`
- `/analitico-regiao` -> `AnalyticsRegion`
- `/analitico-grupo-clientes` -> `AnalyticsCustomerGroup`
- `/analitico-produto` -> `AnalyticsProduct`

### Comercial (Restauradas)
- `/analitico-vendas-diarias` -> `AnaliticoVendasDiarias`
- `/analise-preditiva-vendas` -> `AnalisePreditivaVendas`
- `/curva-abc` -> `CurvaABC`
- `/analise-valor-unitario` -> `AnaliseValorUnitario`
- `/analise-desempenho-fidelidade` -> `AnaliseDesempenhoFidelidade`

### Módulos de Apoio
- **Equipamentos:** `/equipamentos-lista`, `/equipamentos-detalhes/:id`, etc.
- **Bonificações:** `/bonificacoes-lista`, `/bonificacoes-relatorio`, etc.
- **CRM:** `/crm-clientes`, `/crm-pipeline`, etc.
- **Relatórios:** Vasta lista de relatórios (`/relatorio-vendas-diario`, etc.)

---

## 3. Páginas Órfãs (Detectadas)

Arquivos presentes em `src/pages/` que **NÃO** estão sendo importados ou utilizados em `src/App.jsx`. Estes arquivos aumentam o bundle size e causam confusão na manutenção.

| Arquivo Órfão | Recomendação |
| :--- | :--- |
| `src/pages/AnaliseChurn.jsx` | **Remover/Arquivar**. Funcionalidade parece ter sido movida para relatórios. |
| `src/pages/AnaliseFidelidade.jsx` | **Verificar**. Se for usada como *tab* dentro de outra página, mover para `src/components/`. |
| `src/pages/AnaliseSazonalidade.jsx` | **Remover**. Parece ser legado. |
| `src/pages/AnaliticoBonificados.jsx` | **Remover**. Substituído pelo módulo de Bonificações. |
| `src/pages/AnaliticoEquipamento.jsx` | **Remover**. Substituído pelo módulo de Equipamentos. |
| `src/pages/BaixoDesempenho.jsx` | **Verificar**. Usado como tab em `AnaliseDesempenhoFidelidade`. Mover para componentes. |
| `src/pages/CalculoRFM.jsx` | **Remover**. Lógica de RFM já integrada em dashboards. |
| `src/pages/ExploradoreVendas.jsx` | **Remover**. Funcionalidade duplicada de `AnaliticoVendasDiarias`. |
| `src/pages/MovimentacaoEquipamentos.jsx` | **Remover**. Legado. |
| `src/pages/ProdutosBonificados.jsx` | **Remover**. Legado. |
| `src/pages/RaioXSupervisor.jsx` | **Remover**. Legado. |
| `src/pages/RaioXVendedor.jsx` | **Remover**. Legado. |
| `src/pages/TendenciaVendas.jsx` | **Remover**. Legado. |

---

## 4. Rotas Quebradas ou de Risco

Identificamos discrepâncias entre o `import` no `App.jsx` e o nome real do arquivo:

1.  **Rota:** `/dashboard`
    *   **Import:** `const DashboardPage = lazy(() => import('@/pages/Dashboard'));`
    *   **Arquivo Real:** `src/pages/DashboardPage.jsx` (ou `src/pages/Dashboard.jsx` se existir).
    *   **Risco:** Alto. Se o arquivo se chama `DashboardPage.jsx`, o import `@/pages/Dashboard` falhará a menos que haja um `index.js` reexportando.
    *   **Ação:** Corrigir import para `import('@/pages/DashboardPage')`.

2.  **Duplicidade de Dashboard**
    *   Existem `src/pages/DashboardPage.jsx` E `src/pages/dashboard/DashboardPage.jsx`.
    *   **Risco:** Confusão sobre qual é o "verdadeiro" dashboard. Atualmente `App.jsx` parece apontar para a raiz `src/pages`.

---

## 5. Recomendações e Plano de Ação

1.  **Limpeza de Órfãos:** Mover todos os arquivos listados na seção 3 para uma pasta `src/pages/_legacy` ou `src/pages/_deprecated` para limpar a visão do projeto sem perder código imediatamente.
2.  **Correção de Import do Dashboard:** Ajustar `src/App.jsx` para apontar explicitamente para o arquivo correto (`DashboardPage.jsx`).
3.  **Consolidação de Pastas:** Decidir se as páginas de dashboard ficam em `src/pages/dashboard/` ou `src/pages/`. A recomendação é mover tudo para pastas organizadas (ex: `src/pages/analytics/`, `src/pages/operational/`) e evitar a raiz `src/pages/` cheia de arquivos soltos.
4.  **Componentização:** Transformar páginas que viraram "Abas" (como `BaixoDesempenho.jsx`) em componentes puros dentro de `src/components/analytics/` para deixar claro que não possuem rota própria.