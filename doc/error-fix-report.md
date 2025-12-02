# Relatório de Correção de Erro: "Objects are not valid as a React child"

## Descrição do Problema
O erro `Error: Objects are not valid as a React child (found: object with keys {type, value})` ocorria intermitentemente em várias páginas de dashboard. Isso impedia a renderização completa da aplicação, causando uma "Tela Branca da Morte" (WSOD).

## Causa Raiz
A causa foi identificada como a tentativa de renderizar objetos JavaScript diretamente dentro de componentes JSX (ex: `<div>{objeto}</div>`). O React só aceita strings, números ou elementos React como filhos.
Os dados vindos da API (Supabase RPC) muitas vezes continham estruturas aninhadas ou metadados (ex: `{ value: 100, type: 'currency' }`) que não eram tratados antes da renderização.

## Solução Implementada
1. **Sanitização de Dados (`dataValidator.js`):** Criamos funções utilitárias (`extractValue`, `formatCellValue`) que inspecionam recursivamente os dados antes de serem passados para os componentes de UI. Se um objeto for encontrado, a função tenta extrair uma propriedade legível (`value`, `name`, `label`) ou retorna um fallback seguro.
2. **Componentes Robustos (`KPIGrid`, `AnalyticsWidgets`):** Atualizamos os componentes de visualização para usar essas funções de validação obrigatoriamente.
3. **ErrorBoundary Global:** Implementamos barreiras de erro para que, se um componente falhar, apenas aquele widget mostre erro, sem quebrar a página inteira.

## Resultado
O erro foi eliminado. A aplicação agora é resiliente a formatos de dados inesperados da API.