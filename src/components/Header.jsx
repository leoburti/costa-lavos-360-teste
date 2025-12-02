import React, { useState, useEffect } from 'react';
import { Menu, Search, User, LogOut, Settings, SlidersHorizontal } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ setSidebarOpen }) => {
  const { user, signOut } = useAuth();
  const { filters, updateFilters } = useFilters();
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const navigate = useNavigate();
  const location = useLocation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    if (filters.searchTerm !== debouncedSearchTerm) {
      updateFilters({ searchTerm: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, updateFilters, filters.searchTerm]);
  
  useEffect(() => {
    if (filters.searchTerm !== searchTerm) {
      setSearchTerm(filters.searchTerm || '');
    }
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
    if (path.includes('/dashboard')) return 'Visão Geral';
    if (path.includes('/analitico-supervisor')) return 'Analítico Supervisor';
    if (path.includes('/analitico-vendedor')) return 'Analítico Vendedor';
    if (path.includes('/analitico-regiao')) return 'Analítico Região';
    if (path.includes('/analitico-grupo-clientes')) return 'Analítico Grupos';
    if (path.includes('/analitico-produto')) return 'Analítico Produto';
    if (path.includes('/analise-desempenho-fidelidade')) return 'Fidelidade e Churn';
    if (path.includes('/visao-360')) return 'Visão 360°';
    return 'Costa Lavos 360°';
  };

  const fullName = user?.user_metadata?.full_name || 'Usuário';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur-sm px-4 shadow-sm sm:px-6 transition-all">
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden shrink-0" 
        onClick={() => setSidebarOpen && setSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div className="flex items-center gap-4 mr-4">
         <h1 className="text-lg font-bold text-slate-800 hidden md:block tracking-tight">
            {getPageTitle()}
         </h1>
         <h1 className="text-base font-bold text-slate-800 md:hidden">
            360°
         </h1>
      </div>

      <div className="flex-1 flex items-center max-w-md relative">
        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Buscar global..."
          className="pl-9 bg-slate-100/50 border-slate-200 focus-visible:bg-white focus-visible:ring-primary/20 transition-colors h-9 md:h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <div className="hidden lg:block">
          <PeriodSelector />
        </div>
        
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="hidden md:flex h-9 md:h-10 border-slate-200 bg-white hover:bg-slate-50 text-slate-700">
              <SlidersHorizontal className="h-4 w-4 mr-2 text-slate-500" />
              Filtros
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Filtros Globais</DialogTitle>
              <DialogDescription>
                Estes filtros afetarão todas as análises e relatórios do sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="lg:hidden mb-4">
                <label className="text-sm font-medium mb-2 block">Período</label>
                <PeriodSelector />
              </div>
              <FilterPanel />
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => updateFilters({ excludeEmployees: !filters.excludeEmployees })}>
                  <input
                    type="checkbox"
                    checked={filters.excludeEmployees || false}
                    onChange={() => {}} // Handled by parent div click
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label className="text-sm font-medium cursor-pointer select-none flex-1">
                    Excluir Vendas para Funcionários
                  </label>
                </div>
                <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => updateFilters({ showDefinedGroupsOnly: !filters.showDefinedGroupsOnly })}>
                  <input
                    type="checkbox"
                    checked={filters.showDefinedGroupsOnly || false}
                    onChange={() => {}} // Handled by parent div click
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <label className="text-sm font-medium cursor-pointer select-none flex-1">
                    Apenas Grupos Definidos
                  </label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFilterOpen(false)}>Fechar</Button>
              <Button onClick={() => setIsFilterOpen(false)}>Aplicar Filtros</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mobile Filter Icon Only */}
        <Button variant="ghost" size="icon" className="md:hidden h-9 w-9" onClick={() => setIsFilterOpen(true)}>
          <SlidersHorizontal className="h-5 w-5 text-slate-600" />
        </Button>

        <NotificacoesBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 focus-visible:ring-0 ring-0">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={fullName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900">{fullName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/configuracoes/perfil')} className="cursor-pointer">
              <User className="mr-2 h-4 w-4 text-slate-500" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/configuracoes')} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4 text-slate-500" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer focus:bg-red-50">
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