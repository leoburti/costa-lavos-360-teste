# Relatório do Módulo: Equipamentos (Assets)

**Data:** 02/12/2025
**Responsável:** Hostinger Horizons
**Status Geral:** ✅ Estável (Com duplicidades de nomenclatura)

---

## 1. Visão Geral
Gerencia o ciclo de vida de ativos (máquinas, freezers) em comodato ou propriedade do cliente.

### Estatísticas
*   **Pastas Envolvidas:** `src/pages/equipment`, `src/pages/maintenance`, `src/pages/apoio/comodato`.
*   **Conflito:** Existe uma sobreposição funcional entre o módulo "Equipamentos" (focado no ativo) e "Apoio > Comodato" (focado no processo logístico).

---

## 2. Inventário de Páginas

### Grupo: Gestão de Ativos (`src/pages/equipment`)
| Página | Caminho | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| **Lista Equip.** | `EquipamentosList.jsx` | Tabela | Inventário geral. |
| **Detalhes** | `EquipamentosDetalhes.jsx` | Detalhes | Ficha técnica, histórico, QR Code. |
| **Performance** | `EquipamentosPerformance.jsx` | Dashboard | KPIs de eficiência e quebra. |
| **Custos** | `EquipamentosCustos.jsx` | Relatório | Análise financeira de manutenção. |

### Grupo: Manutenção (`src/pages/maintenance`)
| Página | Caminho | Tipo | Descrição |
| :--- | :--- | :--- | :--- |
| **Manutenção** | `MaintenancePage.jsx` | Kanban/Lista | Gestão de ordens de serviço. |

---

## 3. Análise Técnica

### Dependências
*   Usa `useAnalyticalData` para buscar relatórios de custos e performance.
*   Usa `useEquipmentMock` em algumas listagens (risco de dados desatualizados).

### Banco de Dados
*   Tabelas principais: `equipment`, `maintenance`, `equipment_costs`.
*   A integração com `bd_cl_inv` (ERP) parece ser feita via sincronização na tabela `apoio_equipamentos_comodato`.

### Problemas Identificados
1.  **Dupla Fonte de Verdade:** `equipment` (tabela local) vs `bd_cl_inv` (tabela espelho do ERP). O sistema precisa clarificar qual é a master para operações de comodato.
2.  **Nomenclatura:** Mistura de inglês (`MaintenancePage`) e português (`ManutencaoEquipamentosPage`).

---

## 4. Recomendações

1.  **Unificar Manutenção:** Decidir entre `src/pages/maintenance` e `src/pages/apoio/manutencao`. A versão em `apoio` parece mais integrada aos fluxos operacionais.
2.  **Migrar Mocks:** Substituir `useEquipmentMock` por chamadas reais ao Supabase em `EquipamentosList.jsx`.