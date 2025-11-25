
import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, MessageSquare, LineChart, BarChartHorizontal, Settings, X, Truck, Users, BarChart3, LogOut, KeyRound as UsersRound, GanttChartSquare, Bot, Users2, KeyRound, CalendarCheck, FileSignature, Route, ShieldCheck, Box, History, FilePieChart, Wrench, Briefcase, Gift, ListTodo, HeartHandshake as Handshake, Package, FileText, FilePlus, FileMinus, Repeat, Bell, FileQuestion, ClipboardList, CalendarDays, CalendarClock, CalendarX, AlertTriangle, MapPin, Compass, Database, PlugZap, LifeBuoy, RotateCcw, TrendingUp, Calendar, AlertCircle, Clock, CheckCircle, XCircle, Lock, Archive, Navigation, Loader2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import LoadingSpinner from './LoadingSpinner';

// Centralized menu definition with module IDs matching the DB config
export const allMenuItems = [
  { path: '/dashboard', id: 'dashboard_comercial', label: 'Dashboard Comercial', icon: LayoutGrid, moduleId: 'dashboard_comercial' },
  { path: '/ai-chat', id: 'senhor_lavos', label: 'Senhor Lavos', icon: MessageSquare, moduleId: 'senhor_lavos' },
  {
    id: 'analytics', label: 'Analytics', icon: LineChart, moduleId: 'analytics',
    subItems: [
      { path: '/analitico-supervisor', id: 'analitico_supervisor', label: 'Supervisor', moduleId: 'analytics' },
      { path: '/analitico-vendedor', id: 'analitico_vendedor', label: 'Vendedor', moduleId: 'analytics' },
      { path: '/analitico-regiao', id: 'analitico_regiao', label: 'Região', moduleId: 'analytics' },
      { path: '/analitico-grupo-clientes', id: 'analitico_grupo_clientes', label: 'Grupos de Clientes', moduleId: 'analytics' },
      { path: '/analitico-produto', id: 'analitico_produto', label: 'Produto', moduleId: 'analytics' },
      { path: '/visao-360-cliente', id: 'visao_360_cliente', label: 'Visão 360° Cliente', moduleId: 'analytics' },
    ]
  },
  {
    id: 'commercial-analysis', label: 'Análise Comercial', icon: BarChartHorizontal, moduleId: 'commercial-analysis',
    subItems: [
      { path: '/analitico-vendas-diarias', id: 'analitico_vendas_diarias', label: 'Vendas Diárias', moduleId: 'commercial-analysis' },
      { path: '/analise-churn', id: 'analise_churn', label: 'Análise de Churn', moduleId: 'commercial-analysis' },
      { path: '/curva-abc', id: 'curva_abc', label: 'Curva ABC', moduleId: 'commercial-analysis' },
      { path: '/calculo-rfm', id: 'calculo_rfm', label: 'Cálculo RFM', moduleId: 'commercial-analysis' },
      { path: '/tendencia-vendas', id: 'tendencia_vendas', label: 'Tendência de Vendas', moduleId: 'commercial-analysis' },
      { path: '/analise-valor-unitario', id: 'analise_valor_unitario', label: 'Análise Valor Unitário', moduleId: 'commercial-analysis' },
      { path: '/baixo-desempenho', id: 'baixo_desempenho', label: 'Baixo Desempenho', moduleId: 'commercial-analysis' },
      { path: '/analise-fidelidade', id: 'analise_fidelidade', label: 'Análise de Fidelidade', moduleId: 'commercial-analysis' },
      {
        id: 'bonificados', label: 'Bonificados', moduleId: 'commercial-analysis',
        subItems: [
          { path: '/produtos-bonificados', id: 'produtos_bonificados', label: 'Visão Geral', moduleId: 'commercial-analysis' },
          { path: '/performance-bonificados', id: 'performance_bonificados', label: '% Performance', moduleId: 'commercial-analysis' },
          { path: '/analitico-bonificados', id: 'analitico_bonificados', label: 'Analítico', moduleId: 'commercial-analysis' },
        ]
      },
      {
        id: 'equipamentos', label: 'Equipamentos', moduleId: 'commercial-analysis',
        subItems: [
          { path: '/movimentacao-equipamentos', id: 'movimentacao_equipamentos', label: 'Movimentação', moduleId: 'commercial-analysis' },
          { path: '/analitico-equipamentos-cliente', id: 'analitico_equipamentos_cliente', label: 'Análise por Cliente', moduleId: 'commercial-analysis' },
          { path: '/analitico-equipamento', id: 'analitico_equipamento', label: 'Análise por Equipamento', moduleId: 'commercial-analysis' },
          { path: '/equipamentos-em-campo', id: 'equipamentos_em_campo', label: 'Equipamentos em Campo', moduleId: 'commercial-analysis' },
        ]
      },
    ]
  },
  {
    id: 'managerial-analysis', label: 'Análise Gerencial', icon: Briefcase, moduleId: 'managerial-analysis',
    subItems: [
        {
            id: 'raio-x', label: 'Raio-X', moduleId: 'managerial-analysis',
            subItems: [
                { path: '/raio-x-supervisor', id: 'raio_x_supervisor', label: 'Supervisor', moduleId: 'managerial-analysis' },
                { path: '/raio-x-vendedor', id: 'raio_x_vendedor', label: 'Vendedor', moduleId: 'managerial-analysis' },
            ]
        }
    ]
  },
  {
    id: 'apoio', label: 'APoio', icon: LifeBuoy, moduleId: 'apoio',
    subItems: [
      {
        id: 'apoio_comodato', label: 'Comodato', icon: Package, moduleId: 'apoio',
        subItems: [
          { path: '/apoio/comodato/clientes', id: 'apoio_comodato_clientes', label: 'Clientes', icon: Users, moduleId: 'apoio' },
          { path: '/apoio/comodato/modelos', id: 'apoio_comodato_modelos', label: 'Modelos de Equip.', icon: Package, moduleId: 'apoio' },
          { path: '/apoio/comodato/entrega', id: 'apoio_comodato_entrega', label: 'Solicitar Entrega', icon: Truck, moduleId: 'apoio' },
          { path: '/apoio/comodato/troca', id: 'apoio_comodato_troca', label: 'Solicitar Troca', icon: RotateCcw, moduleId: 'apoio' },
          { path: '/apoio/comodato/retirada', id: 'apoio_comodato_retirada', label: 'Solicitar Retirada', icon: LogOut, moduleId: 'apoio' }
        ]
      },
      {
        id: 'apoio_chamados', label: 'Chamados', icon: MessageSquare, moduleId: 'apoio',
        subItems: [
          { path: '/apoio/chamados/todos', id: 'apoio_chamados_todos', label: 'Todos', icon: MessageSquare, moduleId: 'apoio' },
          { path: '/apoio/chamados/abertos', id: 'apoio_chamados_abertos', label: 'Abertos', icon: AlertCircle, moduleId: 'apoio' },
          { path: '/apoio/chamados/em-andamento', id: 'apoio_chamados_em_andamento', label: 'Em Andamento', icon: Clock, moduleId: 'apoio' },
          { path: '/apoio/chamados/resolvidos', id: 'apoio_chamados_resolvidos', label: 'Resolvidos', icon: CheckCircle, moduleId: 'apoio' },
          { path: '/apoio/chamados/fechados', id: 'apoio_chamados_fechados', label: 'Fechados', icon: XCircle, moduleId: 'apoio' }
        ]
      },
      {
        id: 'apoio_agenda', label: 'Agenda', icon: Calendar, moduleId: 'apoio',
        subItems: [
          { path: '/apoio/agenda/minha-agenda', id: 'apoio_agenda_minha', label: 'Minha Agenda', icon: Calendar, moduleId: 'apoio' },
          { path: '/apoio/agenda/equipe', id: 'apoio_agenda_equipe', label: 'Agenda da Equipe', icon: Users, moduleId: 'apoio' },
          { path: '/apoio/agenda/disponibilidade', id: 'apoio_agenda_disponibilidade', label: 'Disponibilidade', icon: CalendarCheck, moduleId: 'apoio' },
          { path: '/apoio/agenda/bloqueios', id: 'apoio_agenda_bloqueios', label: 'Bloqueios', icon: Lock, moduleId: 'apoio' },
          { path: '/apoio/agenda/conflitos', id: 'apoio_agenda_conflitos', label: 'Conflitos', icon: AlertCircle, moduleId: 'apoio' }
        ]
      },
      {
        id: 'apoio_notificacoes_module', label: 'Notificações', icon: Bell, moduleId: 'apoio',
        subItems: [
          { path: '/apoio/notificacoes/minhas', id: 'apoio_notificacoes_minhas', label: 'Minhas Notificações', icon: Bell, moduleId: 'apoio' },
          { path: '/apoio/notificacoes/nao-lidas', id: 'apoio_notificacoes_nao_lidas', label: 'Não Lidas', icon: AlertCircle, moduleId: 'apoio' },
          { path: '/apoio/notificacoes/arquivadas', id: 'apoio_notificacoes_arquivadas', label: 'Arquivadas', icon: Archive, moduleId: 'apoio' },
          { path: '/apoio/notificacoes/preferencias', id: 'apoio_notificacoes_preferencias', label: 'Preferências', icon: Settings, moduleId: 'apoio' }
        ]
      },
      {
        id: 'apoio_geo_checkin', label: 'Geolocalização', icon: MapPin, moduleId: 'apoio',
        subItems: [
          { path: '/apoio/geolocalizacao/checkin-checkout', id: 'apoio_geo_checkin_checkout', label: 'Check-in/Check-out', icon: MapPin, moduleId: 'apoio' },
          { path: '/apoio/geolocalizacao/rastreamento', id: 'apoio_geo_rastreamento', label: 'Rastreamento', icon: Navigation, moduleId: 'apoio' },
          { path: '/apoio/geolocalizacao/rotas', id: 'apoio_geo_rotas', label: 'Rotas', icon: Route, moduleId: 'apoio' },
          { path: '/apoio/geolocalizacao/historico', id: 'apoio_geo_historico', label: 'Histórico', icon: History, moduleId: 'apoio' },
          { path: '/apoio/geolocalizacao/relatorios', id: 'apoio_geo_relatorios', label: 'Relatórios', icon: BarChart3, moduleId: 'apoio' }
        ]
      },
      {
        id: 'apoio_relatorios', label: 'Relatórios', icon: BarChart3, moduleId: 'apoio',
        subItems: [
          { path: '/apoio/relatorios/dashboard', id: 'apoio_rel_dashboard', label: 'Dashboard', icon: BarChart3, moduleId: 'apoio' },
          { path: '/apoio/relatorios/operacional', id: 'apoio_rel_operacional', label: 'Operacional', icon: TrendingUp, moduleId: 'apoio' },
          { path: '/apoio/relatorios/alertas', id: 'apoio_rel_alertas', label: 'Alertas', icon: AlertTriangle, moduleId: 'apoio' },
          { path: '/apoio/relatorios/personalizado', id: 'apoio_rel_personalizado', label: 'Personalizado', icon: Settings, moduleId: 'apoio' }
        ]
      }
    ]
  },
  { path: '/bonificacoes', id: 'bonificacoes_module', label: 'Bonificações', icon: Gift, moduleId: 'bonificacoes_module' },
  { path: '/tarefas', id: 'tarefas', label: 'Tarefas', icon: ListTodo, moduleId: 'tarefas' },
  {
    id: 'manutencao_equip', label: 'Manutenção Equip.', icon: Wrench, moduleId: 'manutencao_equip',
    subItems: [
        { path: '/manutencao', id: 'manutencao', label: 'Painel de Manutenção', moduleId: 'manutencao_equip' },
    ]
  },
  {
    id: 'delivery', label: 'Gestão de Entregas', icon: Truck, moduleId: 'delivery',
    subItems: [
        { path: '/admin/delivery-management', id: 'delivery_dashboard', label: 'Dashboard', moduleId: 'delivery' },
        { path: '/admin/delivery-management/deliveries', id: 'delivery_management', label: 'Gestão de Entregas', icon: Box, moduleId: 'delivery' },
        { path: '/admin/delivery-management/drivers', id: 'delivery_drivers', label: 'Cadastro de Motoristas', icon: Users2, moduleId: 'delivery' },
        { path: '/admin/delivery-management/route-optimization', id: 'delivery_route_optimization', label: 'Otimização de Rotas', icon: Route, moduleId: 'delivery' },
        { path: '/admin/delivery-management/customers', id: 'delivery_customers', label: 'Gerenciamento de Clientes', icon: Users, moduleId: 'delivery' },
        { path: '/admin/delivery-management/disputes', id: 'delivery_disputes', label: 'Gerenciamento de Contestações', icon: ShieldCheck, moduleId: 'delivery' },
        { path: '/admin/delivery-management/reports', id: 'delivery_reports', label: 'Relatórios', icon: FilePieChart, moduleId: 'delivery' },
        { path: '/admin/delivery-management/delivery-receipts', id: 'delivery_receipts', label: 'Protocolos de Entrega', icon: History, moduleId: 'delivery' },
        { path: '/admin/delivery-management/settings', id: 'delivery_settings', label: 'Configurações', icon: Wrench, moduleId: 'delivery' },
    ]
  },
  {
    id: 'crm', label: 'CRM', icon: UsersRound,
    crmRequired: true, moduleId: 'crm',
    subItems: [
      { path: '/crm/pipeline', id: 'crm_pipeline', label: 'Pipeline', icon: GanttChartSquare, moduleId: 'crm' },
      { path: '/crm/contacts', id: 'crm_contacts', label: 'Contatos', icon: Users, moduleId: 'crm' },
      { path: '/crm/comodato-contracts', id: 'crm_comodato_contracts', label: 'Contratos de Comodato', icon: FileSignature, moduleId: 'crm' },
      { path: '/crm/automations', id: 'crm_automations', label: 'Automações', icon: Bot, moduleId: 'crm' },
      { path: '/crm/reports', id: 'crm_reports', label: 'Relatórios', icon: BarChart3, moduleId: 'crm' },
      { path: '/crm/team', id: 'crm_team', label: 'Equipe', icon: Users2, moduleId: 'crm' },
    ]
  },
  { 
    path: '/settings', 
    id: 'settings_users', 
    label: 'Gestão de Usuários', 
    icon: Users, 
    moduleId: 'settings_users'
  },
  {
    path: '/configuracoes',
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    moduleId: 'configuracoes'
  }
];

