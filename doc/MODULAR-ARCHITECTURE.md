# Arquitetura Modular Costa Lavos 360

## 1. Visão Geral
A arquitetura do sistema foi migrada de um modelo de rotas estáticas hardcoded para um modelo dinâmico orientado a metadados. Isso permite que o menu lateral, o roteamento e a injeção de dados sejam controlados por uma única fonte de verdade.

## 2. Estrutura de `modulesStructure`

A espinha dorsal da aplicação é o objeto de configuração exportado em `src/config/modulesStructure.js`. Ele define não apenas a UI (Menu), mas também a lógica de dados (RPCs) e a hierarquia de URL.

### Hierarquia Visual