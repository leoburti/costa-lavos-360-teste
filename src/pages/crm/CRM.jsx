import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  GitPullRequest, 
  Users, 
  FileText, 
  Zap, 
  LineChart, 
  Shield,
  Activity
} from 'lucide-react';

const CRM = () => {
  const location = useLocation();

  // Define navigation items for the CRM module
  const navItems = [
    { name: 'Pipeline', path: '/crm/pipeline', icon: GitPullRequest },
    { name: 'Contatos', path: '/crm/contacts', icon: Users },
    { name: 'Relacionamento', path: '/crm/relationship', icon: Activity },
    { name: 'Contratos', path: '/crm/comodato-contracts', icon: FileText },
    { name: 'Automações', path: '/crm/automations', icon: Zap },
    { name: 'Relatórios', path: '/crm/reports', icon: LineChart },
    { name: 'Equipe', path: '/crm/team', icon: Shield },
  ];

  return (
    <div className="flex flex-col h-full w-full space-y-6 bg-muted/10 p-2 md:p-6 rounded-lg">
        {/* Navigation Bar */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <nav className="flex items-center space-x-2 border-b border-border/40 pb-4 min-w-max">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                                isActive 
                                    ? "bg-primary text-primary-foreground shadow-sm" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className="mr-2 h-4 w-4" />
                            {item.name}
                        </NavLink>
                    );
                })}
            </nav>
        </div>

        {/* Content Area - Renders the child routes like Pipeline, Contacts, etc. */}
        <div className="flex-1 min-h-0 fade-in-50 animate-in duration-300">
            <Outlet />
        </div>
    </div>
  );
};

export default CRM;