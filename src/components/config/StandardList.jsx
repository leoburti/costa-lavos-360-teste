import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useConfigMock } from '@/hooks/useConfigMock';
import { moduleDefinitions } from '@/config/configModules';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import { 
  Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Power, Copy 
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const StandardList = ({ type }) => {
  const navigate = useNavigate();
  const config = moduleDefinitions[type];
  const { [type]: data, loading } = useConfigMock();
  const [searchTerm, setSearchTerm] = useState('');

  if (!config) return <div>Configuração não encontrada para {type}</div>;

  const filteredData = Array.isArray(data) ? data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ) : [];

  const renderCell = (item, column) => {
    const value = item[column.key];
    
    switch(column.type) {
      case 'badge':
        const variants = {
          ativo: 'success',
          concluido: 'success',
          sucesso: 'success',
          atingida: 'success',
          inativo: 'secondary',
          pendente: 'warning',
          erro: 'destructive',
          sem_estoque: 'destructive'
        };
        return <Badge variant={variants[String(value).toLowerCase()] || 'outline'} className="capitalize">{String(value).replace('_', ' ')}</Badge>;
      case 'date':
        return <span className="text-sm text-slate-500">{formatDate(value)}</span>;
      case 'datetime':
        return <span className="text-sm text-slate-500">{formatDate(value, 'dd/MM/yyyy HH:mm')}</span>;
      case 'currency':
        return <span className="font-mono font-medium">{formatCurrency(value)}</span>;
      case 'percent':
        return <span className="font-medium">{value}%</span>;
      case 'boolean':
        return value ? <Badge variant="success">Sim</Badge> : <Badge variant="secondary">Não</Badge>;
      case 'progress':
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <Progress value={value} className="h-2" />
            <span className="text-xs font-medium w-8">{value.toFixed(0)}%</span>
          </div>
        );
      case 'mono':
        return <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono">{value}</code>;
      default:
        return <span className="text-sm">{value}</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>{config.title} | Configurações</title></Helmet>
      
      <PageHeader 
        title={config.title} 
        description={config.description}
        breadcrumbs={[{ label: 'Configurações', path: '/configuracoes' }, { label: config.title }]}
        actions={
          config.fields ? (
            <Button onClick={() => navigate('novo')}>
              <Plus className="mr-2 h-4 w-4" /> Novo
            </Button>
          ) : null
        }
      />

      <Card className="border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs text-slate-500">
            {filteredData.length} registros
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                {config.columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {config.columns.map((col, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                    ))}
                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={config.columns.length + 1} className="h-32 text-center text-muted-foreground">
                    Nenhum registro encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/50">
                    {config.columns.map((col) => (
                      <TableCell key={col.key}>
                        {renderCell(item, col)}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          {config.fields && (
                            <DropdownMenuItem onClick={() => navigate(`${item.id}`)}>
                              <Edit className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" /> Detalhes
                          </DropdownMenuItem>
                          {type === 'apikeys' && (
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" /> Copiar Chave
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StandardList;