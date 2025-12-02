# Guia Completo de Testes - Analytics Hierarquia e Dados

Este documento descreve um guia completo para testar a nova estrutura de páginas e o tratamento de dados do módulo Analytics. O objetivo é garantir que todas as funcionalidades estejam operacionais, que a navegação seja intuitiva e que os dados sejam apresentados de forma consistente, com os devidos fallbacks.

## 1. Teste 1 - Menu e Navegação

**Objetivo:** Validar a estrutura hierárquica do menu lateral e a correta expansão/colapso dos grupos.

**Passos:**
a) Abrir a aplicação no navegador.
b) No menu lateral, verificar se os grupos principais do Analytics (`Dashboard`, `Análises`, `Relatórios`) são exibidos.
c) Clicar no grupo `Dashboard`.
    - **Resultado Esperado:** O grupo deve expandir, revelando as 8 páginas listadas em `analyticsMenuStructure.js` para este grupo (ex: `Dashboard Gerencial`, `Visão 360° Cliente`, `Analítico Supervisor`, etc.).
d) Clicar no grupo `Análises`.
    - **Resultado Esperado:** O grupo deve expandir, revelando as 8 páginas listadas em `analyticsMenuStructure.js` para este grupo (ex: `Análise Churn`, `Análise RFM`, `Análise ABC Produtos`, etc.).
e) Clicar no grupo `Relatórios`.
    - **Resultado Esperado:** O grupo deve expandir, revelando os 3 subgrupos (`Relatório Financeiro`, `Relatório Desempenho`, `Relatório Operacional`).
f) Clicar no subgrupo "Relatório Financeiro" dentro de `Relatórios`.
    - **Resultado Esperado:** O subgrupo deve expandir, revelando suas 3 páginas (`Receita`, `Margem`, `Lucratividade`).
g) Navegar para qualquer página (ex: `Dashboard Gerencial`).
    - **Resultado Esperado:** O item da página ativa no menu lateral deve estar visualmente destacado.

## 2. Teste 2 - Rotas Antigas (Compatibilidade)

**Objetivo:** Garantir que as rotas antigas do módulo Analytics continuam funcionando e redirecionam corretamente para a nova estrutura dinâmica.

**Passos:**
a) Abrir o navegador e acessar diretamente as seguintes URLs:
    - `/gerencial`
    - `/visao-360-cliente`
    - `/analitico-supervisor`
    - `/analitico-vendedor`
    - `/analitico-regiao`
    - `/analitico-grupo-clientes`
    - `/analitico-produto`
    - `/analitico-vendas-diarias`
    - `/analise-churn`
    - `/calculo-rfm`
    - `/analise-abc-produtos`
    - `/analise-abc-clientes`
    - `/analise-sazonalidade`
    - `/analise-margem-lucro`
    - `/analise-ticket-medio`
    - `/analise-preditiva`
    - `/relatorio-financeiro-receita`
    - `/relatorio-financeiro-margem`
    - `/relatorio-financeiro-lucratividade`
    - `/relatorio-desempenho-meta`
    - `/relatorio-desempenho-ranking`
    - `/relatorio-operacional-sla`
b) Para cada URL, verificar a renderização.
    - **Resultado Esperado:** Cada URL deve carregar a página Analytics correspondente corretamente (ex: `/gerencial` deve mostrar `Dashboard Gerencial`). A URL no navegador pode ser atualizada para o formato `/analytics/:page`, mas a página deve renderizar sem erro.
c) Tentar acessar qualquer uma das URLs listadas acima.
    - **Resultado Esperado:** Nenhuma rota deve retornar uma página 404.

## 3. Teste 3 - Rotas Novas (Dinâmicas)

**Objetivo:** Validar o funcionamento das novas rotas dinâmicas `/analytics/:page` para todas as páginas do módulo.

**Passos:**
a) Abrir o navegador e acessar diretamente as seguintes URLs (usando o `path` de cada item em `analyticsMenuStructure.js`):
    - `/analytics/dashboard-gerencial`
    - `/analytics/visao-360-cliente`
    - `/analytics/analitico-supervisor`
    - `/analytics/analitico-vendedor`
    - `/analytics/analitico-regiao`
    - `/analytics/analitico-grupo-clientes`
    - `/analytics/analitico-produto`
    - `/analytics/analitico-vendas-diarias`
    - `/analytics/analise-churn`
    - `/analytics/analise-rfm`
    - `/analytics/analise-abc-produtos`
    - `/analytics/analise-abc-clientes`
    - `/analytics/analise-sazonalidade`
    - `/analytics/analise-margem-lucro`
    - `/analytics/analise-ticket-medio`
    - `/analytics/analise-preditiva`
    - `/analytics/relatorio-financeiro-receita`
    - `/analytics/relatorio-financeiro-margem`
    - `/analytics/relatorio-financeiro-lucratividade`
    - `/analytics/relatorio-desempenho-meta`
    - `/analytics/relatorio-desempenho-ranking`
    - `/analytics/relatorio-operacional-sla`
b) Para cada URL, verificar a renderização.
    - **Resultado Esperado:** Cada URL deve carregar a página Analytics correspondente corretamente.
c) Tentar acessar qualquer uma das URLs listadas acima.
    - **Resultado Esperado:** Nenhuma rota deve retornar uma página 404.

## 4. Teste 4 - Dados Reais vs Mock

**Objetivo:** Verificar se os dados são carregados corretamente (sejam reais ou mock) e se o indicador de "Modo Simulação" funciona.

