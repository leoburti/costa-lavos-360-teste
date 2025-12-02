# Arquitetura Analytics - Hierarquia, Roteamento e Fallback de Dados

## 1. Visão Geral

A arquitetura de Analytics foi fundamentalmente redesenhada para oferecer maior flexibilidade, escalabilidade e manutenibilidade. O novo sistema é centrado em **metadados puros** que descrevem cada página de analytics, permitindo um **roteamento dinâmico** e o **carregamento lazy-load de componentes**. Isso garante que apenas o código necessário seja carregado, otimizando o desempenho. Além disso, foi implementado um robusto **mecanismo de fallback para dados simulados (mock data)**, assegurando que o layout das páginas sempre renderize, mesmo em caso de falha na obtenção de dados reais ou ausência dos mesmos no banco de dados.

## 2. Estrutura de Dados: `src/config/analyticsMenuStructure.js`

Este arquivo é o coração da nova arquitetura. Ele contém um array de objetos JSON que descrevem cada página analítica. Cada objeto define:

*   **`id`**: Identificador único da página (string).
*   **`label`**: Título exibido no menu e cabeçalhos (string).
*   **`path`**: O slug da URL (`/analytics/:path`) (string).
*   **`icon`**: Nome do ícone da biblioteca Lucide React (string).
*   **`group`**: O grupo principal ao qual a página pertence (e.g., "Dashboard", "Análises") (string).
*   **`subgroup`**: (Opcional) Um subgrupo dentro de um grupo, para hierarquia mais profunda (string).
*   **`rpc`**: O nome da função Supabase RPC a ser chamada para buscar os dados desta página (string).
*   **`mockData`**: Um objeto ou array JSON com dados simulados. Este será usado como fallback automático.
*   **`description`**: (Opcional) Uma breve descrição da página.

Atualmente, a estrutura suporta aproximadamente **15 páginas únicas**, organizadas em **3 grupos principais** (Dashboard, Análises, Relatórios) e **3 subgrupos** dentro de "Relatórios" (Financeiro, Desempenho, Operacional).

## 3. Fluxo de Dados: RPC → Validação → Mock Fallback → Componente

O fluxo de obtenção e apresentação de dados é agora altamente resiliente:

1.  **Chamada RPC**: O `useAnalyticsData` hook tenta chamar a função Supabase RPC especificada no `analyticsMenuStructure.js` usando os filtros globais (`FilterContext`) e parâmetros específicos da página.
2.  **Validação de Dados**: Após receber uma resposta do RPC, o hook realiza uma validação rigorosa:
    *   Verifica se o resultado é `null` ou `undefined`.
    *   Verifica se é um array vazio (`[]`).
    *   Verifica, de forma recursiva, se todos os valores numéricos dentro do objeto/array resultam em `0` (indicando dados "zerados" ou sem conteúdo relevante).
3.  **Fallback Automático (Mock Data)**:
    *   Se a chamada RPC falhar (erro de rede, erro no banco, timeout) OU se os dados retornados forem considerados "vazios/zerados" pela validação, o sistema aciona o fallback.
    *   Os `mockData` definidos no `analyticsMenuStructure.js` para aquela página específica são automaticamente usados.
    *   Um `console.warn` é logado indicando que o fallback foi acionado, e a flag `isMock` é definida como `true`, permitindo que os componentes exibam um aviso visual ao usuário.
4.  **Renderização do Componente**: O componente da página recebe os `data` (sejam reais ou mock), `loading`, `error` e `isMock` para renderizar a UI apropriadamente.

Este fluxo garante que o usuário sempre veja uma interface funcional, mesmo que os dados reais estejam indisponíveis, melhorando significativamente a experiência do usuário e a robustez da aplicação.

## 4. Roteamento: `/analytics/:page` + Aliases

### Rota Dinâmica
A rota principal para todas as páginas de analytics é agora dinâmica: `/analytics/:page`. Isso centraliza a lógica de carregamento e gestão de estado em um único componente, `AnalyticsPageRouter.jsx`.

Exemplo:
*   `/analytics/dashboard-gerencial`
*   `/analytics/analise-churn`
*   `/analytics/relatorio-financeiro-margem`

