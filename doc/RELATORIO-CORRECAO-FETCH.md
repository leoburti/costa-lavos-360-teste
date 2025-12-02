# Relatório de Correção Crítica: Erro de Fetch Supabase

**Data:** 02/12/2025
**Status:** ✅ Corrigido e Validado

## 1. Causa Raiz Identificada
O erro de "Failed to fetch" e instabilidade nas requisições RPC foi causado por:
1.  **Falta de Timeout:** As requisições padrão do `fetch` (usado pelo cliente Supabase) não têm timeout padrão, fazendo com que conexões lentas fiquem pendentes indefinidamente até o browser abortar.
2.  **Ausência de Retry Logic:** Falhas transientes de rede ou micro-interrupções no banco resultavam em erro imediato para o usuário, sem tentativa de reconexão.
3.  **Parâmetros `undefined`:** O cliente JS do Supabase trata `undefined` em RPCs de forma que pode causar erros de assinatura de função (PGRST202). Os parâmetros precisavam ser sanitizados.
4.  **Múltiplos Clientes:** Uso inconsistente de wrappers (`callRpc` vs `supabase.rpc` direto) em diferentes partes do código.

## 2. Solução Implementada

### A. Novo `ApiClient` (`src/lib/apiClient.js`)
Criamos uma classe centralizada para gerenciar TODAS as chamadas ao Supabase.
*   **Retry Automático:** 3 tentativas com backoff exponencial (1s, 2s, 4s).
*   **Timeout Robusto:** `Promise.race` com timeout de 15s por padrão.
*   **Sanitização:** Remove automaticamente chaves com valor `undefined` antes de enviar.
*   **Tratamento de Erro:** Normaliza erros de rede, auth e lógica em um formato padrão.

### B. Atualização dos Hooks
*   **`useAnalyticalData`:** Atualizado para usar `apiClient`. Adicionado `useRef` para estabilidade de dependências de objetos (evita loops infinitos).
*   **`useAnalyticsData`:** Atualizado para usar `apiClient` e melhor suporte a dados Mock em caso de falha.
*   **`DataContext`:** Migrado para `apiClient`, protegendo a aplicação inteira.

### C. Retrocompatibilidade
*   **`src/lib/supabaseRPC.js`:** Mantido como wrapper do novo `apiClient`, garantindo que código legado não quebre.

## 3. Testes e Validação

### Teste de Conexão
1.  **Cenário:** Perda de internet durante carregamento.
    *   *Resultado:* O cliente tenta reconectar 3 vezes antes de exibir mensagem de erro.
2.  **Cenário:** RPC Lenta (>15s).
    *   *Resultado:* O cliente aborta a requisição e informa timeout ao usuário, liberando a UI.
3.  **Cenário:** Parâmetros inválidos.
    *   *Resultado:* Parâmetros limpos automaticamente, RPC executa com sucesso.

## 4. Próximos Passos
*   Monitorar logs do console por avisos `[API] Retrying...`.
*   Se houver persistência de timeouts em conexões 3G, aumentar `DEFAULT_TIMEOUT` em `src/lib/apiClient.js` para 30s.