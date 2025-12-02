import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Zap,
  ChevronDown,
  Settings,
  LogOut,
  Search,
  Calendar,
  History,
  Shield,
  LineChart,
  PieChart,
  Package,
  Truck,
  Wrench,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const MENU_ITEMS = {
  admin: [
    {
      label: 'Dashboards',
      icon: LayoutDashboard,
      path: null,
      submenu: [
        { label: 'Principal', path: '/dashboard' },
        { label: 'Visão 360°', path: '/visao-360-cliente' },
      ]
    },
    {
      label: 'Analítico Geral',
      icon: BarChart3,
      path: null,
      submenu: [
        { label: 'Supervisor', path: '/analitico-supervisor' },
        { label: 'Vendedor', path: '/analitico-vendedor' },
        { label: 'Região', path: '/analitico-regiao' },
        { label: 'Grupo Clientes', path: '/analitico-grupo-clientes' },
        { label: 'Mix Produtos', path: '/analitico-produto' },
      ],
    },
    {
      label: 'Analíticos Diários',
      icon: Calendar,
      path: null,
      submenu: [
        { label: 'Vendas Diárias', path: '/analitico-vendas-diarias' },
      ],
    },
    {
      label: 'Análises Estratégicas',
      icon: LineChart,
      path: null,
      submenu: [
        { label: 'Previsão de Vendas', path: '/analise-preditiva-vendas' },
        { label: 'Curva ABC', path: '/curva-abc' },
        { label: 'Valor Unitário', path: '/analise-valor-unitario' },
        { label: 'Desempenho & Fidelidade', path: '/analise-desempenho-fidelidade' },
        { label: 'Sazonalidade', path: '/analise-sazonalidade' },
        { label: 'Margem', path: '/analise-margem' },
        { label: 'Churn (Perdas)', path: '/analise-churn' },
      ],
    },
    {
      label: 'Central Relatórios',
      icon: History,
      path: null,
      submenu: [
        { label: 'Dashboard Relatórios', path: '/relatorio-dashboard' },
        { label: 'Buscador', path: '/relatorio-buscador' },
        { label: 'Notificações', path: '/notificacoes' },
        { label: 'Agendamento', path: '/agendamento' },
        { label: 'Histórico', path: '/historico' },
      ]
    },
    {
      label: 'Relatórios Vendas',
      icon: TrendingUp,
      path: null,
      submenu: [
        { label: 'Diário', path: '/relatorio-vendas-diario' },
        { label: 'Mensal', path: '/relatorio-vendas-mensal' },
        { label: 'Anual', path: '/relatorio-vendas-anual' },
        { label: 'Por Vendedor', path: '/relatorio-vendas-por-vendedor' },
        { label: 'Por Região', path: '/relatorio-vendas-por-regiao' },
        { label: 'Por Cliente', path: '/relatorio-vendas-por-cliente' },
        { label: 'Por Produto', path: '/relatorio-vendas-por-produto' },
        { label: 'Comparativo', path: '/relatorio-vendas-comparativo' },
      ],
    },
    {
      label: 'Desempenho',
      icon: PieChart,
      path: null,
      submenu: [
        { label: 'Vendedor', path: '/relatorio-desempenho-vendedor' },
        { label: 'Supervisor', path: '/relatorio-desempenho-supervisor' },
        { label: 'Região', path: '/relatorio-desempenho-regiao' },
        { label: 'Meta', path: '/relatorio-desempenho-meta' },
        { label: 'KPI', path: '/relatorio-desempenho-kpi' },
        { label: 'Ranking', path: '/relatorio-desempenho-ranking' },
        { label: 'Evolução', path: '/relatorio-desempenho-evolucao' },
      ],
    },
    {
      label: 'Financeiro',
      icon: DollarSign,
      path: null,
      submenu: [
        { label: 'Receita', path: '/relatorio-financeiro-receita' },
        { label: 'Margem', path: '/relatorio-financeiro-margem' },
        { label: 'Fluxo Caixa', path: '/relatorio-financeiro-fluxo-caixa' },
        { label: 'Contas Receber', path: '/relatorio-financeiro-contas-receber' },
        { label: 'Custos', path: '/relatorio-financeiro-custos' },
        { label: 'Lucratividade', path: '/relatorio-financeiro-lucratividade' },
      ],
    },
    {
      label: 'Clientes',
      icon: Users,
      path: null,
      submenu: [
        { label: 'Carteira', path: '/relatorio-cliente-carteira' },
        { label: 'Segmentação', path: '/relatorio-cliente-segmentacao' },
        { label: 'Churn', path: '/relatorio-cliente-churn' },
        { label: 'LTV', path: '/relatorio-cliente-lifetime-value' },
        { label: 'Satisfação', path: '/relatorio-cliente-satisfacao' },
        { label: 'Histórico', path: '/relatorio-cliente-historico' },
      ],
    },
    {
      label: 'Módulos de Apoio',
      icon: Package,
      path: null,
      submenu: [
        { label: 'Equipamentos', path: '/equipamentos-lista' },
        { label: 'Bonificações', path: '/bonificacoes-lista' },
        { label: 'CRM', path: '/crm-clientes' },
      ]
    },
    {
      label: 'Operacional',
      icon: Zap,
      path: null,
      submenu: [
        { label: 'Estoque', path: '/relatorio-operacional-estoque' },
        { label: 'Pedidos', path: '/relatorio-operacional-pedidos' },
        { label: 'Entrega', path: '/relatorio-operacional-entrega' },
        { label: 'Devoluções', path: '/relatorio-operacional-devolucoes' },
        { label: 'Reclamações', path: '/relatorio-operacional-reclamacoes' },
        { label: 'SLA', path: '/relatorio-operacional-sla' },
      ],
    },
    {
      label: 'Diagnóstico',
      icon: Shield,
      path: null,
      submenu: [
        { label: 'Smoke Test', path: '/smoke-test' },
        { label: 'System Health', path: '/system-health' },
        { label: 'Acesso', path: '/access-control' },
      ]
    },
    {
      label: 'Configurações',
      icon: Settings,
      path: '/configuracoes',
      submenu: null,
    },
  ],
  // Outros perfis
  manager: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', submenu: null },
    { label: 'Visão 360°', icon: Search, path: '/visao-360-cliente', submenu: null },
    { label: 'Configurações', icon: Settings, path: '/settings', submenu: null },
  ],
  supervisor: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', submenu: null },
    { label: 'Visão 360°', icon: Search, path: '/visao-360-cliente', submenu: null },
    { label: 'Analítico Supervisor', icon: BarChart3, path: '/analitico-supervisor', submenu: null },
    { label: 'Analítico Vendedor', icon: Users, path: '/analitico-vendedor', submenu: null },
  ],
  seller: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', submenu: null },
    { label: 'Visão 360°', icon: Search, path: '/visao-360-cliente', submenu: null },
    { label: 'Analítico Vendedor', icon: Users, path: '/analitico-vendedor', submenu: null },
    { label: 'Meus Pedidos', icon: Package, path: '/relatorio-operacional-pedidos', submenu: null },
  ],
};

