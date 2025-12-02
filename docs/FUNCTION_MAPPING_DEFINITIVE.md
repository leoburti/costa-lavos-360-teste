# Mapeamento Definitivo de Funções por Página

## Princípio Fundamental

**CADA PÁGINA TEM SUA PRÓPRIA FUNÇÃO COM NOME ESPECÍFICO E CLARO**

Isso garante que:
- ✅ Mudanças em uma página NÃO afetam outra
- ✅ Impossível confundir qual função usar
- ✅ Fácil manutenção e debug
- ✅ Documentação automática no nome da função

## Funções Disponíveis (Atualizado 2025-11-30)

### 1. get_regional_sales_treemap
- **Página:** Analítico por Região (`/analitico-regiao`)
- **Propósito:** Análise de vendas por região
- **Hierarquia de Dados:** Região → Supervisor → Vendedor
- **Tabela Fonte:** `bd-cl`
- **Retorna:** Array de objetos `{ name: string, size: number }`

### 2. get_customer_group_sales_treemap
- **Página:** Analítico por Grupo de Clientes (`/analitico-grupo-clientes`)
- **Propósito:** Análise de vendas por grupo de clientes
- **Hierarquia de Dados:** Grupo de Clientes → Supervisor → Vendedor
- **Tabela Fonte:** `bd-cl`
- **Retorna:** Array de objetos `{ name: string, size: number }`

### 3. get_supervisor_sales_treemap (NOVA)
- **Página:** Analítico Supervisor (`/analitico-supervisor`)
- **Propósito:** Análise de vendas por supervisor
- **Hierarquia de Dados:** Supervisor → (Agregado)
- **Tabela Fonte:** `bd-cl`
- **Retorna:** Array de objetos `{ name: string, value: number, parent: string, fill: string }`

### 4. get_sales_explorer_treemap
- **Página:** Explorador de Vendas (`/explorador-vendas`) e componentes genéricos
- **Propósito:** Análise de vendas dinâmica com múltiplos modos
- **Modos Suportados:** `region`, `supervisor`, `seller`, `customer`, `product`, `customerGroup`
- **Retorna:** Array de objetos `{ name: string, size: number }`

## Mapeamento por Página (Frontend)

### Página: Analítico por Região
- **Arquivo:** `src/pages/AnaliticoRegiao.jsx`
- **Hook:** `useAnalyticalData('get_regional_sales_treemap', ...)`
- **Notas:** Usa `FilterBar` local para controlar o contexto de filtros.

### Página: Analítico por Grupo de Clientes
- **Arquivo:** `src/pages/AnaliticoGrupoClientes.jsx`
- **Hook:** `useAnalyticalData('get_customer_group_sales_treemap', ...)`
- **Notas:** Define `p_show_defined_groups_only: true` por padrão para ignorar grupos nulos/vazios.

### Página: Analítico Supervisor
- **Arquivo:** `src/pages/AnaliticoSupervisor.jsx`
- **Chamada:** `supabase.rpc('get_supervisor_sales_treemap', ...)`
- **Notas:** Implementação direta para controle granular de renderização do Treemap.

### Página: Explorador de Vendas
- **Hook:** `useAnalyticalData('get_sales_explorer_treemap', ...)`
- **Parâmetro Crítico:** `p_analysis_mode` define a coluna de agrupamento (ex: 'seller', 'region').

## Boas Práticas

1. **NUNCA use a mesma função para múltiplas páginas distintas** se a lógica de negócio divergir minimamente. Crie uma nova.
2. **SEMPRE use o hook `useAnalyticalData`** quando possível, pois ele centraliza o tratamento de datas e parâmetros nulos.
3. **NUNCA edite uma função RPC em produção** sem verificar todos os consumidores (Use este arquivo como referência).