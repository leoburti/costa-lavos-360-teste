import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, User, LogOut, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFilters } from '@/contexts/FilterContext';
import { useDebounce } from '@/hooks/useDebounce';
import NotificacoesBell from '@/components/NotificacoesBell';
import PeriodSelector from '@/components/PeriodSelector';
import FilterPanel from '@/components/FilterPanel';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ setSidebarOpen }) => {
  const { user, userContext, signOut } = useAuth();
  const { filters, updateFilters } = useFilters();
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only update if different to avoid loop
    if (filters.searchTerm !== debouncedSearchTerm) {
      updateFilters({ searchTerm: debouncedSearchTerm });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);
  
  useEffect(() => {
    // Sync changes from global context back to local state
    if (filters.searchTerm !== searchTerm) {
      setSearchTerm(filters.searchTerm || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.searchTerm]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard Comercial';
    if (path.includes('/crm')) return 'CRM';
    if (path.includes('/apoio')) return 'Central de Apoio';
    if (path.includes('/configuracoes')) return 'Configurações';
    if (path.includes('/bonificacoes')) return 'Bonificações';
    if (path.includes('/ai-chat')) return 'Assistente IA';
    if (path.includes('/analitico-supervisor')) return 'Análise Supervisor';
    if (path.includes('/analitico-vendedor')) return 'Análise Vendedor';
    if (path.includes('/analitico-regiao')) return 'Análise Região';
    if (path.includes('/analitico-grupo-clientes')) return 'Análise Grupos';
    if (path.includes('/analitico-produto')) return 'Análise Produto';
    if (path.includes('/visao-360-cliente')) return 'Visão 360 Cliente';
    if (path.includes('/analitico-vendas-diarias')) return 'Vendas Diárias';
    if (path.includes('/analise-churn')) return 'Análise Churn';
    if (path.includes('/curva-abc')) return 'Curva ABC';
    if (path.includes('/calculo-rfm')) return 'Cálculo RFM';
    if (path.includes('/tendencia-vendas')) return 'Tendência Vendas';
    if (path.includes('/analise-valor-unitario')) return 'Análise Valor Unitário';
    if (path.includes('/baixo-desempenho')) return 'Baixo Desempenho';
    if (path.includes('/analise-fidelidade')) return 'Análise Fidelidade';
    if (path.includes('/produtos-bonificados')) return 'Produtos Bonificados';
    if (path.includes('/performance-bonificados')) return 'Performance Bonificada';
    if (path.includes('/analitico-bonificados')) return 'Analítico Bonificado';
    if (path.includes('/movimentacao-equipamentos')) return 'Movimentação Equipamentos';
    if (path.includes('/analitico-equipamentos-cliente')) return 'Equipamentos por Cliente';
    if (path.includes('/analitico-equipamento')) return 'Análise Equipamento';
    if (path.includes('/equipamentos-em-campo')) return 'Equipamentos em Campo';
    if (path.includes('/raio-x-supervisor')) return 'Raio-X Supervisor';
    if (path.includes('/raio-x-vendedor')) return 'Raio-X Vendedor';
    if (path.includes('/tarefas')) return 'Tarefas';
    if (path.includes('/admin/delivery-management')) return 'Gestão de Entregas'; // Catch-all for delivery
    return 'Costa Lavos 360°';
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 shadow-sm sm:px-6 transition-all">
      {/* Mobile Menu Trigger */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden shrink-0" 
        onClick={() => setSidebarOpen && setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Title / Logo Area */}
      <div className="flex items-center gap-2 mr-4">
         <h1 className="text-lg font-semibold text-foreground hidden md:block">
            {getPageTitle()}
         </h1>
         {/* Mobile Title */}
         <h1 className="text-base font-semibold text-foreground md:hidden">
            360°
         </h1>
      </div>

      {/* Search Bar */}
      <div className="flex-1 flex items-center max-w-md relative">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          className="pl-9 bg-muted/30 border-muted-foreground/20 focus-visible:bg-background transition-colors h-9 md:h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-2 md:gap-3">
        {/* Period Selector - Hidden on very small screens */}
        <div className="hidden lg:block">
          <PeriodSelector />
        </div>
        
        {/* Advanced Filters */}
        <FilterPanel />

        {/* Notifications */}
        <NotificacoesBell />

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={userContext?.fullName} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(userContext?.fullName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userContext?.fullName || 'Usuário'}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/configuracoes/perfil')}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;