import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Bell, Inbox, Archive, Settings, CheckCheck } from 'lucide-react';

const NotificacoesLayout = () => {
  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="border-b px-6 py-3 bg-card">
        <nav className="flex items-center space-x-2 overflow-x-auto">
          <NavLink to="/apoio/notificacoes/minhas" end>
            {({ isActive }) => (
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                size="sm" 
                className={cn("gap-2", isActive && "bg-secondary font-medium")}
              >
                <Inbox className="h-4 w-4" />
                Minhas Notificações
              </Button>
            )}
          </NavLink>
          <NavLink to="/apoio/notificacoes/nao-lidas">
            {({ isActive }) => (
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                size="sm" 
                className={cn("gap-2", isActive && "bg-secondary font-medium")}
              >
                <Bell className="h-4 w-4" />
                Não Lidas
              </Button>
            )}
          </NavLink>
          <NavLink to="/apoio/notificacoes/arquivadas">
            {({ isActive }) => (
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                size="sm" 
                className={cn("gap-2", isActive && "bg-secondary font-medium")}
              >
                <Archive className="h-4 w-4" />
                Arquivadas
              </Button>
            )}
          </NavLink>
          <div className="h-4 w-px bg-border mx-2" />
          <NavLink to="/apoio/notificacoes/preferencias">
            {({ isActive }) => (
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                size="sm" 
                className={cn("gap-2", isActive && "bg-secondary font-medium")}
              >
                <Settings className="h-4 w-4" />
                Preferências
              </Button>
            )}
          </NavLink>
        </nav>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default NotificacoesLayout;