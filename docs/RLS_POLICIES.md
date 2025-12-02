# Documentação de Políticas de Row-Level Security (RLS)

Este documento detalha a estratégia de Row-Level Security (RLS) implementada no banco de dados, garantindo que os usuários só possam acessar os dados aos quais têm permissão. A documentação serve como uma referência permanente para desenvolvimento, manutenção e auditoria.

## 1. Personas e Níveis de Acesso

As seguintes personas foram identificadas no sistema, cada uma com diferentes escopos de acesso:

-   **Admin (Nivel 1 & 5):** Acesso irrestrito a todos os dados em todas as tabelas. Utiliza a função `is_admin()`.
-   **Supervisor:** Acesso aos dados de vendas e CRM de sua própria equipe e dos vendedores que supervisiona. O acesso é governado principalmente pela função `get_user_access_scope()`.
-   **Vendedor:** Acesso restrito aos seus próprios dados de vendas, clientes e atividades de CRM. O acesso é governado pela função `get_user_access_scope()`.
-   **Técnico de Apoio:** Acesso a chamados, agendamentos e dados de comodato relevantes para suas atribuições. Geralmente, o acesso é por `auth.uid()` ou `equipe_id`.
-   **Motorista:** Acesso às suas próprias entregas e rotas. O RLS é baseado em `auth.uid() = motorista_id`.
-   **Usuário Autenticado:** Acesso genérico a dados públicos ou ao seu próprio perfil.

## 2. Tipos de Políticas de Acesso

As políticas de RLS são categorizadas nos seguintes tipos, baseados no mecanismo de filtragem:

-   **Tipo A (Escopo Comercial Dinâmico):** Utiliza a função `get_user_access_scope()` para filtrar dados com base na hierarquia comercial (supervisores e vendedores). É a política mais complexa, aplicada a tabelas de vendas e CRM.
-   **Tipo B (Propriedade do Usuário):** Filtra os dados onde `auth.uid()` corresponde a uma coluna de `user_id` ou `criado_por`. Garante que usuários só vejam seus próprios registros.
-   **Tipo C (Acesso de Equipe):** Filtra dados com base no `equipe_id` do usuário, permitindo que membros de uma equipe vejam os dados uns dos outros.
-   **Tipo D (Acesso de Admin):** Restringe o acesso total da tabela a usuários com privilégios de administrador, usando a função `is_admin()`. Aplicado a tabelas de sistema, logs e auditoria.
-   **Tipo E (Integração Externa):** Semelhante ao Tipo D, restringe o acesso a tabelas populadas por sistemas externos a administradores.

## 3. Tabelas e Políticas Aplicadas

Abaixo está o mapeamento das tabelas críticas e o tipo de política de RLS que foi ou será aplicada.

| Tabela                       | Tipo de Acesso             | Justificativa                                        |
| ---------------------------- | -------------------------- | ---------------------------------------------------- |
| `bd-cl`                      | A (Escopo Comercial)       | Tabela principal de vendas, requer filtro hierárquico. |
| `bd_cl_inv`                  | A (Escopo Comercial)       | Inventário de equipamentos ligado à estrutura de vendas. |
| `users_unified`              | B (Propriedade do Usuário) | Usuários só podem ver e editar seu próprio perfil.       |
| `apoio_equipes`              | C (Equipe)                 | Membros e supervisores podem ver dados da equipe.      |
| `crm_team_goals`             | C (Equipe)                 | Metas são definidas e visualizadas no nível da equipe.  |
| `contele_usuario`            | B (Propriedade do Usuário) | Dados de usuário da Contele vinculados ao `auth.uid()`.  |
| `crm_automation_*`           | A (Escopo Comercial)       | Automações de CRM devem seguir a hierarquia de vendas.   |
| `crm_comodato_contracts`     | A (Escopo Comercial)      | Contratos de comodato ligados a negociações de CRM.      |
| `bonification_audit_log`     | D (Admin Only)             | Logs de auditoria devem ser acessíveis apenas por admins.|
| `tb_log_insert_contele`      | D (Admin Only)             | Tabela de log de sistema para auditoria.             |
| `contele_locais`             | E (Integração Externa)     | Dados de integração, acesso restrito.                |
| `contele_visitas`            | E (Integração Externa)     | Dados de integração, acesso restrito.                |

## 4. Políticas SQL Implementadas