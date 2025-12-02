# Guia de Documentação de Alterações - Costa Lavos 360

Este guia define o padrão oficial para documentar modificações no código-fonte e na infraestrutura do projeto Costa Lavos 360. O objetivo é garantir rastreabilidade, facilitar o *onboarding* de novos desenvolvedores e simplificar o *debugging*.

## 🎯 Quando documentar?

A documentação é obrigatória para:
1.  **Novas Funcionalidades:** Criação de novas telas, componentes complexos ou módulos.
2.  **Alterações de Backend:** Qualquer mudança em tabelas, RPCs (funções SQL) ou políticas de segurança (RLS).
3.  **Refatorações Significativas:** Mudanças que alteram a estrutura lógica de arquivos existentes.
4.  **Correções de Bugs Críticos:** Bugs que afetavam a produção ou impediam fluxos principais.

*Pequenas alterações estéticas (CSS simples) ou correções de typos podem ser registradas apenas no commit message ou no CHANGELOG.md simplificado.*

## 📝 Como documentar uma alteração?

### Passo 1: Utilize o Template
Copie o conteúdo de `/docs/TEMPLATE_ALTERACAO.md` para criar um novo arquivo de registro.

### Passo 2: Nomeação do Arquivo
Salve o arquivo na pasta `/docs/changes/` (crie se não existir) seguindo o padrão:
`YYYY-MM-DD_tipo_descricao-curta.md`

Exemplos:
- `2025-12-01_feat_dashboard-v2.md`
- `2025-12-02_fix_erro-calculo-kpi.md`
- `2025-12-03_refactor_hook-auth.md`

### Passo 3: Preenchimento dos Campos
*   **Descrição:** Seja claro sobre o "Porquê". O código mostra o "Como", a documentação deve explicar a motivação.
*   **Arquivos Modificados:** Liste todos para facilitar a revisão.
*   **Antes/Depois:** Foque nas partes críticas. Não precisa copiar o arquivo inteiro, apenas os blocos lógicos que mudaram.
*   **Testes:** Confirme que você validou a alteração localmente.

### Passo 4: Atualização do Changelog Geral
Após criar o registro detalhado, adicione uma linha resumida no arquivo `/docs/CHANGELOG.md` principal, referenciando a alteração.

Exemplo no CHANGELOG.md: