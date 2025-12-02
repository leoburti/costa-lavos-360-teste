# Correção C04: Visão 360 do Cliente (Redirecionamento e Dados)

**Data:** 01/12/2025
**Status:** Implementado
**Problema:** A página `Visao360ClientePage.jsx` redirecionava agressivamente para o Dashboard (`/dashboard`) ao tentar carregar um cliente. Isso ocorria devido a:
1.  Falha na validação de acesso quando o ID do cliente na URL continha formatação composta (ex: `CODE-STORE` como `1234-1`), o que causava erro na query ao banco (coluna `Cliente` é numérica/bigint).
2.  Lógica de redirecionamento automático (`navigate`) dentro do bloco `catch` e validação, impedindo o usuário de ver a mensagem de erro.

## Análise

### 1. Arquivo `Visao360ClientePage.jsx`
O componente tentava consultar a tabela `bd-cl` usando `.eq('Cliente', clientId)`. Se `clientId` fosse uma string composta (comum no sistema, ex: "1050-1"), o PostgREST retornava erro de sintaxe para tipo `bigint`, disparando o bloco `catch` que redirecionava o usuário.

### 2. Rotas Configuradas
*   `/visao-360-cliente/:clientId`: Rota legada/alternativa que usa este componente.
*   `/cliente/:clientId`: Rota da nova Visão 360 (`Client360.jsx`).

### 3. RPC `get_client_360_overview`
Esta RPC **não existe** no banco de dados atual. A RPC correta utilizada pela página é `get_client_analytics`, que espera `p_client_id` (texto) e compara com a coluna `Cliente` convertida para texto.

## Solução Implementada

1.  **Remoção do Redirecionamento Automático**:
    *   Removidos os `setTimeout` com `navigate('/dashboard')`.
    *   Agora, se houver erro ou acesso negado, a página exibe um estado de erro claro (`ErrorState`) com um botão "Voltar" manual.

2.  **Tratamento do ID do Cliente**:
    *   Adicionada lógica para extrair apenas o código numérico do cliente caso o ID venha no formato `CODIGO-LOJA` (ex: `1234-1` -> `1234`).
    *   Isso garante que a query SQL de validação (`.eq('Cliente', cleanClientId)`) funcione corretamente contra a coluna `bigint`.

3.  **Validação de Dados**:
    *   Adicionado tratamento para garantir que `get_client_analytics` receba o código do cliente limpo.

## Como Validar

1.  Acesse uma URL de cliente direta: `/visao-360-cliente/1812` ou `/visao-360-cliente/1812-1`.
2.  A página deve carregar os dados ou exibir uma mensagem de erro específica ("Cliente não encontrado" ou "Erro ao carregar"), sem pular imediatamente para o Dashboard.
3.  Verifique se os KPI cards (Total de Compras, Número de Pedidos) estão populados.