### Aliases (Compatibilidade com Rotas Antigas)
Para manter a compatibilidade com quaisquer links ou marcadores de páginas existentes que utilizavam rotas antigas (e.g., `/gerencial`), foram implementados **aliases de navegação** no `src/App.jsx`. Estas rotas antigas agora redirecionam internamente para suas respectivas novas rotas dinâmicas com `<Navigate to="/analytics/:page" replace />`.

Exemplos de Aliases:
*   `/gerencial` → `/analytics/dashboard-gerencial`
*   `/visao-360-cliente` → `/analytics/visao-360-cliente`
*   `/analitico-supervisor` → `/analytics/analitico-supervisor`
*   `/calculo-rfm` → `/analytics/analise-rfm`
*   `/analise-abc-produtos` → `/analytics/analise-abc-produtos`
*   `/relatorio-financeiro-lucro` → `/analytics/relatorio-financeiro-lucratividade`

## 5. Hierarquia de Menu (Analytics)

A nova estrutura de menu no `SidebarMenu.jsx` é construída dinamicamente a partir do `analyticsMenuStructure.js`.

**Grupos e Páginas:**

*   **Dashboard (4 páginas)**
    *   Dashboard Gerencial
    *   Visão 360° Cliente
    *   Analítico Supervisor
    *   Analítico Vendedor
    *   Analítico Região
    *   Analítico Grupos
    *   Analítico Produtos
    *   Vendas Diárias
*   **Análises (8 páginas)**
    *   Análise Churn
    *   Análise RFM
    *   Curva ABC Produtos
    *   Curva ABC Clientes
    *   Sazonalidade
    *   Margem & Lucro
    *   Ticket Médio
    *   Análise Preditiva
*   **Relatórios (3 subgrupos, 7 páginas)**
    *   **Financeiro**
        *   Receita
        *   Margem
        *   Lucratividade
    *   **Desempenho**
        *   Metas
        *   Ranking
    *   **Operacional**
        *   SLA
        *   Sazonalidade Op.
        *   Ticket Médio Op.

## 6. Componentes Principais

*   **`src/components/SidebarMenu.jsx`**: Responsável pela renderização dinâmica da navegação lateral. Ele agora processa o `analyticsMenuStructure.js` para criar a hierarquia de grupos, subgrupos e itens de menu, incluindo a conversão de strings de ícones para componentes Lucide React.
*   **`src/components/analytics/AnalyticsPageRouter.jsx`**: O componente central do roteamento dinâmico. Ele lê o parâmetro `:page` da URL, busca a configuração correspondente em `analyticsMenuStructure.js`, lazy-loadeia o componente da página real, e injeta os dados (`data`, `loading`, `error`, `isMock`) obtidos pelo `useAnalyticsPage` hook.
*   **`src/components/analytics/AnalyticsTemplate.jsx`**: Um layout padrão para todas as páginas de analytics, garantindo consistência visual. Inclui cabeçalho, breadcrumbs, botões de ação (atualizar, exportar) e exibe o status `isMock` quando o fallback é ativo.

## 7. Hooks Essenciais

*   **`src/hooks/useAnalyticsData.js`**: Este hook é o motor de busca de dados com resiliência. Ele se integra ao `FilterContext` para aplicar filtros globais automaticamente, chama funções RPC do Supabase, valida os dados retornados e, em caso de falha ou dados vazios/zerados, retorna o `mockData` configurado. Inclui também uma função `retry()`.
*   **`src/hooks/useAnalyticsPage.js`**: Hook de conveniência que recebe o `pageSlug`, encontra a configuração correspondente no `analyticsMenuStructure.js` e utiliza `useAnalyticsData` para buscar os dados, retornando `config`, `data`, `loading`, `error`, `refetch`, e `isMock`.

## 8. Segurança: RLS Ativo

A segurança dos dados sensíveis (vendas, financeiro, clientes) é garantida pelo **Row-Level Security (RLS)** do Supabase, configurado no banco de dados. Este sistema de permissões assegura que cada usuário só possa acessar os dados aos quais tem direito, mesmo ao chamar funções RPC.

## 9. Performance: Lazy Loading, Suspense e Memoization

