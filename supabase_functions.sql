
-- Adiciona a coluna `motivos` na tabela `bonification_requests`
-- Já executado via chamada de banco de dados, mantido aqui para referência.
-- ALTER TABLE public.bonification_requests ADD COLUMN motivos text[];

-- Função para obter todos os dados da tela de consulta
CREATE OR REPLACE FUNCTION public.get_bonification_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_requests jsonb;
    v_protheus_history jsonb;
    v_kpis jsonb;
    v_global_limit NUMERIC;
    v_previous_month_net_sales NUMERIC;
    v_bonified_this_month NUMERIC;
    v_pending_this_month NUMERIC;
    v_pending_count BIGINT;
    v_pending_value NUMERIC;
    v_limit_percentage NUMERIC;
BEGIN
    SET LOCAL statement_timeout = '30s';

    -- 1. Get Bonification Requests from the app
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', br.id,
            'client_name', br.client_name,
            'total_amount', br.total_amount,
            'request_date', br.request_date,
            'status', br.status,
            'seller_name', br.seller_name,
            'supervisor_name', br.supervisor_name,
            'approver_name', br.approver_name,
            'approval_date', br.approval_date,
            'rejection_reason', br.rejection_reason,
            'products_json', br.products_json,
            'motivos', br.motivos,
            'percentual', COALESCE((
                SELECT (br.total_amount * 100) / NULLIF(SUM(b."Total"), 0)
                FROM "bd-cl" b
                WHERE (b."N Fantasia" = br.client_name OR b."Nome" = br.client_name)
                  AND b."DT Emissao" >= date_trunc('month', br.request_date) - interval '1 month'
                  AND b."DT Emissao" < date_trunc('month', br.request_date)
                  AND b."Cfo"::text NOT IN ('5910', '6910', '5908', '6551', '6908', '5551')
            ), 0)
        ) ORDER BY br.request_date DESC
    ), '[]'::jsonb)
    INTO v_requests
    FROM public.bonification_requests br;

    -- 2. Get Faturado History from Protheus (ERP) data
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id', b.ID,
            'document_number', b."Num. Docto.",
            'client_name', COALESCE(b."N Fantasia", b."Nome"),
            'total_amount', b."Total",
            'request_date', b."DT Emissao",
            'status', 'Faturado',
            'seller_name', b."Nome Vendedor",
            'motivos', ARRAY['Comercial'], -- Motivo Padrão para itens do Protheus
            'percentual', COALESCE((
                SELECT (b."Total" * 100) / NULLIF(SUM(sub."Total"), 0)
                FROM "bd-cl" sub
                WHERE (sub."N Fantasia" = b."N Fantasia" OR sub."Nome" = b."Nome")
                  AND sub."DT Emissao" >= date_trunc('month', b."DT Emissao") - interval '1 month'
                  AND sub."DT Emissao" < date_trunc('month', b."DT Emissao")
                  AND sub."Cfo"::text NOT IN ('5910', '6910', '5908', '6551', '6908', '5551')
            ), 0)
        ) ORDER BY b."DT Emissao" DESC
    ), '[]'::jsonb)
    INTO v_protheus_history
    FROM "bd-cl" b
    WHERE b."Cfo"::text IN ('5910', '6910') AND b."DT Emissao" >= date_trunc('year', now());

    -- 3. Calculate KPIs
    SELECT monthly_limit_percentage INTO v_limit_percentage
    FROM public.bonification_settings WHERE id = 1;
    v_limit_percentage := COALESCE(v_limit_percentage, 2);

    SELECT COALESCE(SUM("Total"), 0) INTO v_previous_month_net_sales
    FROM "bd-cl"
    WHERE "DT Emissao" BETWEEN date_trunc('month', now() - interval '1 month') AND (date_trunc('month', now()) - interval '1 day')
      AND "Cfo"::text NOT IN ('5910', '6910', '5908', '6551', '6908', '5551');
      
    v_global_limit := (v_previous_month_net_sales * v_limit_percentage) / 100;

    SELECT COALESCE(SUM(total_amount), 0) INTO v_bonified_this_month
    FROM public.bonification_requests
    WHERE request_date >= date_trunc('month', now()) AND status IN ('Aprovado', 'Aprovado Automaticamente');
    
    SELECT COALESCE(SUM(total_amount), 0) INTO v_pending_this_month
    FROM public.bonification_requests
    WHERE request_date >= date_trunc('month', now()) AND status = 'Aguardando Aprovação';

    SELECT COUNT(*), COALESCE(SUM(total_amount), 0) INTO v_pending_count, v_pending_value
    FROM public.bonification_requests
    WHERE status = 'Aguardando Aprovação';

    v_kpis := jsonb_build_object(
        'globalLimit', v_global_limit,
        'previousMonthNetSales', v_previous_month_net_sales,
        'bonifiedThisMonth', v_bonified_this_month,
        'pendingThisMonth', v_pending_this_month,
        'pendingRequestsCount', v_pending_count,
        'pendingRequestsValue', v_pending_value
    );

    RETURN jsonb_build_object(
        'requests', v_requests,
        'protheus_history', v_protheus_history,
        'kpis', v_kpis
    );
END;
$$;
