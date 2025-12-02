# RELATÓRIO DE AUDITORIA - FASE 1 (DIAGNÓSTICO)

**Data:** 30/11/2025
**Responsável:** Hostinger Horizons (Senior Team)
**Escopo:** Auditoria Completa do Aplicativo Costa Lavos 360

## 1. RESUMO EXECUTIVO

O aplicativo apresenta uma base funcional sólida construída sobre React e Supabase, mas sofre de dores de crescimento típicas de escalabilidade rápida. A arquitetura atual mostra sinais de fragmentação, onde padrões antigos (Legacy) coexistem com implementações mais modernas e robustas (como o hook `useAnalyticalData` recentemente refatorado).

O principal risco identificado é a **inconsistência na camada de comunicação de dados** (Frontend <-> RPC) e a **estrutura monolítica do roteamento** (`App.jsx`), que impacta a manutenibilidade e performance.

## 2. PROBLEMAS CRÍTICOS IDENTIFICADOS

### 2.1. Arquitetura e Estrutura
*   **App.jsx Monolítico:** O arquivo `src/App.jsx` possui quase 500 linhas e gerencia todo o roteamento. Isso dificulta o code splitting eficiente e torna a manutenção arriscada.
*   **Estrutura de Pastas Híbrida:** Existe uma mistura de organização por "tipo" (components, pages) e por "feature" (dentro de `pages/apoio`, `pages/crm`). Isso cria confusão sobre onde novos arquivos devem residir.
*   **Dead Code:** Arquivos como `get_treemap_data_old` (backend) e possíveis componentes não utilizados no frontend aumentam o bundle size desnecessariamente.

### 2.2. Gerenciamento de Estado e Dados
*   **Acoplamento Frontend-Banco:** As páginas (ex: `AnaliticoSupervisor.jsx`) constroem objetos de parâmetros usando chaves específicas do banco de dados (`p_start_date`, `p_analysis_mode`). Isso viola o princípio de separação de responsabilidades. Se o nome de um parâmetro mudar no banco, o frontend quebra em múltiplos lugares.
*   **Duplicidade de Serviços:** Existe um `src/services/analyticsRpcService.js` (que tenta mapear parâmetros) e um `src/hooks/useAnalyticalData.js` (que chama o Supabase diretamente). O hook ignora a camada de serviço, tornando a lógica de mapeamento do serviço inútil ou redundante.
*   **Context Hell:** O uso de muitos contextos globais (`FilterContext`, `NotificationContext`, `PageActionContext`, etc.) no topo da árvore pode causar re-renderizações excessivas se não otimizado.

### 2.3. Código e Padrões
*   **Tratamento de Erros Inconsistente:** Enquanto novas páginas usam tratamento de erro robusto, páginas legadas podem falhar silenciosamente ou mostrar erros genéricos.
*   **Mistura de JS e Conceitos TS:** O projeto é JavaScript, mas existem referências a tipos em alguns comentários, sem o rigor de verificação do TypeScript.
*   **Magic Strings:** Strings literais como `'supervisor'`, `'region'`, `'p_start_date'` estão espalhadas por todo o código.

## 3. ANÁLISE DE COMPONENTES CHAVE

### 3.1. Hooks
*   **`useAnalyticalData` (Atual):** ✅ **Bom Estado.** Possui sanitização, retry logic e tratamento de erros. É um bom candidato a padrão.
*   **`useFilters`:** ⚠️ **Atenção.** Centraliza estado de filtros, mas a lógica de `isReady` baseada em pathname é frágil. Deveria ser baseada em layout ou guards.

### 3.2. Páginas Analíticas (Ex: AnaliticoSupervisor)
*   **Estado Atual:** Funcionais após correções recentes.
*   **Problema:** Lógica de transformação de dados (mapping `sales` -> `value`) está dentro do componente de UI. Deveria estar num `transformer` ou na camada de serviço.

### 3.3. Serviços
*   **`analyticsRpcService.js`:** Tentativa nobre de criar uma camada de abstração, mas atualmente subutilizada ou bypassada pelos hooks diretos.

## 4. OPORTUNIDADES DE MELHORIA (QUICK WINS vs LONG TERM)

| Tipo | Ação | Impacto | Esforço |
|------|------|---------|---------|
| **Quick Win** | Centralizar mapeamento de parâmetros RPC em um único utilitário usado pelo `useAnalyticalData`. | Alto (Manutenibilidade) | Baixo |
| **Quick Win** | Extrair rotas do `App.jsx` para módulos de rota (`routes/crm.jsx`, `routes/analytics.jsx`). | Médio (Org) | Baixo |
| **Long Term** | Migrar base crítica para TypeScript para garantir tipagem dos parâmetros RPC. | Muito Alto (Segurança) | Alto |
| **Long Term** | Implementar Pattern "Repository" para chamadas Supabase, removendo chamadas diretas dos componentes. | Alto (Arquitetura) | Médio |

## 5. RECOMENDAÇÃO TÉCNICA

A refatoração deve seguir o princípio de **"Estrangulamento"**: não reescrever tudo de uma vez.
1.  Isolar o `App.jsx` modularizando rotas.
2.  Padronizar a camada de dados: Fazer `useAnalyticalData` consumir um `AnalyticsRepository` (ou Service) unificado, removendo o acoplamento `p_` dos componentes React.
3.  Aplicar Feature-Based Folders para novos módulos e migrar gradualmente os antigos.