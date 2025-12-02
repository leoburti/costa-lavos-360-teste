import { 
  LayoutDashboard, 
  BarChart2, 
  Truck, 
  Wrench, 
  Users, 
  Settings, 
  Gift, 
  LifeBuoy, 
  PieChart, 
  TrendingUp, 
  MapPin, 
  Package, 
  FileText, 
  Shield, 
  Activity, 
  Zap, 
  Database, 
  Phone,
  ClipboardCheck,
  AlertTriangle,
  DollarSign,
  Search,
  Calendar,
  List,
  PenTool,
  Calculator,
  ScrollText,
  Sliders,
  Briefcase,
  Contact2,
  BookOpen,
  MessageSquare,
  Video,
  HelpCircle,
  Info,
  Clock,
  Bell,
  MessageCircle,
  Ticket,
  User,
  Users2,
  Key,
  Webhook,
  Target,
  Map
} from 'lucide-react';

/**
 * Enterprise Menu Structure
 * Organized into 7 Core Modules containing ~102 functional entry points.
 */
export const menuStructure = [
  // 1. ANALYTICS MODULE
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart2,
    moduleId: 'analytics',
    subItems: [
      { id: 'dash-main', label: 'Dashboard Principal', path: '/dashboard', icon: LayoutDashboard },
      { id: 'dash-360', label: 'Visão 360°', path: '/visao-360-cliente', icon: Search },
      { id: 'dash-finance', label: 'Dashboard Financeiro', path: '/relatorio-financeiro-receita', icon: DollarSign },
      
      // Detailed Analysis
      { id: 'an-supervisor', label: 'Analítico Supervisor', path: '/analitico-supervisor' },
      { id: 'an-seller', label: 'Analítico Vendedor', path: '/analitico-vendedor' },
      { id: 'an-region', label: 'Analítico Região', path: '/analitico-regiao' },
      { id: 'an-group', label: 'Analítico Grupos', path: '/analitico-grupo-clientes' },
      { id: 'an-product', label: 'Mix de Produtos', path: '/analitico-produto' },
      
      // Strategic
      { id: 'st-predictive', label: 'Preditiva de Vendas', path: '/analise-preditiva-vendas', icon: Zap },
      { id: 'st-abc', label: 'Curva ABC (Pareto)', path: '/curva-abc' },
      { id: 'st-churn', label: 'Análise de Churn', path: '/analise-churn', icon: AlertTriangle },
      { id: 'st-rfm', label: 'Segmentação RFM', path: '/calculo-rfm' },
      { id: 'st-seasonality', label: 'Sazonalidade', path: '/analise-sazonalidade' },
      { id: 'st-margin', label: 'Margem & Lucro', path: '/analise-margem' },
      { id: 'st-ticket', label: 'Ticket Médio', path: '/analise-valor-unitario' },
      { id: 'st-kpis', label: 'KPIs Consolidados', path: '/relatorio-desempenho-kpi' },
      { id: 'st-goals', label: 'Metas vs Realizado', path: '/relatorio-desempenho-meta' },
      { id: 'st-ranking', label: 'Ranking Performance', path: '/relatorio-desempenho-ranking' },
    ]
  },

  // 2. EQUIPMENT MODULE
  {
    id: 'equipment',
    label: 'Equipamentos',
    icon: Wrench,
    moduleId: 'equipment',
    subItems: [
      { id: 'eq-dashboard', label: 'Painel de Ativos', path: '/equipamentos-em-campo', icon: LayoutDashboard },
      { id: 'eq-list', label: 'Inventário Completo', path: '/equipamentos-lista', icon: List },
      { id: 'eq-maintenance', label: 'Gestão Manutenção', path: '/equipamentos-manutencao', icon: PenTool },
      { id: 'eq-movement', label: 'Movimentação', path: '/movimentacao-equipamentos', icon: TrendingUp },
      { id: 'eq-field', label: 'Em Campo', path: '/analitico-equipamento' },
      { id: 'eq-client', label: 'Por Cliente', path: '/analitico-equipamentos-cliente' },
      { id: 'eq-costs', label: 'Custos Operacionais', path: '/equipamentos-custos' },
      { id: 'eq-performance', label: 'Eficiência Ativos', path: '/equipamentos-performance' },
      { id: 'eq-reports', label: 'Relatórios Técnicos', path: '/equipamentos-relatorio' },
      { id: 'eq-history', label: 'Histórico de Trocas', path: '/movimentacao-equipamentos?tab=history' },
      { id: 'eq-audit', label: 'Auditoria Patrimônio', path: '/equipamentos-lista?audit=true' },
    ]
  },

  // 3. BONIFICAÇÕES MODULE
  {
    id: 'bonificacoes',
    label: 'Bonificações',
    icon: Gift,
    moduleId: 'bonificacoes',
    subItems: [
      { id: 'bon-dashboard', label: 'Dashboard', path: '/bonificacoes', icon: LayoutDashboard },
      { id: 'bon-calc', label: 'Calculadora', path: '/bonificacoes/calculadora', icon: Calculator },
      { id: 'bon-history', label: 'Histórico', path: '/bonificacoes/historico', icon: ScrollText },
      { id: 'bon-rules', label: 'Regras e Config.', path: '/bonificacoes/regras', icon: Sliders },
    ]
  },

  // 4. CRM MODULE
  {
    id: 'crm',
    label: 'CRM',
    icon: Users,
    moduleId: 'crm',
    crmRequired: true,
    subItems: [
      { id: 'crm-pipeline', label: 'Pipeline Vendas', path: '/crm/pipeline', icon: TrendingUp },
      { id: 'crm-negocios', label: 'Lista de Negócios', path: '/crm/negocios', icon: Briefcase },
      { id: 'crm-contatos', label: 'Base de Contatos', path: '/crm/contatos', icon: Contact2 },
      { id: 'crm-contratos', label: 'Contratos', path: '/crm/contratos', icon: FileText },
      { id: 'crm-automations', label: 'Automações', path: '/crm/automations', icon: Zap },
      { id: 'crm-reports', label: 'Relatórios Funil', path: '/crm/reports' },
      { id: 'crm-team', label: 'Performance Equipe', path: '/crm/team' },
    ]
  },

  // 5. DELIVERY MODULE
  {
    id: 'delivery',
    label: 'Entregas',
    icon: Truck,
    moduleId: 'delivery',
    subItems: [
      { id: 'del-dashboard', label: 'Painel Logístico', path: '/admin/delivery-management' }, // Keep existing dashboard
      { id: 'del-list', label: 'Lista de Entregas', path: '/entregas', icon: List },
      { id: 'del-routes', label: 'Rotas', path: '/entregas/rotas', icon: Map },
      { id: 'del-planning', label: 'Planejamento', path: '/entregas/rotas/planejamento' },
      { id: 'del-optimization', label: 'Otimização', path: '/entregas/rotas/otimizacao', icon: Zap },
      { id: 'del-tracking', label: 'Rastreamento', path: '/entregas/rastreamento', icon: MapPin },
      { id: 'del-history', label: 'Histórico', path: '/entregas/historico', icon: Clock },
      { id: 'del-drivers', label: 'Motoristas', path: '/admin/delivery-management/drivers' },
      { id: 'del-customers', label: 'Pontos Entrega', path: '/admin/delivery-management/customers' },
      { id: 'del-config', label: 'Configurações', path: '/admin/delivery-management/settings' },
    ]
  },

  // 6. APOIO (SUPPORT) MODULE
  {
    id: 'apoio',
    label: 'Apoio & Serviços',
    icon: LifeBuoy,
    moduleId: 'apoio',
    subItems: [
      { id: 'ap-tickets', label: 'Chamados', path: '/apoio/chamados', icon: Ticket },
      { id: 'ap-kb', label: 'Base de Conhecimento', path: '/apoio/base-conhecimento', icon: BookOpen },
      { id: 'ap-faq', label: 'FAQs', path: '/apoio/faqs', icon: HelpCircle },
      { id: 'ap-status', label: 'Status Serviços', path: '/apoio/status', icon: Activity },
      { id: 'ap-metrics', label: 'Métricas & SLA', path: '/apoio/metricas', icon: BarChart2 },
    ]
  },

  // 7. CONFIGURATION & ADMIN (STANDARDIZED)
  {
    id: 'config',
    label: 'Configurações',
    icon: Settings,
    moduleId: 'configuracoes',
    subItems: [
      // Group 1: Profile & General
      { id: 'cfg-profile', label: 'Meu Perfil', path: '/configuracoes/perfil', icon: User },
      { id: 'cfg-general', label: 'Geral', path: '/configuracoes', icon: Settings },
      
      // Group 2: Users & Permissions
      { id: 'cfg-users', label: 'Usuários', path: '/configuracoes/usuarios', icon: Users },
      { id: 'cfg-permissions', label: 'Permissões', path: '/configuracoes/permissoes', icon: Shield },
      { id: 'cfg-profiles', label: 'Perfis de Acesso', path: '/configuracoes/perfis' },
      
      // Group 3: Teams
      { id: 'cfg-teams', label: 'Equipes', path: '/configuracoes/equipes', icon: Users2 },
      { id: 'cfg-hierarchy', label: 'Hierarquia', path: '/configuracoes/hierarquia' },
      { id: 'cfg-territories', label: 'Territórios', path: '/configuracoes/territorios', icon: MapPin },
      
      // Group 4: Products
      { id: 'cfg-products', label: 'Produtos', path: '/configuracoes/produtos', icon: Package },
      { id: 'cfg-prices', label: 'Preços', path: '/configuracoes/precos', icon: DollarSign },
      { id: 'cfg-taxes', label: 'Impostos', path: '/configuracoes/impostos' },
      
      // Group 5: Goals
      { id: 'cfg-goals', label: 'Metas', path: '/configuracoes/metas', icon: Target },
      { id: 'cfg-commissions', label: 'Comissões', path: '/configuracoes/comissoes' },
      
      // Group 6: API & Integrations
      { id: 'cfg-integrations', label: 'Integrações', path: '/configuracoes/integracoes', icon: Zap },
      { id: 'cfg-api', label: 'API Keys', path: '/configuracoes/api-keys', icon: Key },
      { id: 'cfg-webhooks', label: 'Webhooks', path: '/configuracoes/webhooks', icon: Webhook },
      
      // Group 7: Logs
      { id: 'cfg-logs', label: 'Logs do Sistema', path: '/configuracoes/logs', icon: FileText },
      { id: 'cfg-audit', label: 'Auditoria', path: '/configuracoes/auditoria', icon: Shield },
    ]
  }
];