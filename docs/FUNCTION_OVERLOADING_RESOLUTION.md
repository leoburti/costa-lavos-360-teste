# Resolução: Função Overloading Ambíguo (PGRST203) - get_drilldown_data

## Data: 29/11/2025
## Equipe: Arquiteto + Tech Lead + Backend + DBA + QA

### Problema Identificado

**Erro PGRST203:** Função overloading ambíguo em `get_drilldown_data`.

**Causa Raiz:**
O banco de dados contém 3 versões da função `get_drilldown_data` com assinaturas conflitantes. O PostgREST/Supabase não consegue determinar qual versão chamar quando o frontend envia um objeto JSON, pois os parâmetros se sobrepõem ou têm tipos compatíveis (ex: `text` vs `date`).

### Análise de Versões

| Versão | Características | Status |
| :--- | :--- | :--- |
| **Versão 1** | Tipos corretos (`uuid[]`, `date`, `integer`). 13 parâmetros. | **MANTER (com ajustes)** |
| **Versão 2** | Tipos incorretos (`text[]` para IDs, `text` para datas). | **DELETAR** |
| **Versão 3** | Tipos mistos e parâmetros extras não padronizados. | **DELETAR** |

### Decisão Técnica

**Estratégia:** Consolidar em uma única "Assinatura Universal".

1.  **Deletar** explicitamente as versões conflitantes.
2.  **Recriar** a Versão 1 utilizando a estratégia de "Assinatura Universal" (todos os parâmetros possíveis aceitos, com `DEFAULT NULL`), mas mantendo os tipos fortes (`uuid[]`, `date`) para garantir integridade e performance.

### Solução Implementada

#### 1. Limpeza (Drops)

Executamos comandos `DROP FUNCTION` visando assinaturas específicas para remover as versões incorretas sem ambiguidade.

#### 2. Assinatura Final (Consolidada)

A nova função `get_drilldown_data` aceita:
*   Filtros Base: `p_start_date` (date), `p_end_date` (date), `p_clients` (uuid[]), etc.
*   Parâmetros de Controle: `p_drilldown_level` (integer), `p_parent_keys` (text[]).
*   Parâmetros Opcionais (Superset): `p_analysis_type`, `p_level`, etc. (como `DEFAULT NULL`).

### Testes Realizados

- ✅ Remoção de versões duplicadas.
- ✅ Criação da versão única e robusta.
- ✅ Validação de tipos (UUIDs e Dates são aceitos corretamente).
- ✅ Frontend sincronizado para enviar tipos compatíveis.

### Status

✅ **RESOLVIDO**
- Erro PGRST203 eliminado.
- Backend pronto para produção.