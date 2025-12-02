# Guia de Testes Funcionais e de Performance - Costa Lavos 360

Este documento descreve um conjunto de testes para validar a funcionalidade e o desempenho das principais páginas analíticas da aplicação.

## Sumário

1.  **Testes Gerais e de Ambiente**
2.  **Testes por Página**
    *   Dashboard Comercial
    *   Analítico por Supervisor
    *   Analítico por Vendedor
    *   Analítico por Região
    *   Analítico por Grupo de Clientes
    *   Analítico por Produto
    *   Visão 360 do Cliente
3.  **Testes de Erro Comuns**
4.  **Validação de Console**
5.  **Validação de Performance**

---

## 1. Testes Gerais e de Ambiente

**Objetivo**: Verificar a integridade básica da aplicação e ambiente.

| # | Cenário de Teste           | Passos                                                                                                                                                                                                                                                                                              | Resultado Esperado                                                                                         | Como Validar                                                                                                                                                            |
|---|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Acesso à Aplicação         | Abrir o navegador e acessar a URL da aplicação.                                                                                                                                                                                                                                                     | Tela de login exibida.                                                                                     | UI: Tela de login com campos de usuário/senha e botão "Entrar".                                                                                                         |
| 2 | Login                      | Inserir credenciais válidas e clicar em "Entrar".                                                                                                                                                                                                                                                  | Redirecionamento para o Dashboard.                                                                         | UI: Dashboard principal carregado com dados.                                                                                                                            |
| 3 | Redirecionamento (AuthGuard) | Tentar acessar uma rota protegida (ex: `/dashboard`) sem estar logado.                                                                                                                                                                                                                              | Redirecionamento para a tela de login.                                                                     | UI: Tela de login.                                                                                                                                                      |
| 4 | Responsividade Básica      | Redimensionar a janela do navegador para diferentes tamanhos (desktop, tablet, mobile).                                                                                                                                                                                                             | O layout da sidebar e do conteúdo principal se adapta corretamente, sem cortes ou sobreposições.              | UI: Elementos de layout (sidebar, header, conteúdo) se reorganizam fluidamente.                                                                                       |
| 5 | `formatCurrency`           | Em qualquer card ou tabela que exiba valores monetários, observar a formatação.                                                                                                                                                                                                                     | Valores formatados como moeda brasileira (ex: `R$ 1.234,56`).                                               | UI: Conferir formatação de valores. Inspecionar elemento para confirmar o texto.                                                                                        |
| 6 | `formatDateForAPI` (C01)   | Ajustar o relógio do sistema para 23:00 (11 PM). Acessar o Dashboard.                                                                                                                                                                                                                               | Os dados exibidos no dashboard e nos gráficos refletem a data **local atual**, não o dia seguinte em UTC. | Network Tab: Inspecionar requests RPC, verificar `p_start_date` e `p_end_date` no payload, devem ser `YYYY-MM-DD` da data local atual.                                  |
| 7 | `sanitizeParams` (C02)     | Em qualquer campo de busca (ex: barra de filtros), digitar um termo, depois apagar todo o texto.                                                                                                                                                                                                    | O filtro deve ser removido, e todos os dados devem ser exibidos (como se `p_search_term` fosse `NULL`).  | Network Tab: Inspecionar requests RPC, verificar se `p_search_term` é `null` (ou omitido) no payload quando o campo está vazio.                                        |

---

## 2. Testes por Página

### 2.1 Dashboard Comercial (`/dashboard`)

**Objetivo**: Validar o carregamento correto dos KPIs, gráfico de vendas e rankings.

| # | Cenário de Teste               | Passos                                                                   | Resultado Esperado                                                                                                 | Como Validar                                                                                                                               |
|---|--------------------------------|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Carregamento Inicial           | Acessar `/dashboard`.                                                    | KPIs (Vendas Totais, Ticket Médio, Clientes Ativos, Bonificações) e Gráfico de Evolução Diária de Vendas são exibidos. Rankings visíveis na aba padrão. | UI: Todos os cards e o gráfico de linha populados.                                                                                     |
| 2 | Navegação entre Abas de Ranking | Clicar nas abas "Supervisores", "Vendedores", "Regiões", "Grupos", "Clientes", "Produtos". | O conteúdo da aba selecionada é carregado e exibido, mostrando o ranking correspondente.                                 | UI: A tabela de ranking da aba ativa é exibida, com dados relevantes e formatados.                                                          |
| 3 | Aplicação de Filtros           | Aplicar diferentes filtros (datas, supervisores, vendedores, excluir funcionários). | KPIs e gráficos devem ser atualizados para refletir os filtros.                                                    | UI: Valores nos cards e gráfico mudam. Network Tab: Verificar se os parâmetros dos filtros são enviados nas chamadas RPC.                   |
| 4 | Gráfico de Vendas Diárias      | Observar o gráfico de "Evolução Diária de Vendas".                       | As linhas "Vendas" e "Bonificação" devem ser visíveis e os valores do tooltip devem estar formatados como moeda.   | UI: Cores das linhas corretas (`#2563eb` para Vendas, `#8b5cf6` para Bonificação). Tooltip com `R$`.                                       |

