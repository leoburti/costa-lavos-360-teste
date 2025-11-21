
import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { List, Settings, FileText, PlusCircle } from 'lucide-react';

const ChamadosLayout = () => {
  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="border-b px-6 py-3 bg-card">
        <nav className="flex items-center space-x-2 overflow-x-auto">
          <NavLink to="/admin/apoio/chamados" end>
            {({ isActive }) => (
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                size="sm" 
                className={cn("gap-2", isActive && "bg-secondary font-medium")}
              >
                <List className="h-4 w-4" />
                Lista de Chamados
              </Button>
            )}
          </NavLink>
          <NavLink to="/admin/apoio/chamados/novo">
            {({ isActive }) => (
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                size="sm" 
                className={cn("gap-2", isActive && "bg-secondary font-medium")}
              >
                <PlusCircle className="h-4 w-4" />
                Novo Chamado
              </Button>
            )}
          </NavLink>
          <div className="h-4 w-px bg-border mx-2" />
          <NavLink to="/admin/apoio/chamados/motivos">
            {({ isActive }) => (
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                size="sm" 
                className={cn("gap-2", isActive && "bg-secondary font-medium")}
              >
                <Settings className="h-4 w-4" />
                Motivos
              </Button>
            )}
          </NavLink>
          <NavLink to="/admin/apoio/chamados/formularios">
            {({ isActive }) => (
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                size="sm" 
                className={cn("gap-2", isActive && "bg-secondary font-medium")}
              >
                <FileText className="h-4 w-4" />
                Formulários
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

export default ChamadosLayout;
