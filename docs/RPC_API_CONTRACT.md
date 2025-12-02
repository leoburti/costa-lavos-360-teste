# Contrato de API RPC - Funções Analíticas

## Status: CONSOLIDADO (2025-11-29)

Este documento define as assinaturas canônicas das funções RPC. Qualquer alteração no frontend deve respeitar estritamente estas assinaturas.

### Regras Gerais
1.  **Prefixo `p_`:** Todos os parâmetros no banco usam o prefixo `p_` (ex: `p_start_date`).
2.  **Parâmetros Opcionais:** Todos os parâmetros nas funções analíticas têm valor padrão `NULL` ou `false`.
3.  **Whitelisting:** O serviço `supabaseRpcService.js` filtra AUTOMATICAMENTE qualquer parâmetro enviado pelo React que não esteja nesta lista. Parâmetros de UI como `viewMode` ou `products` (se não suportados) serão removidos antes do envio.

### Assinatura Universal
A maioria das funções analíticas (`get_treemap_data`, `get_daily_sales_data_v2`, `get_dashboard_xray_data`) aceita o seguinte superset de parâmetros: