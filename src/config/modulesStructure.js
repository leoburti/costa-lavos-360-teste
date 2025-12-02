import { 
  LayoutDashboard, Users, Wrench, Truck, LifeBuoy, Settings, 
  BarChart3, PieChart, Map, AlertCircle, Zap, Contact2, 
  List, PenTool, Package, Ticket, BookOpen, Shield, Database, 
  Save, Globe, FileText, CheckSquare, Target,
  Gift, PlusCircle, Calculator, History
} from 'lucide-react';

export const modulesStructure = [
  // --- MÓDULO 1: ANALYTICS ---
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    color: '#DC2626',
    path: '/analytics',
    description: 'Dashboards e indicadores de performance',
    groups: [
      {
        id: 'dashboards',
        label: 'Dashboards',
        pages: [
          { id: 'dashboard-gerencial', label: 'Visão Gerencial', icon: LayoutDashboard, path: '/analytics/dashboard-gerencial' },
          { id: 'visao-360-cliente', label: 'Visão 360° Cliente', icon: Users, path: '/analytics/visao-360-cliente' },
          { id: 'analitico-vendas-diarias', label: 'Vendas Diárias', icon: BarChart3, path: '/analytics/analitico-vendas-diarias' }
        ]
      },
      {
        id: 'analitico',
        label: 'Analítico',
        pages: [
          { id: 'analitico-supervisor', label: 'Supervisor', icon: Users, path: '/analytics/analitico-supervisor' },
          { id: 'analitico-vendedor', label: 'Vendedor', icon: Contact2, path: '/analytics/analitico-vendedor' },
          { id: 'analitico-regiao', label: 'Região', icon: Map, path: '/analytics/analitico-regiao' },
          { id: 'analitico-produto', label: 'Produto', icon: Package, path: '/analytics/analitico-produto' },
          { id: 'analitico-grupo-clientes', label: 'Grupo de Clientes', icon: Users, path: '/analytics/analitico-grupo-clientes' }
        ]
      },
      {
        id: 'estrategico',
        label: 'Estratégico',
        pages: [
          { id: 'analise-churn', label: 'Análise de Churn', icon: AlertCircle, path: '/analytics/analise-churn' },
          { id: 'analise-preditiva', label: 'Preditiva Vendas', icon: Zap, path: '/analytics/analise-preditiva' },
          { id: 'analise-fidelidade', label: 'Fidelidade (RFM)', icon: Target, path: '/analytics/analise-fidelidade' },
          { id: 'curva-abc', label: 'Curva ABC', icon: BarChart3, path: '/analytics/curva-abc' },
          { id: 'analise-margem', label: 'Análise de Margem', icon: PieChart, path: '/analytics/analise-margem' },
          { id: 'analise-ticket-medio', label: 'Ticket Médio', icon: BarChart3, path: '/analytics/analise-ticket-medio' }
        ]
      }
    ]
  },

  // --- MÓDULO 2: CRM ---
  {
    id: 'crm',
    label: 'CRM',
    icon: Users,
    color: '#3B82F6',
    path: '/crm',
    description: 'Gestão de relacionamento com clientes',
    groups: [
      {
        id: 'vendas',
        label: 'Vendas',
        pages: [
          { id: 'pipeline', label: 'Pipeline', icon: Zap, path: '/crm/pipeline' },
          { id: 'oportunidades', label: 'Oportunidades', icon: Package, path: '/crm/oportunidades' },
          { id: 'atividades', label: 'Atividades', icon: List, path: '/crm/atividades' }
        ]
      },
      {
        id: 'cadastros',
        label: 'Cadastros',
        pages: [
          { id: 'contatos', label: 'Contatos', icon: Contact2, path: '/crm/contatos' },
          { id: 'clientes', label: 'Clientes', icon: Users, path: '/crm/clientes' }
        ]
      },
      {
        id: 'gestao',
        label: 'Gestão',
        pages: [
          { id: 'relatorios', label: 'Relatórios CRM', icon: FileText, path: '/crm/relatorios' },
          { id: 'configuracao', label: 'Configuração', icon: Settings, path: '/crm/configuracao' }
        ]
      }
    ]
  },

  // --- MÓDULO 3: EQUIPAMENTOS ---
  {
    id: 'equipment',
    label: 'Equipamentos',
    icon: Wrench,
    color: '#10B981',
    path: '/equipment',
    description: 'Gestão de ativos e manutenção',
    groups: [
      {
        id: 'gestao',
        label: 'Gestão',
        pages: [
          { id: 'inventario', label: 'Inventário', icon: List, path: '/equipment/inventario' },
          { id: 'equipamentos-novo', label: 'Novo Equipamento', icon: Package, path: '/equipment/novo' }
        ]
      },
      {
        id: 'servicos',
        label: 'Serviços',
        pages: [
          { id: 'manutencao', label: 'Manutenção', icon: PenTool, path: '/equipment/manutencao' },
          { id: 'performance', label: 'Performance', icon: BarChart3, path: '/equipment/performance' },
          { id: 'custos', label: 'Custos', icon: PieChart, path: '/equipment/custos' }
        ]
      }
    ]
  },

  // --- MÓDULO 4: DELIVERY ---
  {
    id: 'delivery',
    label: 'Entregas',
    icon: Truck,
    color: '#F59E0B',
    path: '/delivery',
    description: 'Logística e distribuição',
    groups: [
      {
        id: 'logistica',
        label: 'Logística',
        pages: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/delivery/dashboard' },
          { id: 'rotas', label: 'Rotas', icon: Map, path: '/delivery/rotas' },
          { id: 'entregas', label: 'Entregas', icon: Package, path: '/delivery/entregas' },
          { id: 'motoristas', label: 'Motoristas', icon: Truck, path: '/delivery/motoristas' },
          { id: 'clientes', label: 'Clientes', icon: Users, path: '/delivery/clientes' }
        ]
      }
    ]
  },

  // --- MÓDULO 5: APOIO (RENOMEADO) ---
  {
    id: 'apoio',
    label: 'Apoio',
    icon: LifeBuoy,
    color: '#8B5CF6',
    path: '/apoio',
    description: 'Atendimento e suporte técnico',
    groups: [
      {
        id: 'atendimento',
        label: 'Atendimento',
        pages: [
          { id: 'chamados', label: 'Chamados', icon: Ticket, path: '/apoio/chamados' },
          { id: 'kb', label: 'Base de Conhecimento', icon: BookOpen, path: '/apoio/kb' }
        ]
      }
    ]
  },

  // --- MÓDULO 6: BONIFICAÇÕES ---
  {
    id: 'bonificacoes',
    label: 'Bonificações',
    icon: Gift,
    color: '#EC4899',
    path: '/bonificacoes',
    description: 'Gestão de Bonificações',
    groups: [
      {
        id: 'gestao',
        label: 'Gestão',
        pages: [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/bonificacoes/dashboard' },
          { id: 'lista', label: 'Listagem', icon: List, path: '/bonificacoes/lista' },
          { id: 'novo', label: 'Nova Bonificação', icon: PlusCircle, path: '/bonificacoes/novo' },
          { id: 'calculadora', label: 'Calculadora', icon: Calculator, path: '/bonificacoes/calculadora' },
          { id: 'historico', label: 'Histórico', icon: History, path: '/bonificacoes/historico' },
          { id: 'regras', label: 'Regras', icon: Settings, path: '/bonificacoes/regras' }
        ]
      },
      {
        id: 'analise',
        label: 'Análise',
        pages: [
          { id: 'relatorio', label: 'Relatório', icon: FileText, path: '/bonificacoes/relatorio' },
          { id: 'configuracao', label: 'Configuração', icon: Settings, path: '/bonificacoes/configuracao' }
        ]
      }
    ]
  },

  // --- MÓDULO 7: CONFIGURAÇÕES ---
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    color: '#6B7280',
    path: '/configuracoes',
    description: 'Administração do sistema',
    groups: [
      {
        id: 'sistema',
        label: 'Sistema',
        pages: [
          { id: 'geral', label: 'Geral', icon: Settings, path: '/configuracoes/geral' },
          { id: 'integracao', label: 'Integrações', icon: Globe, path: '/configuracoes/integracao' },
          { id: 'backup', label: 'Backup & Restore', icon: Save, path: '/configuracoes/backup' },
          { id: 'auditoria', label: 'Auditoria', icon: Database, path: '/configuracoes/auditoria' }
        ]
      },
      {
        id: 'acesso',
        label: 'Controle de Acesso',
        pages: [
          { id: 'usuarios', label: 'Usuários', icon: Users, path: '/configuracoes/usuarios' },
          { id: 'permissoes', label: 'Permissões', icon: Shield, path: '/configuracoes/permissoes' }
        ]
      }
    ]
  }
];