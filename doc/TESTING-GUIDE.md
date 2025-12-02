# Guia de Testes - Costa Lavos 360

Estratégia de testes para garantir a qualidade, estabilidade e confiabilidade da aplicação.

## 1. Níveis de Teste

### 1.1. Testes Unitários (Vitest)
Focados em testar a lógica de negócios isolada, utilitários e hooks.

- **Ferramenta:** Vitest + React Testing Library.
- **O que testar:**
  - Funções utilitárias em `src/lib/utils.js` (formatação, datas).
  - Hooks customizados (`useAdvancedFilters`, `useModuleData` - mockando o serviço).
  - Componentes de UI isolados (botões, badges) para garantir renderização correta de props.
- **Comando:** `npm run test`

### 1.2. Testes de Integração
Focados em como os componentes interagem entre si e com o estado global.

- **O que testar:**
  - Fluxo de filtros: Selecionar filtro -> Verificar atualização do contexto.
  - `ModuleRouter`: Verificar se carrega o componente correto baseado na config.
  - Formulários: Validação e submissão.

### 1.3. Testes E2E (End-to-End)
Simulam o comportamento real do usuário no navegador.

- **Ferramenta Recomendada:** Playwright ou Cypress.
- **Cenários Críticos:**
  1.  **Login:** Autenticação com sucesso e tratamento de erro.
  2.  **Navegação:** Acessar Dashboard, mudar de módulo.
  3.  **Filtros:** Aplicar filtro de data e verificar se os números na tela mudam.
  4.  **Resiliência:** Simular falha de rede e verificar se o aviso de "Modo Offline/Mock" aparece.

## 2. Cobertura de Testes (Goals)

Não buscamos 100% de cobertura, mas sim cobertura inteligente nas áreas de risco.

- **Utils/Helpers:** 90%+ (Lógica pura, fácil de testar).
- **Hooks de Negócio:** 80% (Garantir que a lógica de estado funciona).
- **Componentes UI:** 50% (Focar nos componentes complexos e reutilizáveis).
- **Páginas:** Cobertas principalmente por testes E2E smoke tests.

## 3. CI/CD (Integração Contínua)

Sugestão de pipeline (GitHub Actions):

1.  **Lint:** `npm run eslint` (Bloqueia código fora do padrão).
2.  **Build:** `npm run build` (Garante que o projeto compila sem erros).
3.  **Test:** `npm run test` (Roda testes unitários).
4.  **Deploy:** Deploy automático para Staging (Vercel/Netlify) após merge na `main`.