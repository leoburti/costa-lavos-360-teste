# Guia de Rollback - Correção do Erro 'Objects are not valid as a React child'

**Data:** 01/12/2025
**Versão da Correção:** 2.0.0
**Contexto:** Este guia detalha o procedimento para reverter as alterações implementadas para corrigir o erro "Objects are not valid as a React child" em caso de regressão ou problemas inesperados após o deploy.

---

## 1. Quando Fazer Rollback

O rollback deve ser considerado nas seguintes situações:

a) **Persistência do Erro:** Se, após a aplicação das correções e deploy em produção, o erro "Objects are not valid as a React child" persistir em algum componente não detectado anteriormente.
b) **Nova Regressão:** Se a aplicação da correção introduzir novos bugs ou regressões críticas em funcionalidades existentes.
c) **Degradação de Performance:** Se houver uma degradação significativa e inesperada na performance da aplicação após a correção, não relacionada a dados ou infraestrutura.

---

## 2. Passos de Rollback (Reverter Commits)

Este é o método mais limpo para desfazer um conjunto de alterações.

a) **Listar Commits Recentes:**
   Abra o terminal na raiz do projeto e execute: