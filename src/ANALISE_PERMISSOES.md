# Análise Profunda das Tabelas de Usuários e Permissões

## 1. Análise Detalhada por Tabela

A seguir, uma análise individual de cada tabela relacionada à gestão de acesso e usuários.

---

### 1.1. `auth.users`
- **Propósito:** Tabela central de autenticação do Supabase. Armazena as identidades primárias dos usuários (e-mail, senha, metadados). É o ponto de partida para qualquer usuário no sistema.
- **Relacionamentos:**
  - `id` (PK) é referenciado como FK `user_id` em `public.user_roles`.
  - `id` (PK) é referenciado como FK `auth_id` em `public.apoio_usuarios`.
- **Campos Críticos:** `id`, `email`, `raw_user_meta_data`. A perda do `id` quebra a ligação com todas as outras tabelas de perfil.
- **Quantidade de Registros:** Não diretamente acessível, mas corresponde ao número total de contas criadas.
- **Hooks:**
  - `src/contexts/SupabaseAuthContext.jsx`: O hook `useAuth` interage diretamente com esta tabela através das funções `supabase.auth.*`.
- **Componentes:**
  - `src/pages/auth/LoginPage.jsx`: Utiliza para fazer login.
  - `src/components/settings/AddUserDialog.jsx`: Cria novos usuários aqui.
- **RLS Policies:** Políticas de segurança internas do Supabase.
- **Funções RPC dependentes:** `get_user_role`, `get_all_users_with_roles`, `get_user_access_scope`.

| Campo | Tipo | Chave/Nulo | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK** | Identificador único de autenticação do usuário. |
| `email` | `varchar` | `NOT NULL` | E-mail de login. |
| `encrypted_password` | `varchar` | | Hash da senha do usuário. |
| `raw_user_meta_data` | `jsonb` | | Metadados como `full_name` e `avatar_url`. |
| `...outros` | `variado` | | Campos de gerenciamento do Supabase (confirmação, etc.). |

---

### 1.2. `public.apoio_usuarios`
- **Propósito:** Tabela principal de perfis de **usuários internos (Apoio)**. Estende `auth.users` com dados específicos do sistema de apoio, como departamento, equipe, supervisor e permissões granulares.
- **Relacionamentos:**
  - `auth_id` -> `auth.users(id)` (Vínculo com a autenticação).
  - `perfil_id` -> `apoio_perfis(id)` (**Legado/Duplicado**).
  - `persona_id` -> `apoio_personas(id)` (Vínculo com o perfil base de permissões).
  - `equipe_id` -> `apoio_equipes(id)`.
  - `supervisor_id` -> `apoio_usuarios(id)` (Auto-relacionamento).
- **Campos Críticos:** `id`, `auth_id`, `email`, `vinculo_comercial`, `tipo_vinculo`.
- **Quantidade de Registros:** Desconhecida, mas representa todos os funcionários que usam o sistema de apoio.
- **Hooks:**
  - `src/hooks/useUsuarios.js`: Hook principal para CRUD de usuários de apoio.
  - `src/hooks/usePersonas.js`: Indiretamente, ao verificar se uma persona está em uso.
- **Componentes:**
  - `src/pages/configuracoes/gestao-acesso/UserAccessTable.jsx`: Exibe os dados.
  - `src/pages/configuracoes/gestao-acesso/AccessEditModal.jsx`: Edita os dados.
- **RLS Policies:** `supervisor_see_team`, `Users view themselves`, `Admins manage all users`.
- **Funções RPC dependentes:** `get_auth_user_apoio_id`, `get_user_equipe_id`, `get_chamado_detalhes`.

| Campo | Tipo | Chave/Nulo | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK** | ID primário do registro de usuário de apoio. |
| `auth_id` | `uuid` | **FK** `NOT NULL` | Chave estrangeira para `auth.users.id`. |
| `nome` | `text` | `NOT NULL` | Nome completo do usuário. |
| `email` | `text` | `NOT NULL` | E-mail (duplicado de `auth.users`). |
| `perfil_id` | `uuid` | **FK** (Legado) | Link para `apoio_perfis`. **Redundante** com `persona_id`.|
| `persona_id` | `uuid` | **FK** | Link para `apoio_personas`. O modelo de permissão principal. |
| `equipe_id` | `uuid` | **FK** | Link para `apoio_equipes`. |
| `supervisor_id` | `uuid` | **FK** (Self) | Link para o `id` de outro usuário (supervisor).|
| `modulos_acesso`| `jsonb` | | Permissões granulares que sobrescrevem a persona. |
| `vinculo_comercial`| `text` | | Vínculo com dados comerciais (Ex: Nome do Vendedor no BD-CL). |
| `tipo_vinculo` | `text` | | Tipo de vínculo ('supervisor' ou 'vendedor'). |
| `eh_aprovador` | `boolean` | | Indica se é um aprovador de bonificações. **Duplicado** com `user_approval_roles`.|

