import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Users, Shield, UserCheck, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const subNavigation = [
  { name: 'Usuários', href: '/configuracoes/usuarios/usuarios', icon: Users },
  { name: 'Perfis', href: '/configuracoes/usuarios/perfis', icon: Shield },
  { name: 'Aprovadores', href: '/configuracoes/usuarios/aprovadores', icon: UserCheck },
  { name: 'Acessos', href: '/configuracoes/usuarios/acessos', icon: KeyRound },
];

const UsuariosApoioLayout = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col space-y-4">
      <nav className="flex space-x-2 border-b">
        {subNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-t-md',
                location.pathname.startsWith(item.href)
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            <item.icon className="mr-2 h-5 w-5" aria-hidden="true" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-1">
        <Outlet />
      </div>
    </div>
  );
};

export default UsuariosApoioLayout;