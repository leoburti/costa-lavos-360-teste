# Checklist de Validação: Correção do Erro "Objects are not valid as a React child"

**Data:** 01/12/2025
**Objetivo:** Garantir que a aplicação não quebre ao tentar renderizar objetos diretamente no JSX.

## 1. Validação Pós-Correção (Geral)

*   [ ] **Rota Principal:** Abrir a rota `/` (Home) e verificar se a página carrega completamente sem a tela branca de erro ("White Screen of Death").
*   [ ] **Console do Navegador:** Abrir o DevTools (F12) -> Console.
    *   [ ] Verificar a ausência da mensagem: `Uncaught Error: Objects are not valid as a React child`.
    *   [ ] Verificar se há logs estruturados do `ErrorBoundary` (caso algum erro residual persista, ele deve ser capturado e logado, não quebrar a app).
*   [ ] **React DevTools:**
    *   [ ] Inspecionar componentes críticos (`SidebarMenu`, `AnalyticsKPI`).
    *   [ ] Verificar se as props que antes recebiam objetos (ex: `badge`, `value`) agora estão sendo tratadas antes da renderização.
*   [ ] **Sidemenu Badges:**
    *   [ ] Verificar se os badges (números vermelhos no menu) aparecem como texto simples (ex: "360").
    *   [ ] Confirmar que não está tentando renderizar `{ type: 'count', value: '360' }` visualmente.
*   [ ] **Analytics KPIs:**
    *   [ ] Verificar se os valores dos KPIs são números ou strings formatadas (ex: "R$ 1.000,00").
    *   [ ] Confirmar que estruturas como `{ value: 1000, trend: 'up' }` não estão sendo passadas diretamente para o nó de texto do JSX.
*   [ ] **Tabelas (`AnalyticsTable`):**
    *   [ ] Verificar se todas as células contêm texto ou elementos React válidos.
    *   [ ] Confirmar que colunas que podem vir como JSON do banco (ex: `client_info`, `metadata`) estão sendo passadas pelo `formatCellValue` ou `extractValue`.
*   [ ] **Gráficos (`Recharts`):**
    *   [ ] Verificar se os gráficos renderizam corretamente.
    *   [ ] Confirmar que as `props` passadas para `dataKey` apontam para valores primitivos no array de dados.
*   [ ] **Tooltips:**
    *   [ ] Passar o mouse sobre gráficos e badges.
    *   [ ] Verificar se o conteúdo do tooltip é uma string legível (ex: "Crescimento: 15%") e não `[object Object]`.

## 2. Testes por Rota Específica

*   [ ] **`/` (Home/Dashboard):**
    *   [ ] Renderização inicial.
    *   [ ] Carregamento dos widgets principais.
*   [ ] **`/gerencial` (ou Dashboard Gerencial):**
    *   [ ] Verificar KPIGrid.
*   [ ] **`/relatorio-desempenho-ranking`:**
    *   [ ] Verificar renderização da tabela de ranking.
    *   [ ] Testar paginação/scroll (garantir que novos dados carregados também sejam sanitizados).
*   [ ] **`/analise-abc-produtos` (Curva ABC):**
    *   [ ] Verificar renderização do Treemap.
    *   [ ] Verificar tooltips do Treemap.
*   [ ] **`/visao-360-cliente`:**
    *   [ ] Buscar um cliente.
    *   [ ] Verificar se os dados detalhados (que vêm de objetos complexos) aparecem corretamente nos cards.

## 3. Testes por Componente (Isolado)

*   [ ] **`SidebarMenu`:**
    *   [ ] Badge deve ser string.
*   [ ] **`KPIGrid`:**
    *   [ ] `value` e `trendValue` devem ser renderizados após extração.
*   [ ] **`DataExplorer` / `AnalyticsTable`:**
    *   [ ] Células da tabela devem ser primitivos.
*   [ ] **`ChartContainer` / `AnalyticsChart`:**
    *   [ ] Dados passados para o Recharts devem estar limpos.
*   [ ] **`TreemapExplorer`:**
    *   [ ] `name` e `size` (ou `value`) devem ser válidos.

## 4. Testes de Validação de Dados (Unitários/Manuais)

Executar no console do navegador para teste rápido:

*   [ ] `dataValidator.extractValue({type: 'count', value: 360})` -> Deve retornar `360`.
*   [ ] `dataValidator.formatCellValue({name: 'João'})` -> Deve retornar `'João'` (ou fallback se não tiver name/label/value).
*   [ ] `dataValidator.isValidPrimitive(360)` -> Deve retornar `true`.
*   [ ] `dataValidator.isValidPrimitive({value: 360})` -> Deve retornar `false`.

## 5. Testes de Error Boundary

*   [ ] **Simulação:** (Opcional) Forçar um erro em um componente filho (ex: lançar erro no render).
*   [ ] **Captura:** Verificar se o componente é substituído pela UI de fallback ("Algo deu errado").
*   [ ] **Isolamento:** Verificar se o restante da página continua funcionando.
*   [ ] **Log:** Verificar se o erro detalhado aparece no console com a tag `[ErrorBoundary]`.

## 6. Performance

*   [ ] **DevTools Performance:** Gravar interação de abertura de página.
*   [ ] **Renderização:** Verificar se não há "re-renders" excessivos causados por erros ou tentativas falhas de renderização.
*   [ ] **FCP:** First Contentful Paint deve ser rápido (< 1.5s em ambiente local).

## 7. Acessibilidade

*   [ ] **Contraste:** Verificar legibilidade dos textos (especialmente badges e tooltips).
*   [ ] **Labels:** Verificar se os valores extraídos fazem sentido semanticamente (ex: não mostrar "undefined" ou "null").
*   [ ] **Navegação:** Testar tabulação pelo menu lateral.

## 8. Resultado Esperado

*   **Status:** ✅ Aprovado
*   **Critério de Sucesso:** Navegar por todas as rotas listadas no menu sem encontrar a tela branca de erro de React e sem erros vermelhos no console relacionados a tipos de filhos inválidos.