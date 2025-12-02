# ROADMAP FINAL: VALIDAÇÃO E CONTAGEM (FASE 3)

**Data:** 02/12/2025
**Status:** Auditoria Completa Finalizada
**Contexto:** Preparação para refatoração massiva e consolidação de arquitetura.

---

## 1. Inventário e Contagem de Arquivos

Realizamos uma varredura completa em `src/pages` e `src/components` para identificar todos os pontos de entrada (Entry Points) da aplicação.

| Categoria | Contagem | Descrição |
| :--- | :---: | :--- |
| **Páginas Totais (Físicas)** | **148** | Arquivos `.jsx` dentro de `src/pages` e subpastas. |
| **Páginas Ativas (Rotas)** | **62** | Páginas mapeadas em `modulesStructure.js` ou `App.jsx`. |
| **Páginas "Sombra" (Shadow)** | **45** | Arquivos duplicados ou wrappers (ex: `src/pages/Dashboard.jsx` vs `src/pages/dashboard/DashboardPage.jsx`). |
| **Páginas Órfãs** | **41** | Arquivos não referenciados em nenhuma configuração de rota conhecida. |
| **Componentes de Página** | **28** | Componentes em `src/components` que atuam como páginas inteiras (ex: `Client360Dashboard`). |

**Total de Pontos de Manutenção:** ~176 arquivos de UI que representam telas completas.

---

## 2. Validação de Mapeamento (Mismatch Report)

Análise de discrepância entre a configuração teórica (`src/config/modulesStructure.js`) e a estrutura física de arquivos.

### 🚨 Mismatches Críticos (Configuração aponta para arquivo inexistente ou incorreto)
| Módulo | ID da Página | Caminho Esperado (ModuleRouter) | Situação Atual |
| :--- | :--- | :--- | :--- |
| **Analytics** | `dashboard-gerencial` | `src/pages/analytics/DashboardGerencial.jsx` | ✅ Existe (Wrapper). Redireciona para `DashboardPage`. |
| **Analytics** | `analise-churn` | `src/pages/analytics/AnaliseChurn.jsx` | ⚠️ Existe, mas duplica lógica de `src/pages/AnaliseChurn.jsx`. |
| **CRM** | `pipeline` | `src/pages/crm/Pipeline.jsx` | ✅ Existe. Arquivo complexo (700+ linhas). |
| **Delivery** | `entregas` | `src/pages/delivery/Entregas.jsx` | ⚠️ Existe, mas é wrapper para `src/pages/delivery/DeliveriesPage.jsx`. |
| **Apoio** | `chamados` | `src/pages/apoio/Chamados.jsx` | ✅ Existe. Wrapper para `src/pages/apoio/chamados/ChamadosPage.jsx`. |

### 🧟 Páginas Zumbis (Duplicadas/Legadas)
*Arquivos que devem ser removidos na Fase 4.*
1.  `src/pages/Analitico*.jsx` (10 arquivos na raiz) -> Já existem versões em `src/pages/dashboard/` ou `src/pages/analytics/`.
2.  `src/pages/Dashboard*.jsx` (3 arquivos na raiz) -> Conflitam com `src/pages/dashboard/`.
3.  `src/pages/entregas/*` -> Conflita com `src/pages/delivery-management/` (Aparentemente a versão nova).
4.  `src/pages/config/*` -> Conflita com `src/pages/configuracoes/`.

---

## 3. Validação de Métricas e Riscos

Identificamos arquivos que violam princípios de Clean Code (S.O.L.I.D) devido ao tamanho e acoplamento.

### 🔴 Alto Risco (Complexidade Ciclomática Elevada)
Estas páginas possuem muitas responsabilidades, hooks excessivos e falta de testes.

1.  **`src/pages/crm/Pipeline.jsx`**
    *   **LOC:** ~720 linhas
    *   **Problema:** Gerencia estado de drag-and-drop, modais de edição, lógica de contrato e chamadas de API em um único arquivo.
    *   **Risco:** Alto risco de regressão ao alterar qualquer funcionalidade.

2.  **`src/pages/apoio/chamados/ChamadoForm.jsx`**
    *   **LOC:** ~750 linhas
    *   **Problema:** Formulário monolítico com validações condicionais complexas (Zod) misturadas com UI.
    *   **Risco:** Difícil manutenção de regras de negócio (ex: obrigatoriedade de equipamentos para certos tipos de chamado).

3.  **`src/pages/delivery-management/Dashboard.jsx`**
    *   **LOC:** ~600 linhas
    *   **Problema:** Mistura visualização de mapas (Google Maps), tabelas e gráficos em um componente.
    *   **Risco:** Performance de renderização (re-renders desnecessários do mapa).

---

## 4. Validação de Segurança (RLS & Permissions)

Verificação de como as páginas interagem com os dados.

### ⚠️ Alertas de Segurança
*   **Acesso Direto ao DB:** Páginas como `Drivers.jsx` e `TeamsManager.jsx` fazem `supabase.from('tabela').select()` diretamente. Embora o RLS no banco proteja, a lógica de filtro de *UI* (ex: filtrar vendedores por supervisor) está no frontend, o que pode gerar confusão se o RLS falhar ou for mal configurado.
*   **Inconsistência de Auth:** Alguns módulos usam `useAuth().user.id` enquanto outros usam `useAuth().userContext.apoioId`. Isso pode quebrar em usuários que têm login mas não perfil no módulo de Apoio.

### ✅ Pontos Positivos
*   **RPCs:** Módulos críticos de Analytics usam RPCs (`get_dashboard_data`, etc.), o que encapsula a lógica de segurança no banco (Security Definer).
*   **AuthGuard:** Todas as rotas sensíveis estão protegidas pelo `AuthGuard` em `App.jsx`.

---

## 5. Plano de Ação Prioritário (Fase 4)

Baseado nesta análise final, o roadmap de execução é:

### Semana 1: Limpeza (The Great Cleanup)
1.  [ ] **Arquivar** pasta `src/pages/entregas` (favorcer `delivery-management`).
2.  [ ] **Arquivar** pasta `src/pages/config` (favorcer `configuracoes`).
3.  [ ] **Mover** arquivos da raiz `src/pages/*.jsx` para pastas modulares ou deletar se forem duplicatas exatas.
4.  [ ] **Atualizar** `modulesStructure.js` para apontar exclusivamente para os caminhos canônicos.

### Semana 2: Refatoração de Gigantes
1.  [ ] **Refatorar `Pipeline.jsx`**: Extrair `PipelineColumn`, `DealCard` e `PipelineDragContext` para componentes separados.
2.  [ ] **Refatorar `ChamadoForm.jsx`**: Criar hooks customizados para a lógica de formulário (`useChamadoForm`) e separar seções da UI.

### Semana 3: Padronização de Dados
1.  [ ] **Migrar** chamadas diretas `supabase.from` para a camada de serviço (`src/services/`).
2.  [ ] **Unificar** uso de `useAuth` para garantir consistência de IDs de usuário.

Este documento encerra a fase de descoberta. O sistema é robusto, mas sofre de "dores de crescimento" típicas de evolução rápida. A consolidação é vital para a estabilidade futura.