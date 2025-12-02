# Relatório de Diagnóstico e Correção - AdvancedFilters

## 1. Erro Original
**Mensagem de Erro**: `Cannot read properties of undefined (reading 'map')`
**Localização (aproximada)**: `src/components/AdvancedFilters.jsx`, Linha 50
**Cenário**: Ocorria quando o componente `AdvancedFilters` tentava renderizar um `MultiSelect` para uma categoria de filtro (ex: `supervisor`, `vendedor`) cujas opções (`options.supervisor`, `options.vendedor`, etc.) eram `undefined` ou `null`.

## 2. Causa Raiz

A variável `options` na `AdvancedFilters.jsx` era definida como `const options = availableFilters || filterOptions;`.

-   **`availableFilters`**: Esta prop é opcional e, quando fornecida, deve conter um objeto com as categorias de filtro e suas respectivas listas de opções (ex: `{ supervisor: [{label: 'A', value: 'A'}] }`).
-   **`filterOptions`**: Este é um objeto fallback estático (`src/config/filterOptions.js`) que contém opções de filtro padrão.

**O problema residia em**:
1.  Se `availableFilters` fosse passado como um objeto vazio (`{}`), a lógica `availableFilters || filterOptions` o consideraria `truthy`.
2.  Nesse caso, `options` se tornaria `{}`, e ao acessar `options.supervisor`, `options.vendedor`, etc., o resultado seria `undefined`.
3.  A tentativa de chamar `.map()` em `undefined` (ex: `options.supervisor.map(...)`) causava a exceção.

Ou seja, o componente não estava validando a **estrutura interna** de `availableFilters` antes de tentar acessá-la.

## 3. Fluxo de Dados (Cenário de Falha)

1.  Uma página ou `ModuleTemplate` (ou qualquer pai) renderizava `AdvancedFilters`, por exemplo: `<AdvancedFilters filters={currentFilters} setFilters={updateCurrentFilters} availableFilters={{}} />`.
2.  `AdvancedFilters` recebia `availableFilters = {}`.
3.  Na linha `const options = availableFilters || filterOptions;`, a variável `options` era atribuída a `{}`.
4.  Ao tentar renderizar o `MultiSelect` para Supervisores: