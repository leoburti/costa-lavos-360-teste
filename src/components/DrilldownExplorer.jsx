import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  Treemap 
} from 'recharts';
import { 
  ChevronRight, ArrowLeft, TrendingUp, TrendingDown, 
  LayoutGrid, List, Maximize2, Minimize2, ChevronLeft, Eye, EyeOff, BarChart2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyticalData } from '@/hooks/useAnalyticalData';
import { useFilters } from '@/contexts/FilterContext';
import { formatCurrency, formatNumber, formatPercentage, formatDateForAPI } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// Mapeamento de níveis para breadcrumbs e títulos
const HIERARCHY_LABELS = {
  supervisor: ['Supervisor', 'Vendedor', 'Cliente', 'Produto'],
  region: ['Região', 'Supervisor', 'Vendedor', 'Cliente', 'Produto'],
  customerGroup: ['Grupo', 'Cliente', 'Produto'],
  seller: ['Vendedor', 'Cliente', 'Produto'],
  product: ['Produto', 'Cliente', 'Vendedor']
};

// Cores para gráficos
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9'];

const CustomTooltip = React.memo(({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 shadow-xl rounded-lg text-sm z-50">
        <p className="font-bold text-slate-800 mb-1">{data.name || 'Sem Nome'}</p>
        <div className="space-y-1">
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-slate-500">Vendas:</span>
            <span className="font-mono font-medium text-slate-900">{formatCurrency(data.value)}</span>
          </div>
          {data.growth !== undefined && (
             <div className="flex justify-between gap-4 text-xs">
              <span className="text-slate-500">Crescimento:</span>
              <span className={cn("font-mono font-medium", data.growth >= 0 ? "text-green-600" : "text-red-600")}>
                {data.growth > 0 ? '+' : ''}{formatPercentage(data.growth)}
              </span>
            </div>
          )}
          {data.margin !== undefined && (
             <div className="flex justify-between gap-4 text-xs">
              <span className="text-slate-500">Margem Est.:</span>
              <span className="font-mono font-medium text-emerald-600">{formatCurrency(data.margin)}</span>
            </div>
          )}
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-slate-500">Partic.:</span>
            <span className="font-mono font-medium text-slate-900">{data.percentage ? formatPercentage(data.percentage) : '-'}</span>
          </div>
          {data.quantity !== undefined && (
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-slate-500">Qtd:</span>
              <span className="font-mono font-medium text-slate-900">{formatNumber(data.quantity)}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
});

const CustomizedTreemapContent = React.memo((props) => {
  const { x, y, width, height, name, value, index, growth } = props;
  if (width < 60 || height < 40) return null;
  
  // Ensure name is a string to prevent .length crash
  const displayName = typeof name === 'string' ? name : 'Sem Nome';
  
  // Lógica de cor baseada no crescimento se disponível
  let fillColor = CHART_COLORS[index % CHART_COLORS.length];
  if (growth !== undefined) {
      // Simple Green/Red logic for growth visualization
      fillColor = growth >= 0 ? '#22c55e' : '#ef4444'; 
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fillColor,
          stroke: '#fff',
          strokeWidth: 2,
          opacity: 0.9,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 7}
        textAnchor="middle"
        fill="#fff"
        fontSize={14}
        fontWeight="bold"
        style={{ pointerEvents: 'none', textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
      >
        {width > 80 ? (displayName.length > 15 ? displayName.substring(0, 12) + '...' : displayName) : ''}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 12}
        textAnchor="middle"
        fill="#fff"
        fontSize={12}
        style={{ pointerEvents: 'none', textShadow: '0px 1px 2px rgba(0,0,0,0.3)' }}
      >
        {formatCurrency(value)}
      </text>
    </g>
  );
});

const DrilldownExplorer = ({ analysisMode = 'supervisor', rpcName = 'get_drilldown_data', initialFilters = {} }) => {
  const { filters } = useFilters();
  // Merge initial filters with context filters, prioritizing context
  const activeFilters = { ...initialFilters, ...filters };
  
  const [drillPath, setDrillPath] = useState([]);
  const [chartType, setChartType] = useState('treemap');
  const [showChart, setShowChart] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  useEffect(() => {
    setCurrentPage(1);
  }, [drillPath, activeFilters]);

  const currentLevel = drillPath.length + 1;
  const currentLabel = HIERARCHY_LABELS[analysisMode]?.[currentLevel - 1] || 'Detalhes';
  const parentKeys = useMemo(() => drillPath.map(item => item.key), [drillPath]);

  const queryParams = useMemo(() => {
    const startDate = activeFilters.dateRange?.from || activeFilters.dateRange?.[0];
    const endDate = activeFilters.dateRange?.to || activeFilters.dateRange?.[1];

    return {
      p_start_date: formatDateForAPI(startDate),
      p_end_date: formatDateForAPI(endDate),
      p_analysis_mode: analysisMode,
      p_exclude_employees: activeFilters.excludeEmployees,
      p_supervisors: activeFilters.supervisors,
      p_sellers: activeFilters.sellers,
      p_customer_groups: activeFilters.customerGroups,
      p_regions: activeFilters.regions,
      p_clients: activeFilters.clients,
      p_search_term: activeFilters.searchTerm,
      p_drilldown_level: currentLevel,
      p_parent_keys: parentKeys.length > 0 ? parentKeys : null
    };
  }, [activeFilters, analysisMode, currentLevel, parentKeys]);

  const { data, loading, error } = useAnalyticalData(
    rpcName, 
    queryParams,
    { enabled: !!queryParams.p_start_date }
  );

  const handleDrilldown = useCallback((item) => {
    const levels = HIERARCHY_LABELS[analysisMode];
    // Robust check to prevent accessing length of undefined
    if (!levels || currentLevel >= levels.length) return;
    
    setDrillPath(prev => [...prev, { key: item.key, name: item.name }]);
  }, [currentLevel, analysisMode]);

  const handleBreadcrumbClick = useCallback((index) => {
    setDrillPath(prev => prev.slice(0, index));
  }, []);

  const handleBack = useCallback(() => {
    setDrillPath(prev => prev.slice(0, -1));
  }, []);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    // Ensure items have a name for the chart
    return [...data]
      .map(item => ({ ...item, name: item.name || 'Sem Nome' }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20); 
  }, [data]);

  const tableData = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    const sorted = [...data].sort((a, b) => b.value - a.value);
    return sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [data, currentPage]);

  const totalItems = Array.isArray(data) ? data.length : 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const totalValue = useMemo(() => {
    if (!data || !Array.isArray(data)) return 0;
    return data.reduce((acc, item) => acc + (item.value || 0), 0);
  }, [data]);

  // Detect available columns from first data item
  const hasGrowth = data?.[0]?.growth !== undefined;
  const hasClients = data?.[0]?.clients !== undefined;
  const hasTicket = data?.[0]?.average_ticket !== undefined;
  const hasConversion = data?.[0]?.conversion_rate !== undefined;
  const hasMargin = data?.[0]?.margin !== undefined;

  return (
    <div className={cn("flex flex-col h-full transition-all duration-300 bg-white rounded-lg", isExpanded ? "fixed inset-0 z-50 p-6 overflow-auto" : "")}>
      
      <div className="flex flex-col space-y-4 border-b border-slate-100 pb-4 mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-8 px-2", drillPath.length === 0 ? "font-bold text-primary" : "text-muted-foreground")}
              onClick={() => setDrillPath([])}
              disabled={drillPath.length === 0}
            >
              Visão Geral
            </Button>
            
            {drillPath.map((item, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="h-4 w-4 text-slate-300" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-8 px-2 max-w-[150px] truncate", index === drillPath.length - 1 ? "font-bold text-primary" : "text-muted-foreground")}
                  onClick={() => handleBreadcrumbClick(index + 1)}
                  disabled={index === drillPath.length - 1}
                >
                  {item.name}
                </Button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-7 px-2 text-xs", showChart ? "bg-white shadow-sm text-primary" : "text-muted-foreground")}
              onClick={() => setShowChart(!showChart)}
              title={showChart ? "Ocultar Gráfico" : "Mostrar Gráfico"}
            >
              {showChart ? <Eye className="h-3.5 w-3.5 mr-1.5"/> : <EyeOff className="h-3.5 w-3.5 mr-1.5"/>}
              {showChart ? "Gráfico" : "Oculto"}
            </Button>

            {showChart && (
              <>
                <div className="w-px h-4 bg-slate-300 mx-1" />
                <Tabs value={chartType} onValueChange={setChartType} className="h-7">
                  <TabsList className="h-7">
                    <TabsTrigger value="treemap" className="h-6 px-2 text-xs"><LayoutGrid className="h-3.5 w-3.5"/></TabsTrigger>
                    <TabsTrigger value="bar" className="h-6 px-2 text-xs"><BarChart2 className="h-3.5 w-3.5"/></TabsTrigger>
                  </TabsList>
                </Tabs>
              </>
            )}

            <div className="w-px h-4 bg-slate-300 mx-1" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <p className="mt-4 text-muted-foreground animate-pulse">Carregando dados...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-destructive text-center">
          <TrendingDown className="h-12 w-12 mb-4 opacity-20" />
          <h3 className="text-lg font-semibold">Erro ao carregar dados</h3>
          <p className="text-sm opacity-80 max-w-md mt-2">{error.message}</p>
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center border-2 border-dashed border-slate-100 rounded-xl">
          <TrendingUp className="h-12 w-12 mb-4 opacity-20" />
          <h3 className="text-lg font-semibold text-slate-700">Sem dados para exibir</h3>
          <p className="text-sm opacity-80 max-w-md mt-2">Nenhum registro encontrado para os filtros selecionados.</p>
          {drillPath.length > 0 && (
            <Button variant="outline" onClick={handleBack} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          <AnimatePresence>
            {showChart && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full border rounded-xl p-4 bg-slate-50/50"
              >
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'treemap' ? (
                      <Treemap
                        data={chartData}
                        dataKey="value"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill="#8884d8"
                        content={<CustomizedTreemapContent />}
                        onClick={(node) => {
                           if(node && node.name) handleDrilldown({ key: node.key || node.name, name: node.name });
                        }}
                        className="cursor-pointer"
                      >
                        <Tooltip content={<CustomTooltip />} />
                      </Treemap>
                    ) : (
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        onClick={(state) => {
                          if (state && state.activePayload) {
                            handleDrilldown(state.activePayload[0].payload);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={150} 
                          tick={{ fontSize: 12, fill: '#64748b' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                        <Bar 
                          dataKey="value" 
                          fill="#6366f1" 
                          radius={[0, 4, 4, 0]}
                          barSize={24}
                          animationDuration={800}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
                {hasGrowth && (
                    <div className="flex items-center justify-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center"><div className="w-3 h-3 bg-green-500 mr-1 rounded-sm"></div> Crescimento Positivo</span>
                        <span className="flex items-center"><div className="w-3 h-3 bg-red-500 mr-1 rounded-sm"></div> Crescimento Negativo</span>
                    </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border rounded-lg overflow-hidden flex flex-col bg-white shadow-sm">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center shrink-0">
              <span className="font-semibold text-sm text-slate-700">Lista Detalhada: {currentLabel}</span>
              <Badge variant="secondary">{totalItems} registros</Badge>
            </div>
            <div className="flex-1 overflow-auto min-h-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 font-medium text-slate-500 w-[30%]">Nome</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-right">Vendas</th>
                    {hasGrowth && <th className="px-4 py-3 font-medium text-slate-500 text-right">Crescimento</th>}
                    {hasClients && <th className="px-4 py-3 font-medium text-slate-500 text-right">Clientes</th>}
                    {hasTicket && <th className="px-4 py-3 font-medium text-slate-500 text-right">Ticket Médio</th>}
                    {hasConversion && <th className="px-4 py-3 font-medium text-slate-500 text-right">Taxa Conv.</th>}
                    {hasMargin && <th className="px-4 py-3 font-medium text-slate-500 text-right">Margem Est.</th>}
                    <th className="px-4 py-3 font-medium text-slate-500 text-right">Partic. (%)</th>
                    <th className="px-4 py-3 font-medium text-slate-500 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableData.map((row, idx) => (
                    <tr 
                      key={`${row.key}-${idx}`} 
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => handleDrilldown(row)}
                    >
                      <td className="px-4 py-3 font-medium text-slate-700 group-hover:text-primary transition-colors">
                        {row.name || 'Sem Nome'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {formatCurrency(row.value)}
                      </td>
                      {hasGrowth && (
                        <td className={cn("px-4 py-3 text-right font-mono", row.growth >= 0 ? "text-green-600" : "text-red-600")}>
                            {row.growth > 0 ? '+' : ''}{formatPercentage(row.growth)}
                        </td>
                      )}
                      {hasClients && (
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                            {formatNumber(row.clients)}
                        </td>
                      )}
                      {hasTicket && (
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                            {formatCurrency(row.average_ticket)}
                        </td>
                      )}
                      {hasConversion && (
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                            {formatPercentage(row.conversion_rate)}
                        </td>
                      )}
                      {hasMargin && (
                        <td className="px-4 py-3 text-right font-mono text-emerald-600">
                            {formatCurrency(row.margin)}
                        </td>
                      )}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-slate-500 w-12">{formatPercentage((row.value / totalValue) * 100)}</span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${Math.min(((row.value / totalValue) * 100), 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-semibold">
                  <tr>
                    <td className="px-4 py-3">Total (Página)</td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatCurrency(tableData.reduce((acc, curr) => acc + (curr.value || 0), 0))}
                    </td>
                    {hasGrowth && <td className="px-4 py-3"></td>}
                    {hasClients && <td className="px-4 py-3 text-right font-mono">{formatNumber(tableData.reduce((acc, curr) => acc + (curr.clients || 0), 0))}</td>}
                    {hasTicket && <td className="px-4 py-3"></td>}
                    {hasConversion && <td className="px-4 py-3"></td>}
                    {hasMargin && <td className="px-4 py-3 text-right font-mono">{formatCurrency(tableData.reduce((acc, curr) => acc + (curr.margin || 0), 0))}</td>}
                    <td className="px-4 py-3 text-right">-</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="bg-white border-t px-4 py-3 flex items-center justify-between shrink-0">
                <div className="text-xs text-muted-foreground">
                  Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} até {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} de {totalItems}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(DrilldownExplorer);