A arquitetura foi projetada com a performance em mente:

*   **Lazy Loading (`React.lazy`, `Suspense`)**: Os componentes de cada página analítica são carregados sob demanda, reduzindo o bundle inicial da aplicação.
*   **Memoization (`React.memo`, `useMemo`, `useCallback`)**: Componentes do `SidebarMenu` e algumas partes da lógica de dados são memoizados para evitar re-renderizações desnecessárias.
*   **Filtragem e RPC Otimizada**: A aplicação de filtros ocorre antes da chamada RPC, e as funções RPC são otimizadas para o banco de dados.

## 10. Testes: Checklist de Validação

Para garantir a estabilidade do sistema, o seguinte checklist deve ser validado:

1.  **Navegação Correta**: Abrir todas as rotas antigas (`/gerencial`, `/calculo-rfm`, etc.) e verificar se elas redirecionam corretamente para `/analytics/:page`.
2.  **Renderização de Páginas**: Acessar todas as `/analytics/:page` (via menu ou diretamente) e verificar se o componente correto é carregado e renderizado.
3.  **Carregamento de Dados (Real)**: Com dados reais disponíveis no Supabase, verificar se as páginas exibem os dados corretamente e se o `isMock` é `false`.
4.  **Fallback de Dados (Mock)**:
    *   Simular uma falha de RPC (e.g., renomeando a função RPC no Supabase).
    *   Verificar se a página exibe os `mockData` e a `Badge` de "Modo Simulação".
    *   Verificar o console para o `console.warn` de fallback.
5.  **Dados Vazios/Zerados**: Se a RPC retornar `[]`, `null`, ou um objeto/array onde todos os valores numéricos são 0, verificar se o `mockData` é usado e o aviso de `isMock` aparece.
6.  **Menu Lateral Dinâmico**: Verificar se o `SidebarMenu` exibe a hierarquia completa de grupos, subgrupos e páginas de Analytics, e se os ícones estão corretos.
7.  **Filtros Globais**: Aplicar filtros no Header (Período, Supervisores, Vendedores, etc.) e verificar se os dados em todas as páginas analíticas são atualizados.
8.  **Performance da UI**: Observar se o lazy loading e as transições de página são suaves.
9.  **Console de Erros**: Verificar o console do navegador para garantir que não há erros de `TypeError: Component is invalid` ou falhas de carregamento.

## 11. Troubleshooting Comum

*   **Erro "type is invalid" no console (`SidebarMenu`)**:
    *   **Causa**: Geralmente indica que um `item.icon` (string) não foi corretamente mapeado para um componente Lucide React no `getIcon` do `utils/iconMap.js`.
    *   **Solução**: Verifique se o nome do ícone em `analyticsMenuStructure.js` corresponde exatamente ao nome esperado por `getIcon` e se `getIcon` está funcionando corretamente.
*   **Página não carrega dados ou sempre mostra mock, mas Supabase está ok**:
    *   **Causa**: A validação `isEmptyOrZero` em `useAnalyticsData.js` pode estar considerando os dados reais como "vazios" ou "zerados".
    *   **Solução**: Adicione `console.log` dentro de `isEmptyOrZero` para inspecionar a estrutura dos dados retornados pelo RPC e ajuste a lógica de validação se necessário.
*   **Páginas antigas (`/gerencial`, `/curva-abc`) resultam em 404**:
    *   **Causa**: O alias de redirecionamento correspondente não foi configurado ou está incorreto no `src/App.jsx`.
    *   **Solução**: Verifique o `App.jsx` e garanta que todas as rotas antigas tenham um `<Route path="/antiga" element={<Navigate to="/nova" replace />} />` correto.

## 12. Exemplo: Como Adicionar uma Nova Página de Analytics

Para adicionar uma nova página ao sistema de Analytics, siga estes passos:

1.  **Crie o Componente da Página**:
    *   Crie um novo arquivo JSX para a página, por exemplo, `src/pages/analytics/MinhaNovaAnalise.jsx`.
    *   Use `AnalyticsTemplate` para o layout padrão.
    *   Dentro do componente, utilize `useAnalyticsPage` para obter os dados.