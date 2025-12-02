# Correção C01: Normalização de Timezone (Datas)

**Data:** 01/12/2025
**Status:** Implementado
**Problema:** A formatação de datas para APIs usando `.toISOString().split('T')[0]` converte o horário local para UTC. Em fusos horários como o do Brasil (GMT-3), operações realizadas à noite (ex: após 21h) resultam na data do "dia seguinte" sendo enviada para o backend, causando retornos vazios ("Nenhum dado encontrado") para o dia atual.

## Solução Implementada

1.  **Nova Função Utilitária (`src/lib/utils.js`)**:
    *   Criada função `formatDateForAPI(date)` que utiliza `date-fns` para formatar a data preservando o timezone local (`yyyy-MM-dd`).
    *   Substitui o uso manual de `toISOString()`.

2.  **Atualização do Hook (`src/hooks/useAnalyticalData.js`)**:
    *   Atualizada a função `normalizeAndStringify` para utilizar `formatDateForAPI` ao processar objetos `Date`.
    *   Garante que qualquer parâmetro de data passado para RPCs seja formatado corretamente.

3.  **Atualização de Componentes**:
    *   `DashboardPage.jsx`: Atualizado para usar `formatDateForAPI` na construção dos parâmetros `p_start_date` e `p_end_date`.

## Como Validar

1.  **Teste de Fuso Horário**:
    *   Ajuste o relógio do sistema para 23:00.
    *   Acesse o Dashboard.
    *   Verifique se os dados do dia atual ("Hoje") ainda são exibidos.
    *   No Network Tab do navegador, inspecione a chamada RPC (ex: `get_dashboard_and_daily_sales_kpis`) e verifique se `p_start_date` e `p_end_date` correspondem à data local (e não ao dia seguinte).

2.  **Teste de Filtro**:
    *   Selecione um intervalo de datas específico.
    *   Verifique se o início e fim do intervalo são respeitados precisamente.