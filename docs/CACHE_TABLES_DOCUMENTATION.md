# Documentação: Tabelas de Cache e Fila

## Tabelas Criadas

### 1. dashboard_kpis_cache
- **Schema:** public
- **RLS:** ✅ ATIVADO
- **Políticas:** 2
  - Service role: Acesso total
  - Authenticated: Leitura
- **Uso:** Cache de KPIs do dashboard
- **Atualização:** Via função `refresh_dashboard_cache()`

### 2. job_results
- **Schema:** public
- **RLS:** ✅ ATIVADO
- **Políticas:** 4
  - Usuários: Leitura/Escrita de seus próprios jobs
  - Service role: Acesso total
- **Uso:** Armazenar resultados de jobs assíncronos
- **Atualização:** Via função `request_overview_data()`

## Funções Criadas

### 1. get_cached_dashboard()
- **Retorno:** TABLE(payload jsonb, updated_at timestamptz, status text)
- **Uso:** Obter cache do dashboard
- **RLS:** ✅ Protegido

### 2. refresh_dashboard_cache()
- **Parâmetros:** Nenhum
- **Uso:** Atualizar cache do dashboard
- **Timeout:** 30 minutos
- **RLS:** ✅ Protegido

### 3. request_overview_data(p_filters jsonb)
- **Parâmetros:** p_filters (JSONB)
- **Retorno:** JSONB com job_id
- **Uso:** Requisitar dados com fila assíncrona
- **RLS:** ✅ Protegido

## Segurança

- ✅ RLS ativado em todas as tabelas
- ✅ Políticas de acesso definidas
- ✅ search_path configurado
- ✅ Funções com SECURITY DEFINER
- ✅ Isolamento de dados por usuário