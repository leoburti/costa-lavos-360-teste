
import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  User,
  Shield,
  Bell,
  Eye,
  Palette,
  Plug,
  CreditCard,
  Users,
  Database,
  FileText,
  Info,
  Settings,
  MapPin,
  Calendar,
  Headphones,
  Package,
  BarChart3,
  LayoutDashboard,
  DatabaseZap,
  UserCog
} from 'lucide-react';

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:text-primary",
        isActive ? "bg-muted text-primary" : "text-muted-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
};

const ConfiguracoesLayout = () => {
  return (
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0 p-6">
      <aside className="-mx-4 lg:w-1/5 overflow-y-auto max-h-[calc(100vh-100px)]">
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 px-4">
          <div className="pb-4">
            <h4 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase">
              Geral
            </h4>
            <SidebarItem to="/configuracoes/perfil" icon={User} label="Perfil" />
            <SidebarItem to="/configuracoes/seguranca" icon={Shield} label="Segurança" />
            <SidebarItem to="/configuracoes/notificacoes" icon={Bell} label="Notificações" />
            <SidebarItem to="/configuracoes/privacidade" icon={Eye} label="Privacidade" />
            <SidebarItem to="/configuracoes/aparencia" icon={Palette} label="Aparência" />
            <SidebarItem to="/configuracoes/integracoes" icon={Plug} label="Integrações" />
            <SidebarItem to="/configuracoes/faturamento" icon={CreditCard} label="Faturamento" />
            <SidebarItem to="/configuracoes/backup" icon={Database} label="Backup & Dados" />
            <SidebarItem to="/configuracoes/logs" icon={FileText} label="Logs de Auditoria" />
            <SidebarItem to="/configuracoes/sobre" icon={Info} label="Sobre" />
          </div>

          <div className="pb-4">
             <h4 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase mt-4">
              Gestão de Equipe
            </h4>
            <SidebarItem to="/configuracoes/gestao-equipe" icon={UserCog} label="Central de Equipe" />
          </div>

          <div className="pb-4">
            <h4 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground uppercase mt-4">
              Módulos de Apoio
            </h4>
            <SidebarItem to="/configuracoes/apoio/relatorios" icon={BarChart3} label="Relatórios" />
            <SidebarItem to="/configuracoes/apoio/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <SidebarItem to="/configuracoes/apoio/geolocalizacao" icon={MapPin} label="Geolocalização" />
            <SidebarItem to="/configuracoes/apoio/agenda" icon={Calendar} label="Agenda" />
            <SidebarItem to="/configuracoes/apoio/chamados" icon={Headphones} label="Chamados" />
            <SidebarItem to="/configuracoes/apoio/comodato" icon={Package} label="Comodato" />
            <SidebarItem to="/configuracoes/apoio/dados-clientes" icon={DatabaseZap} label="Dados Clientes" />
            <SidebarItem to="/configuracoes/apoio/avancadas" icon={Settings} label="Avançadas" />
          </div>
        </nav>
      </aside>
      <div className="flex-1 lg:max-w-full">
        <Outlet />
      </div>
    </div>
  );
};

export default ConfiguracoesLayout;
