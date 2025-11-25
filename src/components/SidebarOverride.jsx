
import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  BarChart2,
  Users,
  MapPin,
  TrendingUp,
  Gift,
  Wrench,
  Briefcase,
  CheckSquare,
  Truck,
  FileText,
  LifeBuoy,
  Calendar,
  Settings,
  Shield,
  Link as LinkIcon,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define menu structure locally to ensure stability and no external dependency breakage
const allMenuItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'ai-chat', label: 'AI Chat', path: '/ai-chat', icon: MessageSquare },
  {
    id: 'analitico',
    label: 'Analítico',
    icon: BarChart2,
    subItems: [
      { id: 'analitico-supervisor', label: 'Supervisor', path: '/analitico-supervisor', icon: Users },
      { id: 'analitico-vendedor', label: 'Vendedor', path: '/analitico-vendedor', icon: Users },
      { id: 'analitico-regiao', label: 'Região', path: '/analitico-regiao', icon: MapPin },
      { id: 'analitico-grupo', label: 'Grupo Clientes', path: '/analitico-grupo-clientes', icon: Users },
      { id: 'analitico-produto', label: 'Produto', path: '/analitico-produto', icon: BarChart2 },
      { id: 'visao-360', label: 'Visão 360 Cliente', path: '/visao-360-cliente', icon: Users },
    ]
  },
  {
    id: 'comercial',
    label: 'Comercial',
    icon: TrendingUp,
    subItems: [
      { id: 'vendas-diarias', label: 'Vendas Diárias', path: '/analitico-vendas-diarias', icon: BarChart2 },
      { id: 'churn', label: 'Análise Churn', path: '/analise-churn', icon: BarChart2 },
      { id: 'curva-abc', label: 'Curva ABC', path: '/curva-abc', icon: BarChart2 },
      { id: 'rfm', label: 'Cálculo RFM', path: '/calculo-rfm', icon: BarChart2 },
      { id: 'tendencia', label: 'Tendência', path: '/tendencia-vendas', icon: TrendingUp },
      { id: 'valor-unitario', label: 'Valor Unitário', path: '/analise-valor-unitario', icon: BarChart2 },
      { id: 'baixo-desempenho', label: 'Baixo Desempenho', path: '/baixo-desempenho', icon: TrendingUp },
      { id: 'fidelidade', label: 'Fidelidade', path: '/analise-fidelidade', icon: Users },
      { id: 'bonificados', label: 'Bonificados', path: '/produtos-bonificados', icon: Gift },
      { id: 'performance-bonificados', label: 'Performance Bonif.', path: '/performance-bonificados', icon: BarChart2 },
      { id: 'analitico-bonificados', label: 'Analítico Bonif.', path: '/analitico-bonificados', icon: BarChart2 },
    ]
  },
  {
    id: 'equipamentos',
    label: 'Equipamentos',
    icon: Wrench,
    subItems: [
      { id: 'movimentacao', label: 'Movimentação', path: '/movimentacao-equipamentos', icon: TrendingUp },
      { id: 'por-cliente', label: 'Por Cliente', path: '/analitico-equipamentos-cliente', icon: BarChart2 },
      { id: 'por-equipamento', label: 'Por Equipamento', path: '/analitico-equipamento', icon: Wrench },
      { id: 'em-campo', label: 'Em Campo', path: '/equipamentos-em-campo', icon: MapPin },
    ]
  },
  {
    id: 'gestao',
    label: 'Gestão',
    icon: Briefcase,
    subItems: [
      { id: 'raio-x-supervisor', label: 'Raio-X Supervisor', path: '/raio-x-supervisor', icon: Users },
      { id: 'raio-x-vendedor', label: 'Raio-X Vendedor', path: '/raio-x-vendedor', icon: Users },
    ]
  },
  { id: 'bonificacoes', label: 'Bonificações', path: '/bonificacoes', icon: Gift },
  { id: 'tarefas', label: 'Tarefas', path: '/tarefas', icon: CheckSquare },
  {
    id: 'delivery',
    label: 'Entregas',
    icon: Truck,
    subItems: [
      { id: 'delivery-dash', label: 'Dashboard', path: '/admin/delivery-management', icon: LayoutDashboard },
      { id: 'delivery-list', label: 'Entregas', path: '/admin/delivery-management/deliveries', icon: Truck },
      { id: 'delivery-drivers', label: 'Motoristas', path: '/admin/delivery-management/drivers', icon: Users },
      { id: 'delivery-routes', label: 'Rotas', path: '/admin/delivery-management/route-optimization', icon: MapPin },
      { id: 'delivery-customers', label: 'Clientes', path: '/admin/delivery-management/customers', icon: Users },
      { id: 'delivery-disputes', label: 'Disputas', path: '/admin/delivery-management/disputes', icon: FileText },
      { id: 'delivery-reports', label: 'Relatórios', path: '/admin/delivery-management/reports', icon: BarChart2 },
      { id: 'delivery-receipts', label: 'Comprovantes', path: '/admin/delivery-management/delivery-receipts', icon: FileText },
      { id: 'delivery-settings', label: 'Configurações', path: '/admin/delivery-management/settings', icon: Settings },
    ]
  },
  {
    id: 'crm',
    label: 'CRM',
    icon: Users,
    crmRequired: true,
    subItems: [
      { id: 'crm-pipeline', label: 'Pipeline', path: '/crm/pipeline', icon: TrendingUp },
      { id: 'crm-relationship', label: 'Relacionamento', path: '/crm/relationship', icon: HeartHandshake },
      { id: 'crm-contacts', label: 'Contatos', path: '/crm/contacts', icon: Users },
      { id: 'crm-contracts', label: 'Contratos', path: '/crm/comodato-contracts', icon: FileText },
      { id: 'crm-automations', label: 'Automações', path: '/crm/automations', icon: Settings },
      { id: 'crm-reports', label: 'Relatórios', path: '/crm/reports', icon: BarChart2 },
      { id: 'crm-team', label: 'Equipe', path: '/crm/team', icon: Users },
    ]
  },
  {
    id: 'apoio',
    label: 'Apoio',
    icon: LifeBuoy,
    subItems: [
      { id: 'apoio-chamados', label: 'Chamados', path: '/admin/apoio/chamados', icon: MessageSquare },
      { id: 'apoio-comodato', label: 'Comodato', path: '/admin/apoio/comodato', icon: FileText },
      { id: 'apoio-agenda', label: 'Agenda', path: '/admin/apoio/agenda', icon: Calendar },
      { id: 'apoio-geo', label: 'Geolocalização', path: '/admin/apoio/geolocalizacao', icon: MapPin },
      { id: 'apoio-manutencao', label: 'Manutenção', path: '/admin/apoio/manutencao-equipamentos', icon: Wrench },
      { id: 'apoio-relatorios', label: 'Relatórios', path: '/admin/apoio/relatorios', icon: BarChart2 },
    ]
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    subItems: [
      { id: 'conf-perfil', label: 'Perfil', path: '/configuracoes/perfil', icon: Users },
      { id: 'conf-equipe', label: 'Gestão de Equipe', path: '/configuracoes/gestao-equipe', icon: Users },
      { id: 'conf-seguranca', label: 'Segurança', path: '/configuracoes/seguranca', icon: Shield },
      { id: 'conf-integracoes', label: 'Integrações', path: '/configuracoes/integracoes', icon: LinkIcon },
      { id: 'conf-notificacoes', label: 'Notificações', path: '/configuracoes/notificacoes', icon: MessageSquare },
      { id: 'conf-faturamento', label: 'Faturamento', path: '/configuracoes/faturamento', icon: FileText },
      { id: 'conf-backup', label: 'Backup', path: '/configuracoes/backup', icon: FileText },
      { id: 'conf-logs', label: 'Logs', path: '/configuracoes/logs', icon: FileText },
      { id: 'conf-diagnostico', label: 'Diagnóstico', path: '/configuracoes/diagnostico', icon: Wrench },
    ]
  }
];

