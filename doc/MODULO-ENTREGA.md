# Relatório do Módulo: Entrega (Logística)

**Data:** 02/12/2025
**Responsável:** Hostinger Horizons
**Status Geral:** ⚠️ Em Refatoração (Duplicação de Pastas)

---

## 1. Visão Geral
Módulo responsável por roteirização, controle de entregas, canhotos digitais e gestão de motoristas.

### Estatísticas
*   **Pastas Envolvidas:** `src/pages/delivery-management` (Novo), `src/pages/entregas` (Legado), `src/pages/delivery` (Wrappers).
*   **Risco:** Alto risco de confusão devido à existência de três pastas com nomes similares.

---

## 2. Inventário de Páginas (Focando na versão `delivery-management`)

| Página | Caminho | Status | Tipo | Funcionalidades |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | `Dashboard.jsx` | ✅ Ativa | Dash | KPIs de entrega, Mapa de calor, Status. |
| **Entregas** | `Deliveries.jsx` | ✅ Ativa | Lista | Gestão de status, atribuição de motorista. |
| **Motoristas** | `Drivers.jsx` | ✅ Ativa | CRUD | Cadastro de motoristas e veículos. |
| **Roteirização** | `RouteOptimization.jsx` | ⚠️ Beta | Mapa | Planejamento de rotas (Google Maps). |
| **Canhotos** | `DeliveryReceipts.jsx` | ✅ Ativa | Galeria | Upload e visualização de comprovantes. |

### Páginas Legadas (Candidatas a Exclusão)
*   `src/pages/entregas/EntregasList.jsx`
*   `src/pages/entregas/EntregaForm.jsx`
*   `src/pages/entregas/RastreamentoPage.jsx` (Verificar se `RouteOptimization` cobre isso)

---

## 3. Análise Técnica

### Dashboard (`Dashboard.jsx`)
*   **Complexidade:** Alta. Contém múltiplos gráficos e lógica de cálculo de KPIs no frontend (`useMemo`).
*   **Performance:** Pode ficar lento com muitos dados. Recomendado mover agregação para RPC `get_delivery_dashboard_metrics`.

### Roteirização (`RouteOptimization.jsx`)
*   Depende pesadamente da API do Google Maps.
*   **Risco:** Custo de API. A implementação atual parece fazer muitas chamadas de geocodificação/direção no cliente.
*   **Dados:** Usa `entregas_v2`.

### Banco de Dados
*   Transição de tabela `entregas` para `entregas_v2` observada em alguns componentes. É crucial padronizar.

---

## 4. Recomendações

1.  **Arquivamento:** Mover a pasta `src/pages/entregas` para `_archive` ou deletar.
2.  **Padronização de Tabela:** Garantir que todo o módulo `delivery-management` aponte para a tabela definitiva (`entregas` ou `entregas_v2`).
3.  **Otimização de Mapa:** Implementar cache de rotas ou coordenadas no banco para evitar chamadas repetidas ao Google Maps.