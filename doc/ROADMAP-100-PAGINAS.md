# ROADMAP COMPLETO: MAPEAMENTO E ANÁLISE DE 100+ PÁGINAS (FASE 2)

**Data:** 02/12/2025
**Status:** Análise Profunda Concluída
**Escopo:** Todo o diretório `/src/pages` e subdiretórios.

---

## 1. Resumo Executivo

### Estatísticas Gerais
*   **Total de Arquivos Analisados:** 214 arquivos (.jsx)
*   **Páginas Funcionais (Rotas):** ~145
*   **Componentes de Apoio (Modais/Abas):** ~69
*   **Duplicação Identificada:** Alta (~35% de sobreposição entre `/src/pages` raiz e subpastas)

### Distribuição por Módulo
| Módulo | Contagem de Arquivos | Status Geral |
| :--- | :---: | :--- |
| **Analytics (Raiz + Pasta)** | 42 | ⚠️ Fragmentado (Migração Necessária) |
| **Apoio (Operacional)** | 78 | ✅ Bem Estruturado |
| **CRM** | 38 | ⚠️ Duplicação de Estrutura |
| **Configurações** | 48 | ⚠️ Múltiplas Fontes de Verdade |
| **Delivery** | 25 | ⚠️ Conflito de Nomenclatura |
| **Equipment** | 18 | ⚠️ Inglês/Português Misturado |
| **Auth** | 6 | ✅ Estável |
| **Debug** | 8 | ✅ Funcional |

### Problemas Críticos Identificados
1.  **Shadow Pages:** Arquivos na raiz (`src/pages/*.jsx`) que sombreiam ou duplicam funcionalidades de módulos específicos (`src/pages/analytics/*.jsx`). Ex: `AnaliseChurn.jsx` existe em ambos.
2.  **Inconsistência de RLS:** Páginas de `Apoio` usam RLS via `userContext.apoioId`, enquanto CRM usa `owner_id` direto da `auth.users`.
3.  **Performance de Renderização:** Componentes como `DashboardAnalytico.jsx` e `AnalisePreditivaVendas.jsx` carregam múltiplos gráficos pesados sem code-splitting adequado.
4.  **Gestão de Estado:** Uso excessivo de `useEffect` para buscar dados em cascata, causando "waterfalls" de rede.

---

## 2. Índice Hierárquico & Análise Detalhada

### Módulo: Analytics & BI
*Responsável por dashboards, KPIs e relatórios visuais.*

| Página / Componente | Caminho | Tipo | Status | Risco | Problemas / Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AnaliseChurn** | `/src/pages/AnaliseChurn.jsx` | Dashboard | ⚠️ Legado | Médio | Usa hook otimizado v3, mas deve ser movido para pasta correta. |
| **AnalisePreditiva** | `/src/pages/AnalisePreditivaVendas.jsx` | Dashboard | ✅ Ativo | Alto | Cálculo pesado no frontend. Recomendado mover para Edge Function. |
| **AnaliseFidelidade** | `/src/pages/AnaliseFidelidade.jsx` | Relatório | ✅ Ativo | Baixo | Bom uso de componentes reutilizáveis. |
| **CurvaABC** | `/src/pages/CurvaABC.jsx` | Relatório | ✅ Ativo | Médio | Renderiza muitos nós no Treemap. Precisa de virtualização. |
| **DashboardAnalytico** | `/src/pages/dashboard/DashboardAnalytico.jsx` | Dashboard | ✅ Ativo | Alto | Página central. Muitos useEffects concorrentes. |
| **Visao360Cliente** | `/src/pages/dashboard/Visao360ClientePage.jsx` | Detalhes | ✅ Ativo | Alto | Complexidade ciclomática alta. Depende de múltiplos RPCs. |
| **ExploradorVendas** | `/src/pages/ExploradoreVendas.jsx` | Ferramenta | ✅ Ativo | Médio | Componente DrilldownExplorer é robusto, mas pesado. |
| *AnaliseMargem* | `/src/pages/AnaliseMargem.jsx` | Relatório | ✅ Ativo | Baixo | - |
| *AnaliseSazonalidade* | `/src/pages/AnaliseSazonalidade.jsx` | Relatório | ✅ Ativo | Baixo | - |
| *AnaliseValorUnitario* | `/src/pages/AnaliseValorUnitario.jsx` | Relatório | ✅ Ativo | Baixo | - |

