# Análise de Desincronização de Parâmetros - 14 Funções

## Data: 2025-11-29
## Equipe: Arquiteto de Software + Backend + Frontend + SRE + QA

### Contexto

**Problema:** 14 funções apresentando erros de assinatura (PGRST202) ou comportamento inesperado devido a parâmetros extras enviados pelo frontend.
**Causa Raiz:** O frontend (`useAnalyticalData`) envia um objeto consolidado de parâmetros ("superset") para todas as chamadas RPC. As funções legadas ou específicas não estavam preparadas para receber parâmetros extras que não utilizam.
**Solução Recomendada:** Opção C - Robustez via Parâmetros Opcionais (DEFAULT NULL).

### Investigação Realizada

#### 1. Frontend
- ✅ **Investigado:** `src/hooks/useAnalyticalData.js`
- ✅ **Constatação:** O hook possui um objeto `allParams` que coleta filtros globais e customizados. Embora exista lógica de mapeamento para algumas funções, o "fallback" ou a mistura de `customParams` pode injetar argumentos não esperados (ex: `p_analysis_mode` sendo enviado para `get_churn_analysis_data_v3`).
- ✅ **Risco:** Qualquer novo filtro adicionado no frontend quebra potencialmente todas as funções backend que não o declaram explicitamente.

#### 2. Backend
- ✅ **Investigado:** Assinaturas de 14 funções críticas.
- ✅ **Constatação:** A maioria segue um padrão estrito (9 argumentos de filtro). Funções como `get_drilldown_data` exigem parâmetros extras obrigatórios.
- ✅ **Problema:** Postgres/Supabase RPC exige correspondência exata de nomes de argumentos passados no objeto JSON. Argumentos extras geram erro `42883` (function does not exist) ou `PGRST202`.

#### 3. Tabela bd-cl
- ✅ **Investigado:** Permissões e RLS.
- ✅ **Status:** Necessário reforçar GRANTs para o role `authenticated` e garantir que as políticas de RLS não bloqueiem a leitura de dados analíticos legítimos.

### Recomendação da Equipe Sênior

**OPÇÃO C: Parâmetros Opcionais Universais (RECOMENDADA)**

Esta abordagem modifica todas as funções analíticas para aceitar o "superset" de parâmetros comuns, definindo como `DEFAULT NULL` aqueles que não são nativos da função.

**Benefícios:**
1.  **Resiliência:** O frontend pode enviar parâmetros "sujos" ou extras sem quebrar a chamada.
2.  **Compatibilidade:** Chamadas antigas continuam funcionando.
3.  **Manutenibilidade:** Padroniza a assinatura das funções analíticas, reduzindo a carga cognitiva.

### Implementação

#### Fase 1: Padronização de Assinaturas (Backend)
Todas as 14 funções receberão os seguintes parâmetros adicionais como opcionais:
- `p_analysis_mode`
- `p_analysis_type`
- `p_drilldown_level`
- `p_level`
- `p_parent_key`
- `p_parent_keys`
- `p_show_defined_groups_only`
- `p_supervisor_name`

#### Fase 2: Refinamento do Hook (Frontend)
Atualização do `useAnalyticalData.js` para garantir mapeamento explícito e tipagem correta, servindo como segunda camada de defesa.

### Funções Afetadas e Corrigidas

1.  `get_churn_analysis_data_v3`
2.  `get_rfm_analysis`
3.  `get_new_client_trends`
4.  `get_low_performance_clients`
5.  `get_loyalty_analysis`
6.  `get_equipment_movement`
7.  `get_supervisor_analytical_data`
8.  `get_seller_analytical_data`
9.  `get_supervisor_one_on_one_data`
10. `get_regional_summary_v2`
11. `get_drilldown_data`
12. `get_group_sales_analysis`
13. `get_product_basket_analysis_v2`
14. `get_product_mix_analysis`

### Assinatura

- **Arquiteto de Software:** Horizons AI - 2025-11-29
- **Status:** APROVADO PARA IMPLEMENTAÇÃO