const NavLink = ({ item, isSubItem = false, closeSidebar }) => {
    const location = useLocation();
    const isActive = item.path && location.pathname.startsWith(item.path);

    const linkClasses = cn(
        "flex items-center gap-3 rounded-md text-sm font-medium transition-colors duration-200",
        isSubItem ? "py-2 pl-11 pr-3" : "px-3 py-2",
        isActive
            ? "bg-secondary text-secondary-foreground" // Use secondary for active background
            : "text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground"
    );

    return (
        <Link to={item.path} onClick={closeSidebar} className={linkClasses}>
            {item.icon && <item.icon size={isSubItem ? 18 : 20} />}
            <span>{item.label}</span>
        </Link>
    );
};

// Strictly filters based on the Module IDs returned by the RPC merge
const filterMenuByPermissions = (menu, userContext) => {
    if (!userContext) {
        return [];
    }
    
    const { role, canAccessCrm, modulePermissions } = userContext;
    const permissions = modulePermissions || {};
    
    // Strict Admin check - Case insensitive
    const isUniversalAdmin = ['admin', 'nivel 1', 'nível 1'].includes(role?.toLowerCase());

    const filter = (items) => items.map(item => {
        // 1. Universal Admin Override
        if (isUniversalAdmin) {
            if (item.subItems) {
                const accessibleSubItems = filter(item.subItems);
                return { ...item, subItems: accessibleSubItems };
            }
            return item;
        }

        // 2. Explicit Module Check
        let hasModuleAccess = false;
        
        if (!item.moduleId) {
            // If item has no moduleId, it's considered public/shared unless restricted otherwise
            hasModuleAccess = true;
        } else {
            // Check precise permission key. MUST BE STRICT TRUE.
            if (permissions[item.moduleId] === true) {
                hasModuleAccess = true;
            }
        }

        if (!hasModuleAccess) {
            return null;
        }

        // 3. Process Sub-items recursively
        if (item.subItems) {
            const accessibleSubItems = filter(item.subItems);
            // Only show parent if it has at least one accessible child
            if (accessibleSubItems.length > 0) {
                return { ...item, subItems: accessibleSubItems };
            }
            // If no children are accessible, hide the parent
            return null;
        }
        
        return item;
    }).filter(Boolean);

    return filter(menu);
};


