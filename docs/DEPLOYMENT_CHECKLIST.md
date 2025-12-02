# Checklist de Deployment

## Pré-Deployment

- [ ] Backup completo do banco de dados
- [ ] Validação de todas as 13 funções
- [ ] Testes de performance em staging
- [ ] Validação de RLS
- [ ] Documentação atualizada
- [ ] Equipe notificada

## Deployment

- [ ] Criar índices em produção (CONCURRENTLY)
- [ ] Validar índices criados
- [ ] Agendar jobs com pg_cron
- [ ] Validar jobs agendados
- [ ] Atualizar frontend (se necessário)
- [ ] Validar integração

## Pós-Deployment

- [ ] Monitoramento intensivo (24h)
- [ ] Validar performance
- [ ] Validar RLS
- [ ] Validar jobs
- [ ] Documentar issues
- [ ] Comunicar sucesso

## Rollback (se necessário)

- [ ] Desabilitar jobs
- [ ] Remover índices (DROP INDEX)
- [ ] Restaurar versão anterior do frontend
- [ ] Validar sistema
- [ ] Comunicar rollback