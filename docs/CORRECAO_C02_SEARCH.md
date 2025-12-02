# Correção C02: Tratamento de Busca Vazia

**Data:** 01/12/2025
**Status:** Implementado
**Problema:** O frontend enviava strings vazias (`""`) para o parâmetro `p_search_term` (e outros campos de texto) quando o usuário limpava o campo de busca. Algumas funções RPC no banco de dados esperam `NULL` para desativar o filtro, tratando `""` como uma busca literal por um nome vazio, resultando em zero resultados ("Nenhum dado encontrado").

## Solução Implementada

1.  **Atualização do Hook (`src/hooks/useAnalyticalData.js`)**:
    *   Implementada função `sanitizeParams(params)` que itera sobre os parâmetros.
    *   Regra aplicada: Se o valor for uma string e estiver vazia (`value.trim() === ''`), ela é convertida para `null`.
    *   Esta sanitização ocorre **antes** da geração da chave de cache (`queryKey`) e **antes** da chamada à API (`callRpc`).

## Benefícios

1.  **Consistência**: `""` e `null` agora são tratados como a mesma coisa ("sem filtro"), evitando duplicidade de cache.
2.  **Correção de Filtros**: Garante que as queries SQL recebam `NULL` quando o usuário não está buscando nada, ativando corretamente a lógica `(p_search_term IS NULL OR ...)` no banco de dados.
3.  **UX**: O usuário pode limpar o campo de busca e ver a lista completa reaparecer imediatamente.

## Como Validar

1.  Acesse uma página com filtro de texto, como **Analítico Supervisor** ou **Dashboard**.
2.  Digite um termo de busca que não existe (ex: "XYZ"). A lista deve ficar vazia.
3.  Apague o termo de busca (deixe o campo vazio).
4.  A lista deve recarregar e exibir todos os resultados novamente.
5.  No Network Tab do navegador, verifique o payload da requisição RPC. O campo `p_search_term` deve estar como `null` (ou omitido, se o `callRpc` limpar nulos, mas o importante é não ser `""`).