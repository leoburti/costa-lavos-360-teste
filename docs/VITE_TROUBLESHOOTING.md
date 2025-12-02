# Vite Cache Troubleshooting Guide

## Problema: Erro 504 (Outdated Optimize Dep)

### Sintomas
- O console do navegador exibe erros `504 (Outdated Optimize Dep)`.
- Falhas no carregamento de dependências como `@dnd-kit`, `@radix-ui` ou `recharts`.
- A aplicação pode travar ou apresentar comportamentos inesperados após atualizações.

### Causa
O Vite utiliza um sistema de cache de dependências (`.vite/deps`) para acelerar o desenvolvimento. Quando dependências são alteradas, instaladas ou removidas, esse cache pode ficar "stale" (obsoleto), fazendo com que o navegador solicite arquivos que não existem mais na versão correta.

### Soluções

Nós adicionamos scripts específicos no `package.json` para resolver este problema rapidamente.

#### 1. Forçar Re-otimização (Recomendado)
Este comando força o Vite a recriar o bundle de dependências, mantendo o cache do navegador limpo.