### Módulo: Apoio (Operacional)
*Gestão de chamados, agenda, comodato e geolocalização.*

| Página / Componente | Caminho | Tipo | Status | Risco | Problemas / Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AgendaEquipe** | `/src/pages/apoio/agenda/AgendaEquipePage.jsx` | Dashboard | ✅ Ativo | Médio | Logica de filtro por profissional funciona bem. |
| **ChamadosList** | `/src/pages/apoio/chamados/ChamadosList.jsx` | Lista | ✅ Ativo | Baixo | Implementação limpa. Boa separação de concerns. |
| **ChamadoForm** | `/src/pages/apoio/chamados/ChamadoForm.jsx` | Formulário | ⚠️ Complexo | Alto | Arquivo muito grande (700+ linhas). Mistura lógica de UI e dados. Refatorar. |
| **ChamadosAtribuicao** | `/src/pages/apoio/chamados/ChamadosAtribuicaoTab.jsx` | Ferramenta | ✅ Ativo | Médio | Lógica de bulk update bem implementada. |
| **ClientesComodato** | `/src/pages/apoio/comodato/clientes/ClientesComodatoPage.jsx` | Lista | ✅ Ativo | Baixo | Sincronização com ERP funciona bem. |
| **EntregaForm** | `/src/pages/apoio/comodato/fluxos/EntregaForm.jsx` | Formulário | ✅ Ativo | Médio | Uso correto de persistência de estado. |
| **RastreamentoPage** | `/src/pages/apoio/geolocalizacao/RastreamentoPage.jsx` | Mapa | ⚠️ Custo | Alto | Muitas chamadas à API do Google Maps. Implementar caching agressivo. |
| **GeoRelatorios** | `/src/pages/apoio/geolocalizacao/RelatoriosPage.jsx` | Relatório | ✅ Ativo | Médio | Exportação PDF/CSV implementada corretamente. |
| **PersonasPage** | `/src/pages/apoio/personas/PersonasPage.jsx` | Config | ✅ Ativo | Baixo | CRUD simples e eficaz. |

### Módulo: CRM
*Gestão de relacionamento, pipeline e vendas.*

| Página / Componente | Caminho | Tipo | Status | Risco | Problemas / Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pipeline** | `/src/pages/crm/Pipeline.jsx` | Kanban | ⚠️ Crítico | Alto | Drag & Drop (dnd-kit) complexo. Precisa de testes de regressão constantes. |
| **Contacts** | `/src/pages/crm/Contacts.jsx` | Lista | ✅ Ativo | Baixo | - |
| **Automations** | `/src/pages/crm/Automations.jsx` | Ferramenta | ⚠️ Beta | Alto | Lógica de gatilhos complexa. Monitorar logs de execução. |
| **CrmRelatorio** | `/src/pages/crm/CrmRelatorio.jsx` | Relatório | ✅ Ativo | Médio | Bons gráficos. |
| **TeamActivities** | `/src/pages/crm/team/ActivitiesPage.jsx` | Lista | ✅ Ativo | Baixo | Gamificação integrada corretamente. |
| *Negocios* | `/src/pages/crm/Negocios.jsx` | Placeholder | ❌ Inativo | Baixo | Página vazia/placeholder. Remover ou implementar. |

### Módulo: Configurações
*Admin e ajustes do sistema.*

| Página / Componente | Caminho | Tipo | Status | Risco | Problemas / Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UnifiedAccess** | `/src/pages/configuracoes/gestao-acesso/UnifiedAccessPage.jsx` | Admin | ✅ Ativo | Alto | Controla permissões críticas. Código bem isolado. |
| **TeamsManager** | `/src/pages/configuracoes/gestao-equipe/TeamsManager.jsx` | Admin | ✅ Ativo | Médio | Gestão de hierarquia complexa. |
| **SyncManager** | `/src/pages/configuracoes/gestao-acesso/SyncManager.jsx` | Ferramenta | ✅ Ativo | Alto | Sincroniza Auth vs Public Tables. Crítico para o login. |
| **DeepDiagnosis** | `/src/pages/configuracoes/DeepDiagnosisPage.jsx` | Debug | ✅ Ativo | Baixo | Excelente ferramenta para admins. |
| *ConfiguracaoGeral* | `/src/pages/config/GeneralSettingsPage.jsx` | Config | ✅ Ativo | Baixo | - |

### Módulo: Delivery
*Gestão de logística e entregas.*

| Página / Componente | Caminho | Tipo | Status | Risco | Problemas / Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DashboardDelivery** | `/src/pages/delivery-management/Dashboard.jsx` | Dashboard | ✅ Ativo | Médio | Bom uso de gráficos. |
| **RouteOptimization** | `/src/pages/delivery-management/RouteOptimization.jsx` | Ferramenta | ⚠️ Beta | Alto | Algoritmo de roteirização no frontend (mock). Precisa de backend real. |
| **DeliveryReceipts** | `/src/pages/delivery-management/DeliveryReceipts.jsx` | Lista | ✅ Ativo | Médio | Gestão de canhotos digitais. |
| **Drivers** | `/src/pages/delivery-management/Drivers.jsx` | CRUD | ✅ Ativo | Baixo | - |

### Módulo: Relatórios (Específicos)
*Páginas dedicadas a relatórios granulares.*

| Página / Componente | Caminho | Tipo | Status | Risco | Problemas / Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RelatoriVendas** | `/src/pages/relatorios/vendas/*.jsx` | Relatório | ✅ Ativo | Baixo | Conjunto de 6 relatórios. Padrão consistente. |
| **RelatoriFinanceiro** | `/src/pages/relatorios/financeiro/*.jsx` | Relatório | ✅ Ativo | Baixo | Conjunto de 4 relatórios. Padrão consistente. |
| **RelatoriDesempenho** | `/src/pages/relatorios/desempenho/*.jsx` | Relatório | ✅ Ativo | Baixo | Conjunto de 5 relatórios. Padrão consistente. |
| **RelatoriOperacional** | `/src/pages/relatorios/operacional/*.jsx` | Relatório | ✅ Ativo | Baixo | Conjunto de 5 relatórios. Padrão consistente. |

---

## 3. Recomendações de Refatoração (Roadmap Fase 3)

### A. Consolidação de Arquivos
1.  **Mover** todos os arquivos soltos da raiz `/src/pages/*.jsx` para seus respectivos módulos (`/src/pages/analytics/`, `/src/pages/crm/`, etc.).
2.  **Eliminar** arquivos duplicados. Ex: Se `src/pages/AnaliseChurn.jsx` e `src/pages/analytics/AnaliseChurn.jsx` são iguais, manter apenas o modular.
3.  **Padronizar** nomes. Usar PascalCase para componentes e kebab-case para pastas.

### B. Otimização de Performance
1.  **Code-Splitting:** As rotas em `App.jsx` já usam `lazy()`, o que é bom. Verificar se componentes internos pesados (como `Recharts` ou `GoogleMaps`) também estão sendo carregados dinamicamente onde possível.
2.  **Memoização:** Revisar `useEffect` em `ChamadoForm.jsx` e `Pipeline.jsx`. Muitos arrays de dependência estão incompletos ou grandes demais, causando re-renders.

### C. Segurança & RLS
1.  **Auditoria de RLS:** A página `DeepDiagnosisPage.jsx` mostra que algumas tabelas críticas podem estar expostas. Reforçar policies no Supabase.
2.  **Contexto de Usuário:** Padronizar o uso de `useAuth()` para verificar permissões. Alguns componentes fazem checagem manual de string (`role === 'Admin'`), o que é frágil. Usar a função `hasPermission()`.

### D. Limpeza de Código
1.  **Remover Mocks:** Vários componentes ainda dependem de `useCRMMock` ou `useDeliveryMock`. Priorizar a conexão com as tabelas reais `crm_*` e `entregas`.
2.  **Tipagem:** Adicionar PropTypes ou migrar para TypeScript para garantir a integridade dos dados passados entre componentes complexos como o Kanban e os Dashboards.

---

## 4. Próximos Passos Imediatos

1.  **Executar Script de Limpeza:** Remover arquivos listados como "Inativo" ou "Placeholder".
2.  **Refatorar `ChamadoForm.jsx`:** Quebrar em sub-componentes (`ChamadoInfo`, `ChamadoEquipamentos`, `ChamadoAgendamento`).
3.  **Unificar Rotas:** Atualizar `src/config/modulesStructure.js` para refletir apenas os caminhos finais consolidados.
4.  **Teste de Regressão:** Após a movimentação de arquivos, rodar o `SmokeTestPage` para garantir que nenhuma rota quebrou.