import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const BREADCRUMB_MAP = {
  '/dashboard': { label: 'Dashboard', icon: Home },
  '/relatorio-vendas-diario': { label: 'Vendas Diário', parent: 'Vendas' },
  '/relatorio-vendas-mensal': { label: 'Vendas Mensal', parent: 'Vendas' },
  '/relatorio-vendas-anual': { label: 'Vendas Anual', parent: 'Vendas' },
  '/relatorio-vendas-por-vendedor': { label: 'Por Vendedor', parent: 'Vendas' },
  '/relatorio-vendas-por-regiao': { label: 'Por Região', parent: 'Vendas' },
  '/relatorio-desempenho-vendedor': { label: 'Desempenho Vendedor', parent: 'Desempenho' },
  '/relatorio-desempenho-supervisor': { label: 'Desempenho Supervisor', parent: 'Desempenho' },
  '/relatorio-financeiro-receita': { label: 'Receita', parent: 'Financeiro' },
  '/relatorio-cliente-carteira': { label: 'Carteira de Clientes', parent: 'Clientes' },
  '/relatorio-cliente-churn': { label: 'Churn Rate', parent: 'Clientes' },
  '/relatorio-operacional-estoque': { label: 'Estoque', parent: 'Operacional' },
  '/relatorio-dashboard': { label: 'Central de Relatórios', parent: 'Dashboard' },
};

export default function RelatorioBreadcrumbs() {
  const location = useLocation();
  const breadcrumb = BREADCRUMB_MAP[location.pathname];

  if (!breadcrumb) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <Link to="/dashboard" className="hover:text-primary flex items-center gap-1">
        <Home className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>
      
      {breadcrumb.parent && breadcrumb.parent !== 'Dashboard' && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span>{breadcrumb.parent}</span>
        </>
      )}
      
      <ChevronRight className="h-4 w-4" />
      <span className="text-gray-900 font-semibold">{breadcrumb.label}</span>
    </div>
  );
}