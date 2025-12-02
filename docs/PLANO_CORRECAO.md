# Plano de Correção e Estabilização - Costa Lavos 360

**Data:** 01/12/2025
**Status:** Planejado
**Objetivo:** Corrigir falhas críticas de carregamento de dados ("Nenhum dado encontrado"), estabilizar a navegação da Visão 360 do Cliente e unificar a lógica de rotas.

## 1. Matriz de Prioridades

| ID | Correção | Prioridade | Área Afetada | Complexidade |
|----|----------|------------|--------------|--------------|
| **C01** | Normalização de Datas (Timezone Fix) | 🔴 **Crítica** | Todo o Sistema Analítico | Baixa |
| **C02** | Tratamento de Filtros Vazios | 🔴 **Crítica** | Buscas e Listagens | Baixa |
| **C03** | Remoção de Redirect na Visão 360 | 🟠 **Alta** | Página do Cliente | Média |
| **C04** | Unificação de Rotas de Cliente | 🟠 **Alta** | Navegação Geral | Média |
| **C05** | Tratamento de Erro Gracioso (Hooks) | 🟡 **Média** | UX Geral | Média |
| **C06** | Ajuste Padrão de Período | 🟢 **Baixa** | Dashboard Inicial | Baixa |

---

## 2. Detalhamento das Correções

### C01: Normalização de Datas (Timezone Fix)
*   **Arquivo(s):** `src/lib/utils.js`, `src/hooks/useAnalyticalData.js`
*   **Problema:** O uso de `toISOString().split('T')[0]` converte a data local para UTC. Usuários no Brasil (GMT-3) acessando o sistema após as 21h enviam a data do "dia seguinte" para o banco, resultando em zero vendas encontradas para "hoje".
*   **Solução:** Implementar função `formatDateForAPI(date)` usando `date-fns` que respeite o timezone local ou force a data correta YYYY-MM-DD sem conversão de fuso.
*   **Impacto:** Resolve imediatamente o problema de "Nenhum dado encontrado" em horários noturnos.

### C02: Tratamento de Filtros Vazios (Search Term)
*   **Arquivo(s):** `src/contexts/FilterContext.jsx`, `src/hooks/useAnalyticalData.js`
*   **Problema:** O frontend envia string vazia `""` para filtros opcionais. Algumas RPCs SQL esperam `NULL` para ignorar o filtro, tratando `""` como uma busca literal por nome vazio (que não existe).
*   **Solução:** Sanitizar o objeto de parâmetros antes do envio: `val === '' ? null : val`.
*   **Impacto:** Restaura a exibição de listas completas quando não há termo de busca digitado.

### C03: Remoção de Redirect na Visão 360 (Legado)
*   **Arquivo(s):** `src/pages/dashboard/Visao360ClientePage.jsx`
*   **Problema:** A lógica `setTimeout(() => navigate('/dashboard'), 2000)` é disparada agressivamente se a API demorar ou se o ID tiver um formato diferente do esperado (composto vs simples). Isso expulsa o usuário da página.
*   **Solução:** Remover o `navigate` automático. Substituir por um componente `<ErrorState />` com botão de "Tentar Novamente" e um botão manual de "Voltar".
*   **Impacto:** Permite que o usuário veja o erro e tente corrigir (ex: mudar período) sem ser forçado a sair.

### C04: Unificação de Rotas de Cliente
*   **Arquivo(s):** `src/App.jsx`, `src/components/dashboard/PerformanceRanking.jsx`
*   **Problema:** Existem rotas conflitantes `/cliente/:id` (nova, correta) e `/visao-360-cliente/:id` (antiga, problemática). Componentes diferentes linkam para rotas diferentes.
*   **Solução:**
    1.  Definir `/cliente/:clientId` como a rota oficial.
    2.  Atualizar todos os `navigate` e `Link` para usar a rota oficial.
    3.  Manter a rota antiga apenas como redirect para a nova, ou removê-la se não houver links externos.
*   **Impacto:** Elimina confusão de navegação e garante que todos usem a versão mais moderna da página.

### C05: Tratamento de Erro Gracioso (Hooks)
*   **Arquivo(s):** `src/hooks/useAnalyticalData.js`
*   **Problema:** O hook apenas lança o erro. Se o componente pai não tiver um `ErrorBoundary` ou `try/catch`, a tela "explode" (tela branca).
*   **Solução:** O hook deve retornar `{ error: object, data: null }` em vez de dar throw, permitindo que a UI renderize um estado de erro controlado.
*   **Impacto:** Melhora a resiliência da aplicação. Uma falha num gráfico não derruba a página inteira.

### C06: Ajuste Padrão de Período
*   **Arquivo(s):** `src/contexts/FilterContext.jsx`
*   **Problema:** O padrão `this_month` retorna zero dados no dia 1º do mês até que a primeira venda entre.
*   **Solução:** Alterar padrão inicial para `last_30_days` ou manter `this_month` mas adicionar uma mensagem de UI explicativa quando vazio.
*   **Impacto:** Melhor primeira impressão para o usuário.

---

## 3. Estimativa de Tempo

| Tarefa | Estimativa |
|--------|------------|
| C01 & C02 (Dados Core) | 30 min |
| C03 & C04 (Cliente 360) | 45 min |
| C05 (Refatoração Hook) | 20 min |
| C06 (Configuração) | 5 min |
| Testes Manuais | 20 min |
| **TOTAL Estimado** | **~2 horas** |

---

## 4. Dependências

1.  **C01 (Datas)** deve ser feita **antes** de qualquer teste de página analítica, pois afeta a validação de todas as outras correções.
2.  **C02 (Filtros)** deve ser aplicada globalmente no hook `useAnalyticalData` para evitar correções repetitivas em cada página.
3.  **C04 (Rotas)** depende da estabilização da página destino (C03 ou nova página `Client360.jsx`).

---

## 5. Plano de Testes

### Teste 1: Fuso Horário e Dados
1.  Alterar data do sistema para 22:00.
2.  Abrir Dashboard.
3.  Verificar se vendas do dia ("Hoje") aparecem.
4.  Verificar se o payload da requisição RPC envia a data correta (YYYY-MM-DD) e não o dia seguinte.

### Teste 2: Navegação Cliente 360
1.  Clicar em um cliente no Ranking de Performance.
2.  Verificar se a URL é `/cliente/...` (rota nova).
3.  Verificar se a página carrega sem redirect automático para dashboard.
4.  Testar com um ID inválido na URL: deve mostrar mensagem de erro "Cliente não encontrado", mas manter-se na página.

### Teste 3: Filtros
1.  Abrir Analytics Supervisor.
2.  Garantir que lista carrega completa inicialmente.
3.  Digitar busca "Ana".
4.  Apagar busca (campo vazio).
5.  Lista deve voltar ao estado completo (não ficar vazia/travada).