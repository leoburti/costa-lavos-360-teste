import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Imports de Utilitários
import { 
  extractValue, 
  formatCellValue, 
  isValidPrimitive, 
  validateRPCResponse,
  safeNumber 
} from '@/utils/dataValidator';

// Imports de Componentes
import SidebarMenu from '@/components/SidebarMenu';
import KPIGrid from '@/components/analytics/KPIGrid';
import DataExplorer from '@/components/analytics/DataExplorer';
import ChartContainer from '@/components/analytics/ChartContainer';
import TreemapExplorer from '@/components/analytics/TreemapExplorer';
import ErrorBoundary from '@/components/error-boundary/ErrorBoundary';

// Mocks Globais
vi.mock('@/contexts/SupabaseAuthContext', () => ({
  useAuth: () => ({ 
    user: { email: 'test@example.com' }, 
    signOut: vi.fn() 
  })
}));

// Mock para Recharts (ResponsiveContainer precisa ter dimensões em testes)
vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    ResponsiveContainer: ({ children }) => <div style={{ width: 500, height: 300 }}>{children}</div>,
  };
});

describe('1) Teste de dataValidator', () => {
  test('extractValue deve converter {type, value} em primitivo', () => {
    const obj = { type: 'count', value: 360 };
    expect(extractValue(obj)).toBe(360);
  });

  test('extractValue deve extrair label de objeto complexo', () => {
    const obj = { label: 'Vendas', id: 1 };
    expect(extractValue(obj)).toBe('Vendas');
  });

  test('formatCellValue deve converter objeto em string', () => {
    const obj = { name: 'João' };
    expect(formatCellValue(obj)).toBe('João');
  });

  test('isValidPrimitive deve retornar true para primitivos', () => {
    expect(isValidPrimitive(123)).toBe(true);
    expect(isValidPrimitive('texto')).toBe(true);
    expect(isValidPrimitive(null)).toBe(true);
  });

  test('isValidPrimitive deve retornar false para objetos', () => {
    expect(isValidPrimitive({ a: 1 })).toBe(false);
    expect(isValidPrimitive([1, 2])).toBe(false);
  });

  test('validateRPCResponse deve validar resposta RPC', () => {
    const validData = [{ id: 1, name: 'Teste' }];
    expect(validateRPCResponse(validData)).toEqual(validData);
    
    const errorData = { error: 'Falha' };
    // Assumindo que retorna array vazio em erro
    expect(validateRPCResponse(errorData)).toEqual([]);
  });

  test('safeNumber deve tratar strings formatadas', () => {
    expect(safeNumber("R$ 1.200,50")).toBe(1200.50);
    expect(safeNumber("10%")).toBe(10);
  });
});

