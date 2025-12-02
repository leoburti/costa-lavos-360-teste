-- GRUPO 1: MOVER EXTENSIONS PARA SCHEMA PRIVADO
-- Criar schema extensions se não existir
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO authenticated, service_role, postgres;

-- Mover 3 extensions
ALTER EXTENSION IF EXISTS pg_trgm SET SCHEMA extensions;
ALTER EXTENSION IF EXISTS unaccent SET SCHEMA extensions;
ALTER EXTENSION IF EXISTS wrappers SET SCHEMA extensions;

-- GRUPO 2: MOVER MATERIALIZED VIEWS PARA SCHEMA PRIVATE
-- Verificar e mover mv_available_periods
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'mv_available_periods') THEN
        ALTER MATERIALIZED VIEW public.mv_available_periods SET SCHEMA private;
    END IF;
END $$;

-- Verificar e mover mv_sales_summary
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'mv_sales_summary') THEN
        ALTER MATERIALIZED VIEW public.mv_sales_summary SET SCHEMA private;
    END IF;
END $$;

-- Verificar e mover mv_filter_options
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname = 'public' AND matviewname = 'mv_filter_options') THEN
        ALTER MATERIALIZED VIEW public.mv_filter_options SET SCHEMA private;
    END IF;
END $$;