export const CRITICAL_RPCS_DEFINITIONS = {
  'safe_parse_date': `
    CREATE OR REPLACE FUNCTION public.safe_parse_date(p_text_date text)
    RETURNS timestamp with time zone
    LANGUAGE plpgsql
    IMMUTABLE
    AS $$
    BEGIN
        RETURN p_text_date::timestamp with time zone;
    EXCEPTION WHEN others THEN
        RETURN NULL;
    END;
    $$;
  `,
  'f_unaccent': `
    CREATE OR REPLACE FUNCTION public.f_unaccent(text)
    RETURNS text
    LANGUAGE sql
    IMMUTABLE
    AS $$
    SELECT public.unaccent($1)
    $$;
  `,
  'get_daily_sales_data_v2': `
    CREATE OR REPLACE FUNCTION public.get_daily_sales_data_v2(
        p_start_date text, 
        p_end_date text, 
        p_exclude_employees boolean DEFAULT false, 
        p_supervisors text[] DEFAULT NULL, 
        p_sellers text[] DEFAULT NULL, 
        p_customer_groups text[] DEFAULT NULL, 
        p_regions text[] DEFAULT NULL, 
        p_clients text[] DEFAULT NULL, 
        p_search_term text DEFAULT NULL
    )
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET statement_timeout TO '25s'
    AS $$
    DECLARE
      v_start_date date := public.safe_parse_date(p_start_date);
      v_end_date date := public.safe_parse_date(p_end_date);
    BEGIN
      RETURN (
        SELECT jsonb_agg(t) FROM (
          SELECT 
            to_char("DT Emissao", 'YYYY-MM-DD') as date, 
            COALESCE(SUM("Total"), 0) as total
          FROM "bd-cl"
          WHERE "DT Emissao" BETWEEN v_start_date AND v_end_date
            AND "Total" > 0
            AND (p_exclude_employees IS FALSE OR COALESCE("Nome Grp Cliente", '') NOT IN ('FUNCIONARIOS', 'FUNCIONARIO'))
            AND (p_supervisors IS NULL OR "Nome Supervisor" = ANY(p_supervisors))
            AND (p_sellers IS NULL OR "Nome Vendedor" = ANY(p_sellers))
          GROUP BY 1
          ORDER BY 1
        ) t
      );
    END;
    $$;
  `,
  'get_overview_data_v2': `
    CREATE OR REPLACE FUNCTION public.get_overview_data_v2(
        p_start_date text, 
        p_end_date text, 
        p_previous_start_date text DEFAULT NULL, 
        p_previous_end_date text DEFAULT NULL, 
        p_exclude_employees boolean DEFAULT false, 
        p_supervisors text[] DEFAULT NULL, 
        p_sellers text[] DEFAULT NULL, 
        p_customer_groups text[] DEFAULT NULL, 
        p_regions text[] DEFAULT NULL, 
        p_clients text[] DEFAULT NULL, 
        p_search_term text DEFAULT NULL, 
        p_show_defined_groups_only boolean DEFAULT false
    )
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET statement_timeout TO '30s'
    AS $$
    DECLARE
      v_start_date date := public.safe_parse_date(p_start_date);
      v_end_date date := public.safe_parse_date(p_end_date);
      v_kpi jsonb;
      v_rankings jsonb;
    BEGIN
      -- KPI Aggregation (Optimized: Single Pass)
      SELECT jsonb_build_object(
        'totalRevenue', COALESCE(SUM("Total"), 0),
        'salesCount', COUNT(*),
        'activeClients', COUNT(DISTINCT "Cliente"),
        'totalBonification', COALESCE(SUM(CASE WHEN "Cfo" IN (5910, 6910) THEN "Total" ELSE 0 END), 0),
        'totalEquipment', COALESCE(SUM(CASE WHEN "Cfo" IN (5908, 6551, 6908, 5551) THEN "Total" ELSE 0 END), 0)
      ) INTO v_kpi
      FROM "bd-cl"
      WHERE "DT Emissao" BETWEEN v_start_date AND v_end_date
        AND "Total" > 0
        AND (p_exclude_employees IS FALSE OR COALESCE("Nome Grp Cliente", '') NOT IN ('FUNCIONARIOS', 'FUNCIONARIO'))
        AND (p_supervisors IS NULL OR "Nome Supervisor" = ANY(p_supervisors))
        AND (p_sellers IS NULL OR "Nome Vendedor" = ANY(p_sellers));

      -- Rankings (Optimized: Limited to Top 50)
      WITH filtered_data AS (
          SELECT "Nome Supervisor", "Nome Vendedor", "Desc.Regiao", "Total"
          FROM "bd-cl"
          WHERE "DT Emissao" BETWEEN v_start_date AND v_end_date
            AND "Total" > 0
            AND (p_exclude_employees IS FALSE OR COALESCE("Nome Grp Cliente", '') NOT IN ('FUNCIONARIOS', 'FUNCIONARIO'))
            AND (p_supervisors IS NULL OR "Nome Supervisor" = ANY(p_supervisors))
            AND (p_sellers IS NULL OR "Nome Vendedor" = ANY(p_sellers))
      )
      SELECT jsonb_build_object(
          'salesBySupervisor', (
              SELECT COALESCE(jsonb_agg(x), '[]'::jsonb) FROM (
                  SELECT "Nome Supervisor" as name, SUM("Total") as total_revenue 
                  FROM filtered_data WHERE "Nome Supervisor" IS NOT NULL AND "Nome Supervisor" <> 'Não Definido'
                  GROUP BY 1 ORDER BY 2 DESC LIMIT 50
              ) x
          ),
          'salesBySeller', (
              SELECT COALESCE(jsonb_agg(x), '[]'::jsonb) FROM (
                  SELECT "Nome Vendedor" as name, SUM("Total") as total_revenue 
                  FROM filtered_data WHERE "Nome Vendedor" IS NOT NULL AND "Nome Vendedor" <> 'Não Definido'
                  GROUP BY 1 ORDER BY 2 DESC LIMIT 50
              ) x
          ),
          'regionalSales', (
              SELECT COALESCE(jsonb_agg(x), '[]'::jsonb) FROM (
                  SELECT "Desc.Regiao" as name, SUM("Total") as total_revenue 
                  FROM filtered_data WHERE "Desc.Regiao" IS NOT NULL 
                  GROUP BY 1 ORDER BY 2 DESC LIMIT 50
              ) x
          )
      ) INTO v_rankings;

      RETURN jsonb_build_object(
        'kpi', v_kpi,
        'dailySales', '[]'::jsonb,
        'rankings', v_rankings
      );
    END;
    $$;
  `,
  'get_sales_based_filter_options': `
    CREATE OR REPLACE FUNCTION public.get_sales_based_filter_options(p_start_date text, p_end_date text)
    RETURNS jsonb
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET statement_timeout TO '15s'
    AS $$
    BEGIN
      -- Simplified options fetching to prevent timeout on full distinct scans
      RETURN jsonb_build_object(
        'customerGroups', (
            SELECT jsonb_agg(DISTINCT "Nome Grp Cliente") 
            FROM "bd-cl" 
            WHERE "Nome Grp Cliente" IS NOT NULL AND "Nome Grp Cliente" <> 'Não Definido'
            AND "DT Emissao" > (CURRENT_DATE - INTERVAL '12 months') -- Optimization: Only active groups
        ),
        'regions', (
            SELECT jsonb_agg(DISTINCT "Desc.Regiao") 
            FROM "bd-cl" 
            WHERE "Desc.Regiao" IS NOT NULL
            AND "DT Emissao" > (CURRENT_DATE - INTERVAL '12 months')
        )
      );
    END;
    $$;
  `
};

export const REQUIRED_RPCS = [
  { name: 'safe_parse_date', module: 'Core', critical: true },
  { name: 'f_unaccent', module: 'Core', critical: true },
  { name: 'get_overview_data_v2', module: 'Comercial', critical: true },
  { name: 'get_daily_sales_data_v2', module: 'Comercial', critical: true },
  { name: 'get_sales_based_filter_options', module: 'Filtros', critical: true }
];