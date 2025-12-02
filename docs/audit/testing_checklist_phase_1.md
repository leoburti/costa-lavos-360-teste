# Checklist de Testes - Phase 1: Core & Auth

## /login
- [ ] Renderização inicial correta (Inputs, Botões)
- [ ] Validação de campos obrigatórios
- [ ] Autenticação com sucesso
- [ ] Tratamento de erro (Credenciais inválidas)
- [ ] Redirecionamento para Dashboard
- [ ] Link "Esqueceu a senha" funcional

## /forgot-password
- [ ] Renderização inicial
- [ ] Envio de email de recuperação
- [ ] Validação de formato de email
- [ ] Feedback visual de sucesso

## /dashboard
- [ ] **(CRÍTICO)** Carregamento de dados (KPIs, Gráficos) sem erro
- [ ] Filtro de data atualiza dados
- [ ] Alternância de abas (Comercial/Analítico)
- [ ] Responsividade (Mobile/Desktop)
- [ ] Empty States (quando filtro não retorna dados)

## /visao-360-cliente
- [ ] Carregamento de dados do cliente
- [ ] Gráficos históricos renderizam
- [ ] Tratamento para cliente sem vendas (Empty State)
- [ ] Botões de ação funcionais

## /profile
- [ ] Exibição correta de dados do usuário
- [ ] Logout funcional
- [ ] Edição de dados básicos (se permitido)

## Performance Geral
- [ ] Sem erros no console (F12)
- [ ] Network requests < 2s (exceto cargas pesadas iniciais)
- [ ] Sem loops de renderização