---

### 1.3. `public.user_roles`
- **Propósito:** Tabela de permissões de **alto nível**, focada principalmente no acesso comercial (CRM, Analytics). Define o papel principal e o vínculo comercial que alimenta as RLS (Row-Level Security) do BI.
- **Relacionamentos:**
  - `user_id` -> `auth.users(id)` (Vínculo com a autenticação).
- **Campos Críticos:** `user_id`, `role`, `vinculo_comercial`, `tipo_vinculo`. A RLS de toda a parte comercial depende destes campos.
- **Quantidade de Registros:** Desconhecida, deve ser 1 para cada usuário com acesso ao sistema.
- **Hooks:**
  - `src/contexts/SupabaseAuthContext.jsx`: O `fetchUserDetails` lê desta tabela para definir o contexto de permissão global.
- **Componentes:**
  - `src/pages/configuracoes/gestao-acesso/AccessEditModal.jsx`: Atualiza `vinculo_comercial` e `tipo_vinculo`.
- **RLS Policies:** `Users can view their own role`, `Admins have full access`.
- **Funções RPC dependentes:** `get_user_role`, `get_user_access_scope`.

| Campo | Tipo | Chave/Nulo | Descrição |
| :--- | :--- | :--- | :--- |
| `user_id` | `uuid` | **PK**, **FK** | Chave para `auth.users.id`. |
| `role` | `text` | `NOT NULL` | Papel principal do usuário (Ex: 'Nivel 1', 'Supervisor'). |
| `vinculo_comercial`| `text` | | **Duplicado** de `apoio_usuarios.vinculo_comercial`. |
| `tipo_vinculo` | `text` | | **Duplicado** de `apoio_usuarios.tipo_vinculo`. |
| `module_permissions`| `jsonb` | | **Duplicado** de `apoio_usuarios.modulos_acesso` e `apoio_perfis.permissoes`. |
| `can_access_crm` | `boolean` | `NOT NULL` | Flag de acesso ao CRM. **Redundante** se `module_permissions` for usado. |

---

### 1.4. `public.apoio_personas`
- **Propósito:** Define "modelos" ou "perfis base" de permissões. Cada usuário em `apoio_usuarios` pode ter uma persona, que dita suas permissões padrão.
- **Relacionamentos:**
  - É referenciada por `apoio_usuarios(persona_id)`.
- **Campos Críticos:** `id`, `nome`, `permissoes`.
- **Hooks:**
  - `src/hooks/usePersonas.js`: CRUD para esta tabela.
- **Componentes:**
  - `src/pages/configuracoes/gestao-equipe/PersonasTab.jsx`: Gerencia as personas.
  - `src/pages/configuracoes/gestao-acesso/AccessEditModal.jsx`: Permite atribuir uma persona a um usuário.
- **RLS Policies:** Nenhuma (dados públicos dentro do sistema).

| Campo | Tipo | Chave/Nulo | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK** | ID da persona. |
| `nome` | `text` | `NOT NULL` | Nome da persona (Ex: "Técnico de Campo", "Analista"). |
| `permissoes` | `jsonb` | | Objeto JSON que define os módulos padrão (Ex: `{"crm": true}`). |
| `tipo_uso` | `text` | `NOT NULL` | Categoria da persona (Ex: "Operacional", "Comercial"). |
| `ativo` | `boolean` | | Se a persona pode ser atribuída. |

---

### 1.5. `public.apoio_perfis` e `public.apoio_perfil_permissoes`
- **Propósito:** Sistema de permissões **legado**. `apoio_perfis` é análogo a `apoio_personas`, e `apoio_perfil_permissoes` é uma tabela de junção. Parece ter sido substituído pela estrutura de `personas` + `modulos_acesso` (JSONB), que é mais flexível.
- **Relacionamentos:**
  - `apoio_perfil_permissoes.perfil_id` -> `apoio_perfis(id)`.
  - `apoio_perfil_permissoes.permissao_id` -> `apoio_permissoes(id)`.
- **Status:** **Candidatas a Depreciação/Remoção.**
- **Hooks:**
  - `src/hooks/usePerfis.js`, `src/hooks/useAcessos.js`.
- **Componentes:**
  - `src/pages/configuracoes/usuarios/UsersPermissionsPage.jsx`: Principal componente que ainda gerencia esta estrutura.

| Tabela | Campo | Tipo | Chave/Nulo | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `apoio_perfis`| `id` | `uuid` | **PK** | ID do perfil. |
| `apoio_perfis`| `nome`| `text` | `NOT NULL` | Nome do perfil. |
| `apoio_perfis`| `permissoes`| `jsonb` | | **Tentativa de modernização**, mas a tabela de junção ainda existe. |
| `apoio_perfil_permissoes` | `id` | `uuid` | **PK** | ID da junção. |
| `apoio_perfil_permissoes` | `perfil_id` | `uuid` | **FK** | |
| `apoio_perfil_permissoes` | `permissao_id`| `uuid` | **FK** | |

---

### 1.6. `public.apoio_permissoes`
- **Propósito:** Tabela **legada** que define cada permissão individualmente (Ex: 'ver_relatorio', 'editar_usuario'). Foi criada para ser usada com `apoio_perfil_permissoes`.
- **Status:** **Candidata a Depreciação/Remoção.** A lógica moderna usa chaves de JSON (`{"analytics": true}`).
- **Hooks:** `src/hooks/useAcessos.js`.
- **Componentes:** `src/pages/configuracoes/usuarios/UsersPermissionsPage.jsx`.

| Campo | Tipo | Chave/Nulo | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK** | ID da permissão. |
| `nome` | `text` | `NOT NULL` | Nome técnico (Ex: `read:report`). |
| `modulo` | `text`| `NOT NULL` | Módulo ao qual pertence. |
| `acao` | `text`| `NOT NULL` | Ação (Ex: 'Visualizar', 'Criar'). |

---

### 1.7. `public.apoio_usuario_permissoes_especiais`
- **Propósito:** Tabela de junção para conceder permissões avulsas a um usuário, quebrando a regra do perfil. É um sistema de *override*.
- **Status:** **Redundante.** A mesma funcionalidade é obtida de forma mais simples com o campo `modulos_acesso` (JSONB) na tabela `apoio_usuarios`.
- **RLS Policies:** Nenhuma.

| Campo | Tipo | Chave/Nulo | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | **PK** | ID da junção. |
| `usuario_id` | `uuid` | **FK** | Link para `apoio_usuarios`. |
| `permissao_id` | `uuid` | **FK** | Link para `apoio_permissoes` (legado). |

---

### 1.8. `public.apoio_aprovadores` e `public.user_approval_roles`
- **Propósito:** Ambas as tabelas controlam quem pode aprovar o quê, mas parecem ser de sistemas diferentes e estão **duplicadas**.
  - `apoio_aprovadores`: Focada em tipos de aprovação do sistema de apoio.
  - `user_approval_roles`: Mais genérica, com flags booleanas para diferentes tipos de aprovação (bonificação, equipamento, etc.).
- **Status:** **Forte candidata a consolidação.** A tabela `user_approval_roles` é mais estruturada e escalável. O campo `eh_aprovador` em `apoio_usuarios` também é redundante.
- **Hooks:** Nenhum hook específico foi encontrado para `user_approval_roles`, indicando possível subutilização. `useUsuarios` lê `eh_aprovador`.

| Tabela | Campo | Tipo | Chave/Nulo | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `apoio_aprovadores`| `usuario_id` | `uuid` | **FK** | Link para `apoio_usuarios`. |
| `apoio_aprovadores`| `tipos_aprovacao`| `jsonb` | | JSON com os tipos que pode aprovar. |
| `user_approval_roles`|`user_id`|`uuid`|**PK**, **FK**| Link para `auth.users`. |
| `user_approval_roles`|`bonification_approver`|`boolean`| `NOT NULL` | Flag para aprovador de bonificação. |
| `user_approval_roles`|`...`|`boolean`| `NOT NULL` | Flags para outros tipos. |

---

## 2. Mapa Visual de Relacionamentos e Duplicações