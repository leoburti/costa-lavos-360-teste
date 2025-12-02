# Relatório de Registro de Rotas

**Data:** 01/12/2025
**Status:** Confirmado

Este documento lista todas as rotas oficialmente registradas no arquivo `src/App.jsx`, incluindo as novas páginas analíticas e de análise estratégica.

## 1. Novas Páginas Registradas

Estas rotas foram adicionadas e verificadas na última atualização:

| Rota | Componente | Caminho do Arquivo |
| :--- | :--- | :--- |
| `/analitico-vendas-diarias` | `AnaliticoVendasDiarias` | `src/pages/AnaliticoVendasDiarias.jsx` |
| `/analise-preditiva-vendas` | `AnalisePreditivaVendas` | `src/pages/AnalisePreditivaVendas.jsx` |
| `/curva-abc` | `CurvaABC` | `src/pages/CurvaABC.jsx` |
| `/analise-valor-unitario` | `AnaliseValorUnitario` | `src/pages/AnaliseValorUnitario.jsx` |
| `/analise-desempenho-fidelidade` | `AnaliseDesempenhoFidelidade` | `src/pages/AnaliseDesempenhoFidelidade.jsx` |

## 2. Visão 360º Cliente

| Rota | Componente | Status |
| :--- | :--- | :--- |
| `/visao-360-cliente` | `Visao360Search` | ✅ Registrada (Busca) |
| `/visao-360-cliente/:clientId` | `Visao360ClientePage` | ✅ Registrada (Detalhes) |
| `/cliente/:clientId` | `Client360` | ✅ Registrada (Alias Direto) |

## 3. Lista Completa de Rotas Analíticas (15 Rotas)

### Grupo Analítico (Visão Operacional/Tática)
1.  `/analitico-supervisor`
2.  `/analitico-vendedor`
3.  `/analitico-regiao`
4.  `/analitico-grupo-clientes`
5.  `/analitico-produto`
6.  `/analitico-vendas-diarias` **(Novo)**

### Grupo Análise (Visão Estratégica)
7.  `/analise-preditiva-vendas` **(Novo)**
8.  `/curva-abc` **(Novo)**
9.  `/analise-valor-unitario` **(Novo)**
10. `/analise-desempenho-fidelidade` **(Novo)**
11. `/analise-clientes`
12. `/analise-produtos`
13. `/analise-sazonalidade`
14. `/analise-margem`
15. `/analise-churn`

## 4. Observações
Todas as rotas estão protegidas pelo `AuthGuard` e utilizam o layout padrão `LayoutOverride`. O carregamento é feito via `React.lazy` para otimização de performance.