const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();
    const { user, userContext, signOut, loading } = useAuth();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const menuItems = useMemo(() => {
        if (loading && !userContext) {
            return [];
        }
        return filterMenuByPermissions(allMenuItems, userContext);
    }, [userContext, loading]);


    const handleLogout = async () => {
        setIsLoggingOut(true);
        await signOut();
        navigate('/login');
        setIsLoggingOut(false);
    };

    const getActiveAccordionValues = () => {
      if (loading && !userContext) return [];
      const activeValues = [];
      const checkItems = (items, parentId = '') => {
        items.forEach(item => {
          const currentId = parentId ? `${parentId}-${item.id}` : item.id;
          if (item.subItems) {
            const isActive = item.subItems.some(sub => 
              (sub.path && location.pathname.startsWith(sub.path)) || 
              (sub.subItems && sub.subItems.some(nested => nested.path && location.pathname.startsWith(nested.path)))
            );
            if (isActive) {
              activeValues.push(currentId);
            }
            checkItems(item.subItems, currentId);
          }
        });
      };
      checkItems(menuItems);
      return activeValues;
    };

    const SidebarContent = ({ closeSidebar }) => (
        <div className="flex flex-col h-full bg-primary text-primary-foreground">
            <div className="p-4 border-b border-white/10 flex items-center gap-3 h-16 shrink-0">
                <img alt="Costa Lavos Logo" className="h-10 w-auto" src="https://horizons-cdn.hostinger.com/af07f265-a066-448a-97b1-ed36097a0659/702b0260ab5ec21070e294c9fe739730.png" />
                <div>
                    <p className="font-bold text-lg leading-tight">Costa Lavos</p>
                    <p className="text-xs text-primary-foreground/60">Dashboard Comercial</p>
                </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
                {(loading && !userContext) ? (
                    <div className="flex justify-center items-center h-full">
                        <LoadingSpinner message="Carregando menu..." />
                    </div>
                ) : menuItems.length > 0 ? (
                    <Accordion type="multiple" defaultValue={getActiveAccordionValues()} className="w-full space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.subItems?.some(sub => location.pathname.startsWith(sub.path));

                            if (item.subItems) {
                                return (
                                    <AccordionItem key={item.id} value={item.id} className="border-none">
                                        <AccordionTrigger className={cn(
                                            "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/10 text-primary-foreground/80 hover:text-primary-foreground hover:no-underline",
                                            isActive && "bg-secondary text-secondary-foreground" // Use secondary for active background
                                        )}>
                                            <div className="flex items-center gap-3">
                                                {Icon && <Icon size={20} />}
                                                <span>{item.label}</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pt-1 pl-4">
                                            <Accordion type="multiple" defaultValue={getActiveAccordionValues()} className="w-full space-y-1">
                                                {item.subItems.map((subItem) => {
                                                    const SubIcon = subItem.icon;
                                                    const isSubActive = subItem.path ? location.pathname.startsWith(subItem.path) : subItem.subItems?.some(nested => location.pathname.startsWith(nested.path));

                                                    if (subItem.subItems) {
                                                        return (
                                                            <AccordionItem key={subItem.id} value={`${item.id}-${subItem.id}`} className="border-none">
                                                                <AccordionTrigger className={cn(
                                                                    "flex items-center justify-between w-full py-2 pl-4 pr-3 rounded-md text-sm font-medium transition-colors hover:bg-white/10 text-primary-foreground/70 hover:text-primary-foreground hover:no-underline",
                                                                    isSubActive && "bg-secondary text-secondary-foreground" // Use secondary for active background
                                                                )}>
                                                                    <div className="flex items-center gap-2">
                                                                        {SubIcon && <SubIcon size={18} />}
                                                                        <span>{subItem.label}</span>
                                                                    </div>
                                                                </AccordionTrigger>
                                                                <AccordionContent className="pt-1 pl-8 space-y-1">
                                                                    {subItem.subItems.map((nestedItem) => (
                                                                        <NavLink key={nestedItem.id} item={nestedItem} isSubItem closeSidebar={closeSidebar} />
                                                                    ))}
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        );
                                                    }
                                                    return <NavLink key={subItem.id} item={subItem} isSubItem closeSidebar={closeSidebar} />;
                                                })}
                                            </Accordion>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            }
                            return <NavLink key={item.id} item={item} closeSidebar={closeSidebar} />;
                        })}
                    </Accordion>
                ) : (
                    <div className="text-center text-primary-foreground/60 p-4">Nenhum item de menu disponível. Verifique suas permissões.</div>
                )}
            </nav>
            <div className="p-4 mt-auto shrink-0 border-t border-white/10 space-y-2">
                {user && userContext ? (
                    <>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" title={user.email}>{userContext?.fullName || user.email}</p>
                            <p className="text-xs text-primary-foreground/60">{userContext?.role}</p>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            <TooltipProvider>
                                <ChangePasswordDialog />
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={handleLogout}
                                            disabled={isLoggingOut}
                                            className="text-primary-foreground/70 hover:bg-white/10 hover:text-primary-foreground shrink-0"
                                        >
                                            {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-5 w-5" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Sair</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </>
                ) : (
                    <button className="w-full text-center text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                        O amor pelo pão nos conecta
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            <div className="hidden lg:flex lg:w-64 lg:shrink-0">
              <SidebarContent closeSidebar={() => setSidebarOpen(false)} />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                  />
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed top-0 left-0 bottom-0 w-64 bg-primary z-50"
                  >
                    <SidebarContent closeSidebar={() => setSidebarOpen(false)} />
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="absolute top-5 right-[-44px] text-primary-foreground/70 bg-primary p-2 rounded-r-lg"
                      aria-label="Fechar menu"
                    >
                      <X size={24} />
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
        </>
    );
}

export default Sidebar;
