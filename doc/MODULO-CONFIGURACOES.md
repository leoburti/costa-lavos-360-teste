# Relatório do Módulo: Configurações & Admin

**Data:** 02/12/2025
**Responsável:** Hostinger Horizons
**Status Geral:** ⚠️ Duplicidade Crítica

---

## 1. Visão Geral
Gerencia usuários, permissões, parâmetros do sistema e diagnósticos. Sofre de uma duplicação severa entre `src/pages/configuracoes` (aparentemente a versão principal) e `src/pages/config` (versão alternativa/legada).

---

## 2. Inventário de Páginas

### Grupo: Gestão de Acesso (`src/pages/configuracoes/gestao-acesso`)
| Página | Descrição | Status |
| :--- | :--- | :--- |
| **UnifiedAccessPage** | Central de controle de usuários e personas. | ✅ Principal |
| **UserAccessTable** | Tabela detalhada de permissões. | ✅ Componente |
| **SyncManager** | Ferramenta para sincronizar `auth.users` com `users_unified`. | ✅ Crítico |

### Grupo: Diagnóstico (`src/pages/configuracoes`)
| Página | Descrição | Status |
| :--- | :--- | :--- |
| **SystemDiagnosisPage** | Dashboard de saúde do sistema. | ✅ Ativo |
| **DeepDiagnosisPage** | Ferramenta forense para análise de dados brutos. | ✅ Ativo |
| **RPCDiagnosisPage** | Lista de status de migração de RPCs. | ✅ Ativo |

### Grupo: Duplicados (`src/pages/config`)
*   `GeneralSettingsPage.jsx` -> Duplica funcionalidades de configurações gerais.
*   `IntegrationsPage.jsx` -> Duplica `IntegracoesGlobaisPage.jsx`.
*   `TerritoriesPage.jsx` -> Funcionalidade isolada, talvez deva ser movida para `Delivery` ou `Apoio`.

---

## 3. Análise Técnica

### Segurança
*   **`UnifiedAccessPage`**: É o coração da segurança do sistema. Controla a tabela `users_unified` e `apoio_personas`.
*   **Risco:** A existência de páginas de administração duplicadas pode levar a configurações conflitantes se ambas estiverem ativas e escrevendo nas mesmas tabelas.

### Integridade de Dados
*   `SyncManager.jsx`: Essencial para manter a integridade entre o login (Supabase Auth) e os dados de negócio (Public Tables). Deve ser mantido e testado rigorosamente.

---

## 4. Recomendações

1.  **Eliminar `src/pages/config`**: Migrar qualquer funcionalidade única para `src/pages/configuracoes` e deletar a pasta.
2.  **Restringir Acesso:** Garantir que todas as rotas sob `/configuracoes` estejam protegidas por `AuthGuard` com verificação estrita de role `Admin` ou `Nivel 1`.