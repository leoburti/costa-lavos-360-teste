# Estrutura e Configuração de Módulos

O sistema Costa Lavos 360 utiliza uma arquitetura orientada a metadados para definir rotas, navegação e estrutura de arquivos.

## 1. Estrutura de Dados (JSON)

O arquivo central de controle é `src/config/modulesStructure.js`. A configuração segue uma hierarquia estrita de 3 níveis: **Módulo -> Grupo -> Página**.

### Exemplo de Objeto de Módulo