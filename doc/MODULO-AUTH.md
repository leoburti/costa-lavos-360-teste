# Relatório do Módulo: Autenticação (Auth)

**Data:** 02/12/2025
**Status:** ✅ Estável

## 1. Páginas
*   `LoginPage.jsx`: Formulário de login padrão.
*   `ForgotPasswordPage.jsx` / `ForgotPassword.jsx`: Solicitação de reset de senha (Duplicidade de nome).
*   `ResetPasswordPage.jsx`: Definição de nova senha.
*   `UpdatePassword.jsx`: Alteração de senha para usuário logado.
*   `AuthConfirmation.jsx`: Tela de feedback pós-cadastro/email.

## 2. Contextos e Hooks
*   `SupabaseAuthContext.jsx`: Gerencia estado global de sessão (`user`, `session`, `loading`).
*   `useAuth`: Hook consumidor do contexto.
*   `usePasswordReset`: Hook especializado para fluxo de recuperação.

## 3. Problemas
*   **Duplicidade:** `ForgotPasswordPage.jsx` vs `ForgotPassword.jsx`. Verificar qual está sendo usado no Router e remover o outro.
*   **Redirecionamento:** `LoginPage` tem lógica de redirecionamento baseada em `location.state.from`. Verificar se cobre todos os casos de borda (loops).

## 4. Recomendações
*   Padronizar nomes para `*Page.jsx`.
*   Garantir que `AuthGuard` envolva todas as rotas privadas e verifique não apenas a sessão, mas a validade do token.