# Guia de Branding e Estilo - Costa Lavos 360

Este documento define os padrões visuais, cores e tipografia para garantir a consistência da interface do Costa Lavos 360.

## 1. Identidade Visual

### Cor Principal
A cor primária da marca é um vermelho intenso, transmitindo energia e urgência, típico de operações comerciais e varejo.

- **Brand Red:** `#DC2626` (Tailwind: `red-600`)
- **Uso:** Logos, botões primários, estados ativos no menu, destaques importantes.

### Logo
O logo no sistema é renderizado programaticamente para garantir escalabilidade e performance, mas segue a seguinte especificação visual:

- **Ícone:** Um quadrado arredondado (`rounded-md`) com fundo `#DC2626`.
- **Texto do Ícone:** "CL" em branco, fonte bold.
- **Texto da Marca:** "Costa" em `#DC2626`, "Lavos" em `slate-900`.
- **Fonte:** Sans-serif, pesos Bold (700) e ExtraBold (800).

## 2. Paleta de Cores por Módulo

Cada módulo do sistema possui uma cor temática para facilitar a identificação visual rápida pelo usuário.

| Módulo | Cor Hex | Tailwind | Significado |
| :--- | :--- | :--- | :--- |
| **Analytics** | `#DC2626` | `red-600` | Urgência, KPIs, Metas |
| **CRM** | `#3B82F6` | `blue-500` | Confiança, Comunicação, Negócios |
| **Equipamentos** | `#10B981` | `emerald-500` | Ativos, Estabilidade, Manutenção |
| **Entrega** | `#F59E0B` | `amber-500` | Logística, Movimento, Atenção |
| **Suporte** | `#8B5CF6` | `violet-500` | Serviço, Ajuda, Resolução |
| **Configurações** | `#64748B` | `slate-500` | Neutro, Sistema, Estrutural |

## 3. Tipografia

A tipografia padrão utiliza a fonte do sistema (Inter/San Francisco/Segoe UI) para máxima legibilidade e performance.

- **Headings (H1-H3):** `font-bold`, `tracking-tight`, `text-slate-900`.
- **Body:** `text-slate-600`, `leading-relaxed`.
- **Small/Meta:** `text-xs`, `text-slate-500`, `font-medium`.
- **Numbers/KPIs:** `font-mono` (opcional para dados tabulares) ou `font-bold` tabular.

## 4. Ícones

Utilizamos exclusivamente a biblioteca **Lucide React** pela sua consistência de traço e leveza.

### Padrões de Uso
- **Tamanho Padrão:** `h-4 w-4` (16px) para botões e menus.
- **Tamanho Destaque:** `h-8 w-8` (32px) para cards de KPI e headers de página.
- **Espessura:** Padrão da biblioteca (2px).

### Ícones Principais
- **Dashboard:** `LayoutDashboard`
- **Gráficos:** `BarChart3`, `PieChart`, `LineChart`
- **Ações:** `Filter` (Filtros), `Download` (Exportar), `RefreshCw` (Atualizar)
- **Entidades:** `Users` (Clientes/Vendedores), `Package` (Produtos), `Map` (Regiões)