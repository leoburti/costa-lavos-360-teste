# Guia de Otimização de Performance - Costa Lavos 360

Este documento descreve as estratégias e técnicas utilizadas para garantir a alta performance da aplicação, focando em tempos de carregamento, responsividade e eficiência de dados.

## 1. Code Splitting e Lazy Loading

A aplicação utiliza agressivamente o **Code Splitting** via `React.lazy` e `Suspense` para dividir o bundle JavaScript em pedaços menores, carregados apenas quando necessários.

- **Roteamento:** Todas as páginas em `src/App.jsx` e `src/components/ModuleRouter.jsx` são carregadas dinamicamente.
- **Módulos:** Cada grande módulo (Analytics, CRM, etc.) é um chunk separado.
- **Benefício:** Redução drástica do tempo de carregamento inicial (FCP/LCP).

**Exemplo:**