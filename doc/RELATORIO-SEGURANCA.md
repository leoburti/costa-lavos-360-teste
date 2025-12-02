# Relatório de Segurança

**Data:** 02/12/2025

## 1. Row Level Security (RLS)
A segurança de dados no Supabase depende de RLS.

*   **Status RPCs:** As funções RPC (`get_*`) geralmente usam `SECURITY DEFINER`. Isso significa que elas rodam com as permissões do criador da função (geralmente admin/postgres).
    *   *Risco:* A função DEVE filtrar os dados internamente baseada no usuário logado (`auth.uid()`).
    *   *Mitigação:* As RPCs analisadas (ex: `get_dashboard_data`) aceitam parâmetros de filtro (`p_supervisors`, etc), mas confiam que o frontend envie os filtros corretos ou que a lógica interna valide o acesso. Idealmente, a RPC deve forçar o filtro `WHERE supervisor_id = auth.uid()` se o usuário não for admin.

*   **Acesso Direto (`supabase.from`):** Várias páginas (ex: `Drivers.jsx`, `Contacts.jsx`) fazem `select` direto nas tabelas.
    *   *Requisito:* As tabelas `motoristas_v2`, `crm_contacts`, etc., DEVEM ter Policies RLS ativas no Supabase.
    *   *Diagnóstico:* `DeepDiagnosisPage.jsx` pode ser usada para verificar se tabelas críticas têm RLS habilitado.

## 2. Validação de Entrada
*   Formulários usam `react-hook-form` e `zod` (ex: `ChamadoForm.jsx`), o que garante boa validação no frontend.
*   É necessário garantir que as RPCs e Edge Functions também validem os dados no backend.

## 3. Autenticação
*   Implementada via `SupabaseAuthContext`.
*   Proteção de Rotas: `AuthGuard` protege rotas autenticadas. `ModuleGuard` (se implementado/usado) deveria proteger rotas por permissão específica.
*   *Falha Potencial:* Se uma página não estiver envolta em `AuthGuard` no `App.jsx`, ela pode ser acessada publicamente se a RLS não impedir. A estrutura atual parece envolver todas as rotas internas corretamente.