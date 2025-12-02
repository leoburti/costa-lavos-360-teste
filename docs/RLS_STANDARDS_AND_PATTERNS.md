# Padrões de RLS para Novas Tabelas

Este documento estabelece os padrões obrigatórios para a implementação de Row-Level Security (RLS) em todas as novas tabelas do banco de dados, garantindo um ambiente seguro e consistente.

## Regra Obrigatória: RLS SEMPRE Ativo

Toda nova tabela criada no schema `public` **DEVE** ter RLS habilitado e políticas de segurança apropriadas antes de ser utilizada em produção.

### Passo 1: Habilitar RLS na Tabela