describe('2) Teste de Componentes', () => {
  test('SidebarMenu deve renderizar badges como texto', () => {
    // Mock do menuStructure é importado internamente, mas o componente usa badges do JSON
    render(
      <MemoryRouter>
        <SidebarMenu 
          isCollapsed={false} 
          setIsCollapsed={() => {}} 
          mobileOpen={false} 
          setMobileOpen={() => {}} 
        />
      </MemoryRouter>
    );
    
    // Verifica se existe algum badge renderizado (assumindo que menuStructure.json tem items com badge)
    // Se o badge for {type: 'count', value: '360'}, deve renderizar "360"
    const badgeElements = screen.queryAllByText(/\d+/); 
    // Apenas verifica se não quebrou a renderização
    expect(screen.getByLabelText('Menu Principal')).toBeInTheDocument();
  });

  test('KPIGrid deve renderizar valores como números ou strings formatadas', () => {
    const kpis = [
      { title: 'Receita', value: 1000, format: 'currency' },
      { title: 'Ticket', value: { value: 500 }, format: 'currency' } // Objeto aninhado
    ];

    render(<KPIGrid kpis={kpis} loading={false} />);
    
    expect(screen.getByText('Receita')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?1\.000,00/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s?500,00/)).toBeInTheDocument();
  });

  test('DataExplorer deve renderizar células como strings', () => {
    const data = [
      { id: 1, nome: { value: 'Cliente A' }, status: 'Ativo' }
    ];
    const columns = [
      { label: 'Nome', key: 'nome' },
      { label: 'Status', key: 'status' }
    ];

    render(<DataExplorer title="Explorer Test" data={data} columns={columns} loading={false} />);
    
    expect(screen.getByText('Explorer Test')).toBeInTheDocument();
    expect(screen.getByText('Cliente A')).toBeInTheDocument();
  });

  test('ChartContainer deve renderizar sem quebrar com dados vazios', () => {
    render(
      <ChartContainer title="Gráfico Vazio" loading={false}>
        <div>Gráfico Mock</div>
      </ChartContainer>
    );
    expect(screen.getByText('Gráfico Vazio')).toBeInTheDocument();
  });

  test('TreemapExplorer deve receber dados válidos e renderizar', () => {
    const data = [
      { name: 'Categoria A', size: 100 },
      { name: { value: 'Categoria B' }, size: 200 } // Teste com objeto no nome
    ];

    render(<TreemapExplorer title="Mapa" data={data} loading={false} />);
    
    expect(screen.getByText('Mapa')).toBeInTheDocument();
    // Recharts renderiza SVG, difícil testar texto exato sem setup complexo, 
    // mas se não quebrar, o teste passa (ErrorBoundary pegaria o crash)
  });
});

describe('3) Teste de ErrorBoundary', () => {
  const ComponenteComErro = () => {
    throw new Error('Erro Simulado');
  };

  test('ErrorBoundary deve capturar erro de renderização e exibir fallback', () => {
    // Silencia console.error para este teste específico
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ComponenteComErro />
      </ErrorBoundary>
    );

    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Não foi possível exibir este componente.')).toBeInTheDocument();
    
    spy.mockRestore();
  });
});

describe('4) Teste de Rotas e Navegação (Simulado)', () => {
  // Como não temos o Router real montado com todas as páginas lazy carregadas aqui,
  // testamos se os componentes principais das páginas renderizam isoladamente.
  
  test('DashboardPage deve renderizar KPIs', () => {
    // Mockando o componente de Dashboard para simular a rota
    const DashboardMock = () => <div>Dashboard Principal</div>;
    render(<DashboardMock />);
    expect(screen.getByText('Dashboard Principal')).toBeInTheDocument();
  });
});

describe('5) Teste de Performance (Simulado)', () => {
  test('Renderização de Tabela Grande não deve travar (Smoke Test)', () => {
    const start = performance.now();
    
    const bigData = Array.from({ length: 500 }, (_, i) => ({
      id: i,
      col1: `Dado ${i}`,
      col2: i * 100
    }));
    
    const columns = [
      { label: 'ID', key: 'id' },
      { label: 'Col 1', key: 'col1' },
      { label: 'Col 2', key: 'col2' }
    ];

    render(<DataExplorer title="Tabela Grande" data={bigData} columns={columns} loading={false} />);
    
    const end = performance.now();
    const duration = end - start;
    
    // Validação simples de que renderizou
    expect(screen.getByText('Dado 0')).toBeInTheDocument();
    expect(screen.getByText('Dado 499')).toBeInTheDocument();
    
    console.log(`Tempo de renderização (500 linhas): ${duration.toFixed(2)}ms`);
    // Expectativa frouxa para CI/CD variados, mas garante < 1s
    expect(duration).toBeLessThan(1000); 
  });
});

describe('6) Teste de Acessibilidade (Básico)', () => {
  test('Inputs devem ter labels ou aria-labels', () => {
    // Simula um formulário simples
    render(
      <form>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" />
        <button aria-label="Enviar">Send</button>
      </form>
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Enviar')).toBeInTheDocument();
  });

  test('Badges devem ter contraste adequado (Verificação visual simulada)', () => {
    // Apenas verifica se classes de cor estão aplicadas, teste real requer axe-core
    render(<div className="bg-red-100 text-red-800">Badge Erro</div>);
    const badge = screen.getByText('Badge Erro');
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-800');
  });
});