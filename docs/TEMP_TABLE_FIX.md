# Correção de Conflito de Tabela Temporária

## Problema
- A função `get_low_performance_clients` criava uma tabela temporária com o nome estático `temp_filtered_sales`.
- Quando a função era executada por múltiplos usuários ou processos em paralelo, ocorria um conflito com a mensagem de erro "relation 'temp_filtered_sales' already exists".
- O uso de `ON COMMIT DROP` não resolvia o problema de concorrência, pois as tabelas temporárias são vinculadas à sessão e múltiplas execuções dentro da mesma sessão (comum em pools de conexão) podem causar o conflito.

## Solução Implementada
- **Opção 1 (Descartada):** Usar um nome único para a tabela temporária, concatenando o timestamp e o ID do processo (e.g., `temp_table_name || pg_backend_pid()`). Embora funcional, é menos performático e mais complexo que a alternativa.
- **Opção 2 (Implementada - RECOMENDADO):** Refatorar a função para utilizar uma **Common Table Expression (CTE)** com a cláusula `WITH`. Esta abordagem é mais limpa, segura contra concorrência (pois o escopo é a query) e, em muitos casos, mais performática, pois permite que o planejador do PostgreSQL otimize a consulta como um todo.

## Função Corrigida
- `get_low_performance_clients` foi refatorada para usar uma CTE (`WITH filtered_sales AS (...)`), eliminando a necessidade da tabela temporária. A lógica interna da função também foi ajustada para retornar o formato JSON esperado pela aplicação.

## Funções Afetadas
- Uma verificação foi realizada e as seguintes funções também utilizavam tabelas temporárias e foram ou serão corrigidas com a mesma abordagem (CTE):
    - `get_low_performance_clients` (Corrigida)
    - `get_dashboard_and_daily_sales_kpis`
    - `get_overview_data`
    - `get_new_client_trends`
    - `get_seller_analytical_data`
    - `get_supervisor_analytical_data`

## Testes Realizados
- ✅ **Execução Simples:** A função retorna os resultados esperados.
- ✅ **Execução Paralela (simulada):** Múltiplas execuções simultâneas foram concluídas sem erros de conflito.
- ✅ **Execução com Parâmetros:** A função continua a filtrar corretamente os dados com base nos parâmetros fornecidos.
- ✅ **Verificação de Tabelas Órfãs:** Confirmado que nenhuma tabela temporária com o nome `temp_filtered_sales` é deixada no banco após a execução.

## Status
- ✅ **CORRIGIDO**
- ✅ **TESTADO**
- ✅ **PRONTO PARA PRODUÇÃO**