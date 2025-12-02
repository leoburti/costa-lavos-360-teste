# DIAGNÓSTICO CRÍTICO: ERRO DE FETCH SUPABASE

**Data:** 02/12/2025
**Status:** Análise Completa
**Contexto:** Investigação de falhas recorrentes em requisições de dados (Fetch/RPC) no Supabase.

---

## 1. Configuração do Cliente (`src/lib/customSupabaseClient.js`)

*   **Instância Única:** O projeto utiliza um arquivo centralizado `src/lib/customSupabaseClient.js` para inicializar o cliente `supabase`.
*   **Configuração:**
    *   **URL:** Definida via variável de ambiente `VITE_SUPABASE_URL`.
    *   **Anon Key:** Definida via `VITE_SUPABASE_ANON_KEY`.
    *   **Auth:** Persistência de sessão configurada (localStorage).
*   **Validação:** Não há validação explícita se as chaves estão vazias antes da inicialização, o que pode causar erros silenciosos se as variáveis de ambiente falharem no build.

## 2. Camada de Serviço e Fragmentação (Causa Raiz #1)

Identificamos **três** implementações diferentes para realizar chamadas RPC, criando inconsistência no tratamento de erros e timeouts.

| Serviço / Arquivo | Timeout Configurado | Retry Logic | Limpeza de Params | Status |
| :--- | :---: | :---: | :---: | :--- |
| **`src/lib/supabaseRPC.js`** | **30s** | ✅ Sim (3x) + Backoff | ✅ Remove `undefined`/`null` | **Recomendado** |
| **`src/services/api.js`** | ⚠️ **15s** | ✅ Sim (2x) | ✅ Remove `undefined` | **Conflitante** |
| **`src/hooks/useAnalyticalData.js`** | ❌ N/A (Default Fetch) | ❌ Não | ❌ Não (Passa direto) | **Problemático** |

**Problema:** A maioria das páginas críticas (Dashboards) usa `useAnalyticalData`, que chama `supabase.rpc` **diretamente**, sem passar pela camada de proteção contra timeout ou retry do `supabaseRPC.js`.

## 3. Hooks e Consumo de Dados

### 3.1. `useAnalyticalData.js` (Crítico)
*   **Uso:** Principal hook do sistema.
*   **Falha:** Não implementa `AbortController` para cancelamento de requisições antigas. Se o usuário mudar filtros rapidamente, múltiplas requisições pesadas encavalam e causam erro de rede.
*   **Tratamento de Erro:** Básico (`setError`). Não diferencia erro de rede, timeout ou RLS.

### 3.2. `useDashboardData.js`
*   **Dependência:** Usa `useAnalyticalData` com a RPC `get_overview_data_v2`.
*   **Risco:** Esta RPC é a mais pesada do sistema. Sem o timeout estendido de 30s (disponível apenas no `supabaseRPC.js`), ela falha frequentemente em conexões 3G/4G.

## 4. Contextos e Estado Global

### 4.1. `DataContext.jsx`
*   **Comportamento:** Tenta carregar dados globais no mount.
*   **Conflito:** Usa `callRpc` de `src/services/api.js` (Timeout 15s) ao invés de `supabaseRPC.js` (Timeout 30s). Isso causa falhas prematuras em cargas grandes.

### 4.2. `FilterContext.jsx`
*   **Impacto:** Alterações de filtro disparam re-renders que chamam os hooks de dados. Como não há *debounce* na atualização do contexto para chamadas de API, filtros digitados rapidamente geram spam de requisições.

## 5. Análise de Erros Comuns

1.  **`PGRST203` (Ambiguous Function):**
    *   **Causa:** Sobrecarga de funções RPC no Postgres com parâmetros opcionais. O cliente JS se perde se não enviar todos os argumentos esperados.
    *   **Mitigação:** `supabaseRPC.js` tenta tratar, mas `useAnalyticalData` não.

2.  **`57014` (Statement Timeout):**
    *   **Causa:** A query no banco demorou mais que o limite do Postgres (geralmente 15s ou 60s).
    *   **Local:** RPCs de agregação (`get_overview_data_v2`) sem índices adequados em `bd-cl`.

3.  **`TypeError: Failed to fetch`:**
    *   **Causa:** O cliente abortou a conexão antes do servidor responder (Timeout do lado do cliente muito curto).

---

## 6. Recomendações de Correção

### A. Unificação da Camada de Transporte (Urgente)
Eliminar `src/services/api.js` e refatorar `useAnalyticalData` para usar **exclusivamente** `src/lib/supabaseRPC.js`.

**Código Sugerido para `useAnalyticalData.js`:**