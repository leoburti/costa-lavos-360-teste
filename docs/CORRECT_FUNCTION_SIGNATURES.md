# Assinaturas Corretas de Funções (Auditado)

## Formato: function_name(param1 type, param2 type, ...)

Lista atualizada das funções RPC disponíveis e verificadas no banco de dados.

- **get_analytical_bonification**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)
- **get_bonification_analysis**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)
- **get_bonification_performance**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)
- **get_dashboard_and_daily_sales_kpis**(p_start_date text, p_end_date text, p_previous_start_date text, p_previous_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)
- **get_low_performance_clients**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)
- **get_overview_data_v2**(p_start_date text, p_end_date text, p_previous_start_date text, p_previous_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_show_defined_groups_only boolean)
- **get_price_analysis**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)
- **get_product_basket_analysis_v2**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)
- **get_projected_abc_analysis**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)
- **get_regional_summary_v2**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_analysis_mode text, p_show_defined_groups_only boolean, p_supervisors text[], p_sellers text[])
- **get_rfm_analysis**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)
- **get_churn_analysis_data_v3**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)
- **get_seller_analytical_data**(p_start_date text, p_end_date text, p_seller_name text DEFAULT NULL, p_exclude_employees boolean, p_supervisors text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text)
- **get_seasonality_analysis**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_products text[])
- **get_margin_analysis**(p_start_date text, p_end_date text, p_exclude_employees boolean, p_supervisors text[], p_sellers text[], p_customer_groups text[], p_regions text[], p_clients text[], p_search_term text, p_margin_ranges text[], p_products text[])