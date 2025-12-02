# ROADMAP DE REFATORAÇÃO - COSTA LAVOS 360

Este documento define o plano estratégico para a refatoração completa do sistema, baseado na auditoria da Fase 1.

## FASE 2: ARQUITETURA E ORGANIZAÇÃO (Imediato)
**Objetivo:** Limpar a casa e preparar o terreno para escalabilidade.

1.  **Modularização de Rotas**
    *   Criar diretório `src/routes/`
    *   Dividir `App.jsx` em: `AnalyticsRoutes`, `CRMRoutes`, `SupportRoutes`, `ConfigRoutes`.
    *   Reduzir `App.jsx` para apenas provedores de contexto e layout base.

2.  **Padronização de Estrutura de Pastas (Feature-First)**
    *   Mover lógica espalhada para colocalização. Exemplo:
        *   `src/features/analytics/components/`
        *   `src/features/analytics/hooks/`
        *   `src/features/analytics/services/`
        *   `src/features/analytics/pages/`

3.  **Unificação da Camada de Serviço**
    *   Refatorar `useAnalyticalData` para NÃO aceitar parâmetros brutos (`p_start_date`).
    *   O hook deve aceitar objetos de domínio (`startDate`, `filters`).
    *   O hook deve delegar a transformação para `analyticsRpcService.js` antes de chamar o Supabase.

## FASE 3: ROBUSTEZ E PADRÕES (Curto Prazo)

1.  **Tratamento de Erros Global**
    *   Implementar `ErrorBoundary` granular (por widget ou seção, não apenas por página).
    *   Padronizar mensagens de erro e fallbacks de UI.

2.  **Otimização de Contextos**
    *   Analisar `FilterContext`. Se apenas Analytics usa filtros complexos, mover para `src/features/analytics/context/AnalyticsFilterContext`.
    *   Evitar re-renders globais quando um filtro muda.

3.  **Sanitização de Código Morto**
    *   Remover arquivos não referenciados identificados na auditoria.
    *   Deprecar funções RPC antigas (`_old`) no banco após garantir que o frontend não as usa.

## FASE 4: MODERNIZAÇÃO E TYPESCRIPT (Médio Prazo)

1.  **Adoção de JSDoc/TypeScript**
    *   Como o projeto é JS, adotar JSDoc rigoroso para serviços e hooks principais como passo intermediário.
    *   Definir "Types" (interfaces) para as respostas das RPCs.

2.  **Performance Tuning**
    *   Implementar `useMemo` e `useCallback` de forma criteriosa em componentes de visualização de dados (Treemaps, Tabelas grandes).
    *   Virtualização de listas longas (já existe `VirtualList`, expandir uso).

## FASE 5: DOCUMENTAÇÃO E TESTES (Contínuo)

1.  **Storybook (Opcional mas recomendado)**
    *   Documentar componentes de UI base (`Button`, `Card`, `MetricCard`).

2.  **Testes Automatizados**
    *   Testes unitários para `analyticsRpcService` (garantir que o mapeamento de parâmetros está correto).
    *   Testes de integração para fluxos críticos (Login -> Dashboard).

---

## PRÓXIMO PASSO IMEDIATO (AÇÃO TÉCNICA)

Executar a **FASE 2, ITEM 3**: Unificação da Camada de Serviço.
*   Isso resolve o problema de inconsistência identificado na auditoria onde o hook bypassa o serviço.
*   Isso protege o frontend de mudanças nos nomes de parâmetros do banco de dados.