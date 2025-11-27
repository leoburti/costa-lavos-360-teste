import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  User,
  Lock,
  Bell,
  Eye,
  Globe,
  CreditCard,
  Database,
  HelpCircle,
  Shield,
  Settings,
  Users,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const sidebarNavItems = [
  {
    title: "Perfil",
    href: "/configuracoes/perfil",
    icon: <User className="h-4 w-4" />,
  },
  {
    title: "Segurança",
    href: "/configuracoes/seguranca",
    icon: <Lock className="h-4 w-4" />,
  },
  {
    title: "Notificações",
    href: "/configuracoes/notificacoes",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    title: "Privacidade",
    href: "/configuracoes/privacidade",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    title: "Aparência",
    href: "/configuracoes/aparencia",
    icon: <Eye className="h-4 w-4" />,
  },
  {
    title: "Integrações",
    href: "/configuracoes/integracoes",
    icon: <Globe className="h-4 w-4" />,
  },
  {
    title: "Gestão de Equipe",
    href: "/configuracoes/gestao-equipe",
    icon: <Users className="h-4 w-4" />,
  },
  {
    title: "Faturamento",
    href: "/configuracoes/faturamento",
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    title: "Backup e Dados",
    href: "/configuracoes/backup",
    icon: <Database className="h-4 w-4" />,
  },
  {
    title: "Diagnóstico do Sistema",
    href: "/configuracoes/diagnostico",
    icon: <Activity className="h-4 w-4" />,
  },
  {
    title: "Diagnóstico Forense",
    href: "/configuracoes/diagnostico-forense",
    icon: <ShieldAlert className="h-4 w-4" />,
    variant: "destructive"
  },
  {
    title: "Sobre e Ajuda",
    href: "/configuracoes/sobre",
    icon: <HelpCircle className="h-4 w-4" />,
  },
];

export default function ConfiguracoesLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col space-y-6 p-8 pb-16">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e preferências do sistema.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="-mx-4 lg:w-1/5">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 px-4">
              {sidebarNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      item.variant === "destructive" && !isActive && "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
                      item.variant === "destructive" && isActive && "bg-red-100 text-red-600 dark:bg-red-900/30"
                    )
                  }
                >
                  {item.icon}
                  {item.title}
                </NavLink>
              ))}
            </nav>
          </ScrollArea>
        </aside>
        <div className="flex-1 lg:max-w-4xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}