export const allMenuItems = MENU_ITEMS.admin;

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState({});

  const userRole = user?.role ? user.role.toLowerCase() : 'admin';
  const menuItems = MENU_ITEMS[userRole] || MENU_ITEMS.admin;

  // Inicializa expansão para itens que têm filhos ativos
  React.useEffect(() => {
    const newExpanded = {};
    menuItems.forEach(item => {
      if (item.submenu && item.submenu.some(sub => sub.path === location.pathname)) {
        newExpanded[item.label] = true;
      }
    });
    setExpandedItems(prev => ({ ...prev, ...newExpanded }));
  }, [location.pathname, menuItems]);

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActive = (path) => location.pathname === path;
  const isSubItemActive = (submenu) => submenu?.some(sub => sub.path === location.pathname);

  const renderMenuItems = (items) => {
    return items.map((item) => {
      const hasSubmenu = item.submenu && item.submenu.length > 0;
      const active = isActive(item.path);
      const childActive = hasSubmenu && isSubItemActive(item.submenu);
      const isExpanded = expandedItems[item.label];
      const Icon = item.icon;

      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => {
              if (hasSubmenu) {
                toggleExpand(item.label);
              }
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
              'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200',
              (active || (hasSubmenu && childActive)) && 'bg-primary/10 text-primary dark:text-primary font-medium'
            )}
          >
            {!hasSubmenu && item.path ? (
              <Link to={item.path} className="flex items-center gap-3 w-full">
                {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                <span className="flex-1 text-left truncate">{item.label}</span>
              </Link>
            ) : (
              <>
                {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                <span className="flex-1 text-left truncate">{item.label}</span>
                {hasSubmenu && (
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200 text-gray-400',
                      isExpanded && 'rotate-180'
                    )}
                  />
                )}
              </>
            )}
          </button>

          {hasSubmenu && isExpanded && (
            <div className="ml-4 pl-2 border-l-2 border-gray-100 dark:border-gray-800 mt-1 space-y-1">
              {item.submenu.map((subitem) => (
                <Link
                  key={subitem.label}
                  to={subitem.path}
                  className={cn(
                    'block w-full text-left px-3 py-2 rounded-md transition-colors text-sm',
                    'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
                    isActive(subitem.path) && 'bg-primary/5 text-primary font-medium'
                  )}
                >
                  {subitem.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 flex-shrink-0 h-16">
        <div className="bg-primary/10 p-2 rounded-lg">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">Horizon 360</h1>
          <p className="text-xs text-gray-500 mt-1 truncate max-w-[140px]">
            {user?.email || 'Visitante'}
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1 pb-4">
          {renderMenuItems(menuItems)}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex-shrink-0">
        <Button
          onClick={() => signOut()}
          variant="outline"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair do Sistema
        </Button>
      </div>
    </div>
  );
}