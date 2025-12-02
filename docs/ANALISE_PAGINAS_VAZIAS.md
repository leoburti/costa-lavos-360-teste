# Diagnóstico: Páginas Analíticas Vazias ("Nenhum dado encontrado")

**Data:** 01/12/2025
**Status:** Diagnóstico Concluído e Correções Aplicadas

## 1. Resumo do Problema
As páginas analíticas (Supervisor, Vendedor, Região, Grupo de Clientes e Produto) estavam retornando estados vazios ou "Nenhum dado encontrado", especialmente quando acessadas fora do horário comercial ou à noite (fuso horário GMT-3).

## 2. Análise Detalhada

### A. Chamadas RPC
Verificamos o mapeamento entre páginas e funções do banco de dados (Supabase):

| Página | Função RPC Chamada | Status no Banco |
|--------|--------------------|-----------------|
| `AnaliticoSupervisor` | `get_supervisor_summary_v2` | ✅ Existe |
| `AnaliticoVendedor` | `get_seller_summary_v2` | ✅ Existe |
| `AnaliticoRegiao` | `get_regional_summary_v2` (mode='region') | ✅ Existe |
| `AnaliticoGrupoClientes` | `get_regional_summary_v2` (mode='customerGroup') | ✅ Existe |
| `AnaliticoProduto` | `get_product_basket_analysis_v2` | ✅ Existe |

Todas as funções existem e estão operacionais no esquema `public`.

### B. Análise de Parâmetros (Causa Raiz)
Identificamos que o frontend estava formatando as datas incorretamente antes de enviá-las para a API:

*   **Código Anterior:** `filters.dateRange[0].toISOString().split('T')[0]`
*   **Comportamento:** Converte a data local para UTC.
*   **Exemplo de Erro:**
    *   Usuário no Brasil (GMT-3) seleciona "Hoje" (01/12/2025).
    *   Se for 22:00 no Brasil, é 01:00 do dia 02/12/2025 em UTC.
    *   O sistema envia `p_start_date: "2025-12-02"`.
    *   O banco busca vendas do dia 02/12. Como ainda é dia 01/12 localmente, **nenhuma venda é encontrada**.

### C. Solução Aplicada
Substituímos a formatação manual pela função utilitária `formatDateForAPI` (implementada na correção C01), que garante o envio da data correta (`YYYY-MM-DD`) respeitando o fuso horário local do usuário.

## 3. Arquivos Corrigidos

1.  `src/pages/AnaliticoSupervisor.jsx`
2.  `src/pages/AnaliticoVendedor.jsx`
3.  `src/pages/AnaliticoRegiao.jsx`
4.  `src/pages/AnaliticoGrupoClientes.jsx`
5.  `src/pages/AnaliticoProduto.jsx`

Além da correção de data, padronizamos a importação de utilitários (`formatCurrency`) para usar `src/lib/utils`.