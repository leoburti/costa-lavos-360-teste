import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Users, CalendarDays, CalendarClock, Ban, GitBranch, BellRing, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const AgendaLayout = () => {
  const navItems = [
    { to: '/apoio/agenda/minha-agenda', icon: Calendar, label: 'Minha Agenda' },
    { to: '/apoio/agenda/equipe', icon: Users, label: 'Agenda da Equipe' },
    { to: '/apoio/agenda/eventos', icon: CalendarDays, label: 'Eventos' },
    { to: '/apoio/agenda/agendamentos', icon: CalendarClock, label: 'Agendamentos' },
    { to: '/apoio/agenda/disponibilidade', icon: Settings, label: 'Disponibilidade' },
    { to: '/apoio/agenda/bloqueios', icon: Ban, label: 'Bloqueios' },
    { to: '/apoio/agenda/conflitos', icon: GitBranch, label: 'Conflitos' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="border-b px-6 py-3 bg-card">
        <nav className="flex items-center space-x-2 overflow-x-auto">
          {navItems.map(item => (
            <NavLink to={item.to} key={item.to} end>
              {({ isActive }) => (
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn("gap-2", isActive && "bg-secondary font-medium")}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex-1 p-6 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default AgendaLayout;