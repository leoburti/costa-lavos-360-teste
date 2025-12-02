# Relatório de Correção Forense: Overloading RPC

**Data:** 2025-11-30
**Incidente:** Erro `PGRST203` (Ambiguous Function Call) em `get_regional_summary_v2`.
**Status:** ✅ CORRIGIDO

## Problema
O PostgreSQL permite sobrecarga de funções (mesmo nome, parâmetros diferentes). No entanto, a interface RPC do Supabase/PostgREST tem dificuldade em desambiguar chamadas quando argumentos opcionais (como `NULL`) são passados, pois `NULL` não tem tipo estrito.

Havia múltiplas versões de `get_regional_summary_v2` no banco de dados, criando um ciclo de erros onde o frontend não conseguia atingir nenhuma versão com sucesso.

## Solução Aplicada

### 1. Limpeza do Banco de Dados
Removemos **todas** as assinaturas existentes da função para garantir um estado limpo.