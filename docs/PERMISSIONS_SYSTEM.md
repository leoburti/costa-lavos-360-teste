# Sistema de Permissões

## Visão Geral

O sistema de permissões foi refatorado para ser independente do Contexto de Autenticação, prevenindo erros de "function not found" e garantindo consistência em toda a aplicação.

## Funções Disponíveis (`src/utils/permissions.js`)

### `hasPermission(user, requiredPermission, mode = 'any')`

Verifica se um usuário tem uma permissão específica.

- **user**: Objeto do usuário (Supabase user object)
- **requiredPermission**: String ou Array de strings com as permissões necessárias.
- **mode**: 'any' (padrão - basta ter uma) ou 'all' (precisa ter todas).

**Bypass de Admin:** Usuários com role 'admin' ou 'Nivel 1' sempre retornam `true`.

### `isAdmin(user)`

Atalho para verificar se o usuário é Administrador ou Nível 1.

### `getUserPermissions(user)`

Extrai e normaliza as permissões do objeto de usuário, verificando múltiplas fontes:
1. `user.role`
2. `user.user_metadata.role`
3. `user.user_metadata.permissions`
4. `user.app_metadata.role`

## Uso no React (`usePermissions` Hook)

Recomendamos usar o hook `usePermissions` em componentes funcionais: