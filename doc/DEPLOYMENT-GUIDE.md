# Guia de Deploy e Operações - Costa Lavos 360

## 1. Ambientes

### Staging (Homologação)
- **Branch:** `develop` ou `staging`
- **URL:** `https://staging.costalavos360.com` (Exemplo)
- **Propósito:** Testes de QA, validação de novas features, testes de integração com backend de dev.
- **Dados:** Banco de dados de desenvolvimento/staging (pode conter dados anonimizados ou mocks).

### Production (Produção)
- **Branch:** `main` ou `master`
- **URL:** `https://app.costalavos360.com`
- **Propósito:** Uso real pelos usuários finais.
- **Dados:** Banco de dados de produção (Supabase Prod).

## 2. Processo de Deploy (Vercel/Netlify)

O projeto está configurado para deploy contínuo.

1.  **Push/Merge:** Um push para a branch monitorada dispara o build.
2.  **Build:** O comando `npm run build` é executado.
    - Valida dependências.
    - Transpila o código React/Vite.
    - Gera os assets estáticos em `/dist`.
3.  **Deploy:** Os arquivos estáticos são distribuídos na CDN.

### Variáveis de Ambiente
Certifique-se de que as seguintes variáveis estejam configuradas no painel da hospedagem:

- `VITE_SUPABASE_URL`: URL do projeto Supabase.
- `VITE_SUPABASE_ANON_KEY`: Chave pública anônima.
- `VITE_APP_VERSION`: Versão da aplicação (opcional, para logs).

## 3. Rollback

Em caso de falha crítica em produção:

1.  **Via Painel da Hospedagem (Recomendado):**
    - Acesse o painel (Vercel/Netlify).
    - Vá em "Deployments".
    - Encontre o último deploy estável (verde).
    - Clique em "Redeploy" ou "Rollback to this version".
    - **Tempo estimado:** < 1 minuto.

2.  **Via Git:**
    - Reverter o merge na branch `main`: `git revert HEAD`.
    - Push para `main`.
    - Aguardar novo build.
    - **Tempo estimado:** 3-5 minutos.

## 4. Monitoramento e Alertas

### Monitoramento de Erros
- Recomendado integrar com **Sentry** ou **LogRocket**.
- Monitorar consoles errors, falhas de RPC não tratadas e crashes de React (`ErrorBoundary`).

### Monitoramento de Performance
- Acompanhar métricas Web Vitals (LCP, CLS, FID) no painel da Vercel Analytics ou Google Search Console.

### Alertas de Saúde (Health Check)
- Configurar um ping periódico (UptimeRobot) na rota principal e na rota de login para garantir que o site está acessível.