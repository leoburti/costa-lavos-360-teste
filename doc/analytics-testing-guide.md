# Guia de Testes Manuais - Analytics 2.0

## Objetivo
Validar a estabilidade e correção das páginas de Analytics após a refatoração.

## Pré-requisitos
- Acesso ao ambiente de Staging/Dev.
- Usuário com permissão de visualização de dados.

## Casos de Teste

### 1. Renderização Básica e Tratamento de Erros
**Passos:**
1. Acesse `/dashboard`.
2. Verifique se os KPIs carregam sem o erro "Objects are not valid".
3. Verifique se os gráficos renderizam corretamente.
4. **Simulação de Erro:** Desconecte a internet ou force um erro no console. Verifique se o `ErrorState` aparece com botão de "Tentar Novamente".

### 2. Navegação e Filtros
**Passos:**
1. Navegue pelo menu lateral para `/analitico-vendedor`.
2. Altere o filtro de data para "Últimos 90 dias".
3. Verifique se os dados atualizam (loading state -> novos dados).

### 3. Fallback para Mocks
**Passos:**
1. Em `src/hooks/useAnalyticsData.js`, force `mockFallback = true`.
2. Recarregue a página.
3. Verifique se os dados mockados são exibidos corretamente nos KPIs e Gráficos.

### 4. Validação de Dados Primitivos
**Passos:**
1. Verifique se valores nulos ou undefined aparecem como "-" ou "0" e não quebram a tela.
2. Verifique se objetos complexos não estão sendo renderizados diretamente em células de tabela.

## Checklist de Páginas Críticas
- [ ] Dashboard Principal
- [ ] Visão 360
- [ ] Analítico Vendedor
- [ ] Curva ABC
- [ ] Churn Analysis