# Relatório do Módulo: Debug & Diagnóstico

**Data:** 02/12/2025
**Status:** ✅ Ferramentas Críticas Operacionais

## 1. Visão Geral
Este módulo contém ferramentas essenciais para manutenção e diagnóstico do sistema em produção e desenvolvimento. Não são páginas para o usuário final.

## 2. Páginas
*   `Debug.jsx`: Validador da estrutura de módulos JSON.
*   `DeepAnalysisPage.jsx`: "Raio-X" do banco de dados (tabelas, colunas, dados brutos).
*   `RPCTestPage.jsx`: Testador de funções RPC com parâmetros reais.
*   `SmokeTestPage.jsx`: Executor de testes de fumaça (integridade básica).
*   `SupabaseTestPage.jsx`: Verificador de conexão e RLS.
*   `DataVerificationPage.jsx`: Teste massivo de RPCs analíticas.

## 3. Importância
Estas páginas são vitais para a equipe de desenvolvimento ("Hostinger Horizons") diagnosticar problemas sem acesso direto ao console do Supabase.

## 4. Recomendações
*   **Proteção:** Garantir que estas rotas (`/debug/*`) estejam estritamente protegidas ou desabilitadas em produção (via variável de ambiente ou verificação de role `Nivel 5`).
*   **Manutenção:** Manter `SmokeTestPage` atualizado conforme novas RPCs são criadas.