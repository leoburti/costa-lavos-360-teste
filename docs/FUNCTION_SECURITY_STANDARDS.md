# Padrão de Segurança para Funções PostgreSQL

## Regra Obrigatória: `search_path` SEMPRE Definido

Toda e qualquer função criada no banco de dados **DEVE** ter seu `search_path` explicitamente definido para `public`. Isso é uma medida de segurança crítica para prevenir ataques de injeção de SQL e escalonamento de privilégios.

### Template para Novas Funções

Use estes templates como base para todas as novas funções.

**PL/pgSQL:**