// Safe Permission Filtering
const filterMenuByPermissions = (menu, userContext) => {
    if (!userContext) return [];
    
    const { role, canAccessCrm, modulePermissions } = userContext;
    
    // Normalize admin roles for permission check
    const isAdmin = ['admin', 'nivel 1', 'nível 1', 'nivel 5', 'nível 5'].includes(role?.toLowerCase());

    const filter = (items) => items.map(item => {
        if (isAdmin) {
            if (item.subItems) {
                const accessibleSubItems = filter(item.subItems);
                return { ...item, subItems: accessibleSubItems };
            }
            return item;
        }

        const moduleMatch = !item.moduleId || modulePermissions?.[item.moduleId];
        const crmAccessMatch = !item.crmRequired || canAccessCrm;

        if (!moduleMatch || !crmAccessMatch) return null;

        if (item.subItems) {
            const accessibleSubItems = filter(item.subItems);
            if (accessibleSubItems.length > 0) {
                return { ...item, subItems: accessibleSubItems };
            }
            return null;
        }
        
        return item;
    }).filter(Boolean);

    return filter(menu);
};

const SidebarItem = ({ item, isCollapsed, isActive, depth = 0, openGroups, toggleGroup }) => {
    const Icon = item.icon;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openGroups.includes(item.id);

    if (isCollapsed && depth === 0) {
        if (hasSubItems) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-center h-10 px-2 mb-1 hover:bg-[#7D3E3E] text-white/80 hover:text-white",
                                isActive && "bg-[#F5E6D3] text-[#6B2C2C] hover:bg-[#F5E6D3] hover:text-[#6B2C2C]"
                            )}
                        >
                            {Icon && <Icon className="h-5 w-5" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" className="w-56 bg-[#6B2C2C] border-[#7D3E3E] text-white ml-2">
                        <DropdownMenuLabel className="text-white">{item.label}</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-[#7D3E3E]" />
                        {item.subItems.map((subItem) => (
                            <SidebarSubItemDropdown key={subItem.id} item={subItem} />
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Link
                        to={item.path}
                        className={cn(
                            "flex h-10 w-full items-center justify-center rounded-md mb-1 transition-colors hover:bg-[#7D3E3E] text-white/80 hover:text-white",
                            isActive && "bg-[#F5E6D3] text-[#6B2C2C] hover:bg-[#F5E6D3] hover:text-[#6B2C2C]"
                        )}
                    >
                        {Icon && <Icon className="h-5 w-5" />}
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#6B2C2C] text-white border-[#7D3E3E] ml-2">
                    {item.label}
                </TooltipContent>
            </Tooltip>
        );
    }

    if (hasSubItems) {
        return (
            <Collapsible open={isOpen} onOpenChange={() => toggleGroup(item.id)} className="w-full">
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className={cn(
                            "w-full justify-between h-10 px-3 mb-1 hover:bg-[#7D3E3E] text-white/80 hover:text-white font-normal",
                            isActive && "text-white font-medium"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            {Icon && <Icon className="h-5 w-5 shrink-0 text-[#F5E6D3]" />}
                            <span className="truncate">{item.label}</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
                    </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    {item.subItems.map((subItem) => (
                        <SidebarItem 
                            key={subItem.id} 
                            item={subItem} 
                            isCollapsed={isCollapsed} 
                            isActive={false} 
                            depth={depth + 1}
                            openGroups={openGroups}
                            toggleGroup={toggleGroup}
                        />
                    ))}
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return (
        <Link
            to={item.path}
            className={cn(
                "flex items-center gap-3 h-10 px-3 rounded-md mb-1 transition-colors hover:bg-[#7D3E3E] text-white/80 hover:text-white",
                isActive && "bg-[#F5E6D3] text-[#6B2C2C] hover:bg-[#F5E6D3] hover:text-[#6B2C2C] font-medium",
                depth > 0 && "text-sm"
            )}
        >
            {Icon && <Icon className={cn("h-5 w-5 shrink-0", depth > 0 && "h-4 w-4", !isActive && "text-[#F5E6D3]")} />}
            <span className="truncate">{item.label}</span>
        </Link>
    );
};

const SidebarSubItemDropdown = ({ item }) => {
    if (item.subItems && item.subItems.length > 0) {
        return (
            <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-white/80 focus:text-white focus:bg-[#7D3E3E] cursor-pointer">
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    <span>{item.label}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-[#6B2C2C] border-[#7D3E3E] text-white">
                    {item.subItems.map(sub => (
                        <SidebarSubItemDropdown key={sub.id} item={sub} />
                    ))}
                </DropdownMenuSubContent>
            </DropdownMenuSub>
        );
    }

    return (
        <DropdownMenuItem asChild>
            <Link to={item.path} className="cursor-pointer text-white/80 focus:text-white focus:bg-[#7D3E3E]">
                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                <span>{item.label}</span>
            </Link>
        </DropdownMenuItem>
    );
};

const SidebarOverride = ({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
    const location = useLocation();
    const { userContext, loading } = useAuth();
    const [openGroups, setOpenGroups] = useState([]);

    const menuItems = useMemo(() => {
        if (loading && !userContext) return [];
        try {
            return filterMenuByPermissions(allMenuItems, userContext);
        } catch (error) {
            console.error("Error filtering menu items:", error);
            return [];
        }
    }, [userContext, loading]);

    const toggleGroup = (id) => {
        setOpenGroups(prev => 
            prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
        );
    };

    const isPathActive = (itemPath) => {
        if (!itemPath) return false;
        if (itemPath === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(itemPath);
    };

    const isGroupActive = (item) => {
        if (item.path && isPathActive(item.path)) return true;
        if (item.subItems) {
            return item.subItems.some(sub => isGroupActive(sub));
        }
        return false;
    };

    // Force refresh of displayed role to ensure it's not hardcoded
    const displayRole = userContext?.role || 'Carregando...';

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#6B2C2C] text-white border-r border-[#7D3E3E]">
            <div className={cn(
                "flex items-center h-16 px-4 border-b border-[#7D3E3E] transition-all duration-300 shrink-0", 
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                {!isCollapsed ? (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                            src="https://horizons-cdn.hostinger.com/af07f265-a066-448a-97b1-ed36097a0659/702b0260ab5ec21070e294c9fe739730.png" 
                            alt="Logo" 
                            className="h-8 w-auto object-contain" 
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-white text-sm leading-tight whitespace-nowrap">Costa Lavos</span>
                            <span className="text-[10px] text-[#F5E6D3]/80 leading-tight">360°</span>
                        </div>
                    </div>
                ) : (
                    <img 
                        src="https://horizons-cdn.hostinger.com/af07f265-a066-448a-97b1-ed36097a0659/702b0260ab5ec21070e294c9fe739730.png" 
                        alt="Logo" 
                        className="h-8 w-auto object-contain" 
                    />
                )}
                
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex h-8 w-8 text-[#F5E6D3] hover:text-white hover:bg-[#7D3E3E]"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            <ScrollArea className="flex-1 py-4">
                <div className="px-2 space-y-1">
                    {menuItems.map((item) => (
                        <SidebarItem 
                            key={item.id} 
                            item={item} 
                            isCollapsed={isCollapsed}
                            isActive={isGroupActive(item)}
                            openGroups={openGroups}
                            toggleGroup={toggleGroup}
                        />
                    ))}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-[#7D3E3E] mt-auto bg-[#6B2C2C]">
                 {!isCollapsed ? (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#F5E6D3]/20 flex items-center justify-center text-[#F5E6D3] border border-[#F5E6D3]/30">
                            <span className="text-xs font-bold">
                                {userContext?.fullName?.charAt(0) || 'U'}
                            </span>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-white truncate" title={userContext?.fullName}>{userContext?.fullName || 'Usuário'}</span>
                            <span className="text-xs text-[#F5E6D3]/80 truncate" title={displayRole}>
                                {displayRole}
                            </span>
                        </div>
                    </div>
                 ) : (
                    <div className="flex justify-center">
                        <div className="h-8 w-8 rounded-full bg-[#F5E6D3]/20 flex items-center justify-center text-[#F5E6D3] border border-[#F5E6D3]/30">
                            <span className="text-xs font-bold">
                                {userContext?.fullName?.charAt(0) || 'U'}
                            </span>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );

    return (
        <>
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r border-[#7D3E3E] bg-[#6B2C2C] transition-all duration-300 ease-in-out z-40 h-screen sticky top-0",
                    isCollapsed ? "w-[70px]" : "w-64"
                )}
            >
                <SidebarContent />
            </aside>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="p-0 w-72 bg-[#6B2C2C] border-r-[#7D3E3E] text-white">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </>
    );
};

export default SidebarOverride;