### 2.2 Páginas Analíticas (Supervisor, Vendedor, Região, Grupo de Clientes, Produto)

**Objetivo**: Validar o carregamento correto dos dados agregados e treemaps/gráficos de barras.

| # | Cenário de Teste               | Passos                                                                   | Resultado Esperado                                                                                                 | Como Validar                                                                                                                               |
|---|--------------------------------|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Carregamento Inicial           | Acessar `/analitico-supervisor` (repetir para Vendedor, Região, Grupo de Clientes, Produto). | O treemap/gráfico de barras principal é exibido com os dados agregados da dimensão selecionada. A tabela de detalhamento é populada. | UI: Treemap/Gráfico exibido. Tabela abaixo do gráfico com dados. Console: Sem erros `formatCurrency not defined`.                      |
| 2 | Aplicação de Filtros           | Aplicar diferentes filtros (datas, supervisores, vendedores, excluir funcionários, termo de busca). | O treemap/gráfico e a tabela são atualizados para refletir os filtros.                                            | UI: Dados do gráfico e tabela mudam. Network Tab: Verificar parâmetros RPC (`p_start_date`, `p_end_date`, `p_exclude_employees`, etc.). |
| 3 | Tooltip e Detalhes             | Interagir com os elementos do treemap/gráfico (hover).                   | O tooltip exibe informações detalhadas (nome, vendas, participação, pedidos) com formatação correta.                 | UI: Tooltip aparece e mostra `R$`, `%`.                                                                                                    |

### 2.3 Visão 360 do Cliente (`/cliente/:clientId`)

**Objetivo**: Validar o carregamento do perfil do cliente, KPIs e histórico de vendas sem redirecionamentos indesejados.

| # | Cenário de Teste               | Passos                                                                   | Resultado Esperado                                                                                                 | Como Validar                                                                                                                               |
|---|--------------------------------|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Carregamento com ID Válido     | Acessar `/cliente/1812` (substituir por um `clientId` real).             | Informações do cliente (Nome, Endereço, Vendedor, Supervisor), KPIs (Curva ABC, RFM, Churn, Tendência) e Gráfico de Vendas (12 meses) são exibidos. | UI: Todos os cards e o gráfico populados. Console: Sem erros de acesso/permissão.                                                        |
| 2 | Carregamento com ID Composto   | Acessar `/cliente/1812-1` (se o cliente tiver loja associada).           | Página carrega normalmente, o sistema interpreta `1812` como `Cliente` e `1` como `Loja`.                               | UI: Informações do cliente e analytics são exibidos. Network Tab: `p_client_id` deve ser o código numérico (ex: `1812`).                |
| 3 | Carregamento com Nome de Busca | Acessar `/cliente/lookup?name=NOME_CLIENTE` (substituir por nome real).  | O sistema resolve o nome para o ID do cliente e carrega a página 360, atualizando a URL para `/cliente/:clientId`. | UI: Página 360 do cliente carregada. URL atualizada.                                                                                   |
| 4 | ID Inválido ou Sem Acesso (C04)| Acessar `/cliente/ID_INEXISTENTE` ou um ID para o qual o usuário não tem permissão via RLS. | Uma mensagem de erro (`ErrorState`) é exibida na tela informando "Acesso Negado ou Erro", sem redirecionar para o Dashboard. Botão "Voltar ao Dashboard" visível. | UI: Exibição do `ErrorState`. Botão "Voltar ao Dashboard" funciona. Network Tab: Verificar se a RPC de validação retornou erro de RLS ou não encontrou o cliente. |
| 5 | Gráfico de Histórico de Vendas | Observar o gráfico "Evolução de Vendas (12 Meses)".                     | O gráfico exibe a receita mensal do cliente nos últimos 12 meses. Valores formatados corretamente.                 | UI: Linhas do gráfico visíveis, tooltip formatado.                                                                                         |
| 6 | Abas (Visão Geral/Histórico)   | Navegar entre as abas "Visão Geral" e "Histórico".                      | O conteúdo das abas muda. A aba "Histórico" exibe uma mensagem de funcionalidade futura.                               | UI: Mensagem "Funcionalidade de histórico detalhado será implementada..." visível na aba "Histórico".                                    |

---

## 3. Testes de Erro Comuns

**Objetivo**: Verificar o comportamento da aplicação em cenários de dados ausentes ou inválidos.

| # | Cenário de Teste               | Passos                                                                   | Resultado Esperado                                                                                                 | Como Validar                                                                                                                               |
|---|--------------------------------|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Período Sem Dados              | Aplicar um filtro de data para um período onde se sabe que não há vendas (ex: um futuro distante ou um período muito antigo). | Um `EmptyState` é exibido na tela, informando "Nenhum dado encontrado" ou mensagem similar.                   | UI: `EmptyState` visível. Network Tab: RPCs retornam array vazio ou `null`.                                                              |
| 2 | Falha na Chamada RPC           | Simular uma falha na rede ou no backend (se possível) para uma RPC. (Alternativa: Modificar um parâmetro RPC para ser inválido). | Um `ErrorState` é exibido na tela, informando a falha e um botão de "Tentar Novamente".                      | UI: `ErrorState` visível. Network Tab: Observar a falha da requisição RPC (código 500, 400, etc.). Console: Erro logado.                 |
| 3 | Datas Inválidas no Filtro      | Tentar selecionar um intervalo de datas inválido (ex: `Data Fim < Data Início`).                                            | O seletor de datas deve impedir a seleção inválida ou exibir uma mensagem de erro clara.                        | UI: Mensagem de erro no seletor de datas, ou impossibilidade de selecionar.                                                              |

---

## 4. Validação de Console

**Objetivo**: Garantir que a aplicação está livre de erros de console que possam indicar problemas ocultos.

| # | Cenário de Teste           | Passos                                                                   | Resultado Esperado                                                                                         | Como Validar                                                                                                                             |
|---|----------------------------|--------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Erros JavaScript           | Navegar por todas as páginas analíticas e aplicar diferentes filtros.    | Nenhuma mensagem de erro vermelha no console (`Uncaught TypeError`, `ReferenceError`, etc.).             | Developer Tools (Console): Monitorar o console durante a navegação e interação.                                                          |
| 2 | Warnings e Deprecations    | Navegar por todas as páginas e interagir com os componentes.             | Mínimo ou nenhuma mensagem de aviso (`Warning`) ou de `Deprecation` no console.                             | Developer Tools (Console): Verificar a presença de `Warnings`.                                                                           |
| 3 | Erros de RPC               | Monitorar o console durante as interações que disparam RPCs.             | Mensagens de erro de RPC devem ser tratadas e logadas de forma controlada, sem quebrar a aplicação.       | Developer Tools (Console): `console.error` ou `console.warn` para falhas de RPC devem ser informativas.                                |

---

## 5. Validação de Performance

**Objetivo**: Assegurar que as páginas analíticas carregam e respondem rapidamente.

| # | Cenário de Teste               | Passos                                                                   | Resultado Esperado                                                                                                 | Como Validar                                                                                                                               |
|---|--------------------------------|--------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| 1 | Tempo de Carregamento Inicial  | Abrir uma página analítica (`/dashboard`, `/analitico-supervisor`, etc.) em aba anônima. | Conteúdo principal (KPIs, Gráficos) carregado em até **3 segundos** para dashboards mais simples, **5-8 segundos** para os mais complexos. | Developer Tools (Network Tab): Observar o tempo `DOMContentLoaded` e `Load` da página. Inspecionar o tempo de resposta das chamadas RPC. |
| 2 | Resposta a Filtros             | Aplicar um filtro de data complexo (ex: "Últimos 90 dias") ou múltiplos filtros. | A atualização dos dados na tela deve ocorrer em até **2-5 segundos**.                                            | Developer Tools (Network Tab): Monitorar o tempo de resposta das chamadas RPC disparadas pelos filtros.                                |
| 3 | Tempo de Inatividade (C01)     | Acessar o Dashboard em um horário noturno (ex: 22h local).                | Carregamento normal dos dados sem atrasos devido à correção do timezone.                                          | UI: Dashboard carrega rapidamente. Network Tab: Nenhuma requisição RPC com erro de data ou timeout.                                      |
| 4 | Sem Timeouts de RPC            | Realizar ações que disparam RPCs em sequência (ex: mudar abas de ranking rapidamente). | Nenhuma chamada RPC deve falhar por `timeout`.                                                                     | Developer Tools (Network Tab): Verificar o status de todas as requisições RPC.                                                          |