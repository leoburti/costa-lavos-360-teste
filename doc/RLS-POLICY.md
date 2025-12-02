# Política de Segurança (RLS) - Costa Lavos 360

Este documento define as políticas de Row Level Security (RLS) para proteger dados sensíveis no Supabase, garantindo que usuários acessem apenas os dados permitidos por sua hierarquia comercial.

## 1. Princípios Gerais
- **Deny by Default:** Todas as tabelas devem ter RLS habilitado. O acesso é negado a menos que explicitamente permitido.
- **Hierarquia Comercial:** O acesso é determinado pela tabela `users_unified`, que vincula o `auth.uid()` a um `Vendedor` ou `Supervisor`.
- **Isolamento de Tenant:** Embora atualmente seja um sistema único, as políticas são desenhadas para suportar múltiplos contextos se necessário.

## 2. Estrutura de Permissões
A função auxiliar `get_user_access_scope()` (já existente no banco) retorna o escopo do usuário atual. As políticas devem utilizar essa função ou lógica equivalente para performance.

### Tabela de Controle: `users_unified`
- **Admin:** Acesso total.
- **Supervisor:** Acesso aos seus dados e de todos os vendedores vinculados a ele.
- **Vendedor:** Acesso apenas aos dados onde ele é o vendedor responsável.

## 3. Políticas por Tabela

### 3.1. Tabela Principal: `bd-cl` (Vendas/Legado)
Esta é a tabela mais crítica, contendo transações, valores financeiros e dados de clientes.

**Política: `bd_cl_user_scope_policy`** (Existente/Refinada)
- **Operação:** `SELECT`
- **Definição SQL:**