**Passos:**
a) Acessar a página `/analytics/dashboard-gerencial`.
b) Observar os KPIs e gráficos.
    - **Resultado Esperado:**
        - Se o banco de dados tem dados reais: Os valores dos KPIs e gráficos devem ser > 0 e a badge "Modo Simulação" **não deve** aparecer.
        - Se o banco de dados não tem dados reais ou a RPC falha: Os valores dos KPIs e gráficos devem ser dados realistas gerados por mock, e uma badge "Modo Simulação" **deve** aparecer no cabeçalho da página.
c) Abrir o console do DevTools (F12) e procurar por logs com `[Analytics] Data is empty for... Switching to Mock Data.` ou `[Analytics] Generating realistic mock data for...`.
    - **Resultado Esperado:** Esses logs devem aparecer quando a aplicação estiver usando dados mock.
d) Repetir os passos a) a c) para **todas as 15 páginas** listadas no Teste 3.
    - **Resultado Esperado:** Todas as páginas devem exibir dados (reais ou mock) sem erros, e o badge "Modo Simulação" deve indicar corretamente quando dados mock estão em uso.

## 5. Teste 5 - Erro 404

**Objetivo:** Assegurar que rotas inexistentes são tratadas com uma página 404 adequada.

**Passos:**
a) Abrir o navegador e acessar uma URL que certamente não existe, por exemplo: `/rota-inexistente-totalmente-falsa`.
    - **Resultado Esperado:** A aplicação deve renderizar a `NotFoundPage` (página 404).
b) Na página 404, verificar os elementos presentes.
    - **Resultado Esperado:** Deve haver um link ou botão claro para "Voltar ao Dashboard" ou "Ir para a Home", e uma mensagem que indique que a página não foi encontrada.

## 6. Teste 6 - Performance

**Objetivo:** Avaliar o desempenho de carregamento e interação das páginas Analytics.

**Passos:**
a) Abrir a aplicação e navegar para `/analytics/dashboard-gerencial`.
b) Abrir a aba "Performance" do DevTools (F12) do navegador.
c) Gravar um perfil de performance enquanto interage com a página:
    - Carregar a página.
    - Clicar em um filtro na `FilterBar` (ex: mudar o período).
    - Se o menu lateral tiver grupos colapsáveis, expandir e colapsar alguns.
d) Analisar o perfil gravado.
    - **Resultado Esperado:**
        - `First Contentful Paint` (FCP) deve ser preferencialmente < 1 segundo para carregamentos iniciais.
        - Não deve haver "Long Tasks" que bloqueiem o thread principal por mais de 50ms durante as interações.
        - Não deve haver erros de renderização ou warnings excessivos no console durante a interação.

## 7. Teste 7 - Responsividade

**Objetivo:** Verificar se as páginas do módulo Analytics se adaptam bem a diferentes tamanhos de tela.

**Passos:**
a) Abrir a aplicação e navegar para `/analytics/dashboard-gerencial`.
b) Abrir o DevTools (F12) e ativar o "Device Toolbar" (ícone de celular/tablet).
c) Simular dispositivos móveis comuns (ex: iPhone SE - 320px de largura, iPad Mini - 768px de largura).
    - **Resultado Esperado:**
        - O menu lateral deve se tornar colapsável (escondido por padrão ou acessível por um botão "hamburguer").
        - O conteúdo principal da página (`AnalyticsTemplate`) deve se reajustar adequadamente (elementos se empilham verticalmente, texto se ajusta, etc.).
        - Tabelas com muitos dados devem apresentar scroll horizontal para evitar quebra de layout.
        - Gráficos (`AnalyticsChart`, `KPIGrid`) devem se adaptar ao espaço disponível, mantendo a legibilidade.

## 8. Teste 8 - Acessibilidade

**Objetivo:** Garantir que o módulo Analytics seja acessível para usuários com deficiência.

**Passos:**
a) Abrir a aplicação e navegar para `/analytics/dashboard-gerencial`.
b) Abrir a aba "Accessibility" do DevTools (F12) e verificar por problemas de contraste ou estrutura.
    - **Resultado Esperado:** Não devem haver erros críticos de contraste de cores que dificultem a leitura para usuários com baixa visão.
c) Testar a navegação utilizando apenas o teclado:
    - Usar a tecla `Tab` para navegar por todos os elementos interativos (links, botões, campos de filtro).
    - Usar `Enter` ou `Espaço` para ativar botões, links e abrir menus colapsáveis.
    - **Resultado Esperado:** Todos os elementos interativos devem ser focáveis via `Tab`, e sua funcionalidade deve ser acionável via teclado. O foco deve ser visualmente claro.
d) Testar com um leitor de tela (ex: NVDA ou JAWS):
    - Ativar o leitor de tela e navegar pelas páginas.
    - **Resultado Esperado:** Elementos importantes (títulos, descrições, rótulos de formulário, itens de menu) devem ser lidos de forma significativa. Imagens e ícones devem ter atributos `alt` ou `aria-label` apropriados quando necessário.

## 9. Resultado Esperado

Ao final de todos os testes, o módulo Analytics deve cumprir os seguintes critérios:

-   **Todos os testes passam** ✅: Não devem haver falhas ou comportamentos inesperados.
-   **Nenhuma rota retorna 404** (exceto rotas inexistentes intencionalmente testadas): Todas as páginas configuradas devem ser acessíveis.
-   **Dados visíveis em todas as páginas**: Seja com dados reais do Supabase ou com dados mock de fallback, todas as visualizações (KPIs, gráficos, tabelas) devem estar preenchidas e coerentes.
-   **Menu intuitivo e responsivo**: A navegação deve ser clara e funcional em todas as resoluções de tela.
-   **Conformidade básica com acessibilidade**: As páginas devem ser utilizáveis por teclado e compreensíveis por leitores de tela.