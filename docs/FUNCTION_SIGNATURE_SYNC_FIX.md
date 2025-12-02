# Resolução: Desincronização de Assinaturas de Funções (PGRST202) e Timeout (57014)

## Data: 29/11/2025
## Status: ✅ RESOLVIDO

### Problema Identificado

**1. Erro PGRST202 (Function Not Found / Argument Mismatch):**
O frontend enviava "Parâmetros Universais" (ex: `p_analysis_mode`, `p_drilldown_level`, `p_parent_keys`) para funções que não estavam preparadas para recebê-los. Isso ocorria porque o hook `useAnalyticalData` enviava um superset de parâmetros por padrão, mas o banco de dados possuía definições estritas (apenas os filtros básicos).

**Funções Afetadas:**
*   `get_daily_sales_data_v2`
*   `get_dashboard_xray_data`
*   `get_operational_analysis`
*   `get_treemap_data`

**2. Erro PGRST203 (Ambiguous Function):**
A função `get_treemap_data` possuía múltiplas versões com assinaturas diferentes no banco, causando ambiguidade quando o PostgREST tentava resolver qual chamar.

**3. Erro 57014 (Query Timeout):**
A função `get_clientes_visao_360_faturamento` (usada na busca de clientes) estava excedendo o limite padrão de execução (30s-60s) devido ao grande volume de dados e cálculos de agregação em tempo real.

### Solução Técnica Implementada

1.  **Padronização de Assinaturas (Universal Signature):**
    Todas as funções afetadas foram recriadas aceitando os Parâmetros Universais com valores `DEFAULT NULL`. Isso permite que o frontend envie o objeto de estado completo sem quebrar a chamada, garantindo compatibilidade futura e flexibilidade.

2.  **Limpeza de Sobrecargas (Overloading Cleanup):**
    Removemos as versões antigas das funções antes de criar a nova versão "Universal", eliminando a ambiguidade (PGRST203).

3.  **Aumento de Timeout Específico:**
    Aplicamos `ALTER FUNCTION ... SET statement_timeout TO '120s'` na função crítica de Visão 360, permitindo queries mais pesadas sem afetar a política de timeout global do banco.

4.  **Refatoração do Hook Frontend:**
    Atualizamos `src/hooks/useAnalyticalData.js` para mapear explicitamente os parâmetros esperados para cada função, adicionando uma camada de segurança extra além da tolerância do banco de dados.

### Funções Atualizadas