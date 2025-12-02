# Relatório de Auditoria RLS e Segurança RPC

**Data:** 01/12/2025
**Status:** Auditoria Concluída e Correções Aplicadas

## 1. Objetivo
Auditoria de segurança nas funções RPC (Remote Procedure Calls) utilizadas nos dashboards analíticos para garantir que a Row Level Security (RLS) configurada nas tabelas principais (`bd-cl`, `bd_cl_inv`) seja respeitada, impedindo vazamento de dados entre hierarquias (Supervisores/Vendedores).

## 2. Análise de Políticas RLS (Tabelas)

| Tabela | Política Ativa | Lógica | Status |
| :--- | :--- | :--- | :--- |
| `bd-cl` (Vendas) | `bd_cl_user_scope_policy` | Utiliza função `get_user_access_scope()` para filtrar por `Nome Supervisor` ou `Nome Vendedor`. | ✅ Segura |
| `bd_cl_inv` (Equip) | `bd_cl_inv_user_scope_policy` | Mesma lógica de escopo hierárquico. | ✅ Segura |
| `users_unified` | `select_own_data` | Restringe leitura ao próprio usuário ou admin. | ✅ Segura |

## 3. Auditoria de Funções RPC

Identificamos um risco crítico em várias funções analíticas que estavam configuradas como `SECURITY DEFINER`.

**Conceito:**
*   `SECURITY DEFINER`: A função roda com os privilégios de quem a criou (geralmente Admin), **ignorando** as políticas RLS da tabela consultada.
*   `SECURITY INVOKER` (Padrão): A função roda com os privilégios do usuário logado (`auth.uid()`), **respeitando** as políticas RLS.

### Matriz de Risco e Correção

| Função RPC | Configuração Original | Risco Identificado | Ação Corretiva |
| :--- | :--- | :--- | :--- |
| `get_regional_summary_v2` | `SECURITY DEFINER` | **Alto**. Ignorava RLS da tabela `bd-cl`. Usuários poderiam ver dados de outras regiões/equipes se chamassem a RPC diretamente. | **Removido** `SECURITY DEFINER`. Agora roda como Invoker. |
| `get_product_mix_analysis` | `SECURITY DEFINER` | **Alto**. Ignorava RLS. Vazamento de mix de produtos de toda a base. | **Removido** `SECURITY DEFINER`. |
| `get_daily_sales_data_v2` | `SECURITY DEFINER` | **Alto**. Ignorava RLS. Vazamento de faturamento diário global. | **Removido** `SECURITY DEFINER`. |
| `get_seller_summary_v2` | `SECURITY DEFINER` | **Médio**. Wrapper da função regional. Herdava risco. | **Removido** `SECURITY DEFINER`. |
| `get_supervisor_summary_v2` | `SECURITY DEFINER` | **Médio**. Wrapper da função regional. Herdava risco. | **Removido** `SECURITY DEFINER`. |
| `get_drilldown_data` | `SECURITY INVOKER` | Nenhum. Já estava correta. | Nenhuma ação necessária. |
| `get_user_access_scope` | `SECURITY DEFINER` | Nenhum. Esta função *deve* ser Definer para ler permissões em `users_unified` e montar o escopo. | Mantido `SECURITY DEFINER`. |

## 4. Implementação
As funções marcadas com risco foram recriadas no banco de dados removendo a cláusula `SECURITY DEFINER`. Agora, quando o frontend chama estas funções:
1.  A execução ocorre como o usuário logado.
2.  A query interna tenta acessar `bd-cl`.
3.  O Postgres dispara a política `bd_cl_user_scope_policy`.
4.  A política chama `get_user_access_scope()` para determinar o que o usuário pode ver.
5.  Apenas os dados permitidos são processados pela agregação da função.

## 5. Validação
Para validar, acesse o sistema com um usuário de perfil "Vendedor". Os gráficos e KPIs devem refletir **apenas** as vendas vinculadas ao nome deste vendedor, mesmo que os filtros globais não sejam aplicados.