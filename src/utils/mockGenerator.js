/**
 * Gerador de dados mockados para fallback em caso de erro de API.
 */
export const mockGenerator = (type) => {
  switch (type) {
    case 'kpis':
      return [
        { label: 'Receita Total', value: 150000, trend: 'up', change: 12.5, format: 'currency' },
        { label: 'Pedidos', value: 450, trend: 'up', change: 5.2, format: 'number' },
        { label: 'Ticket Médio', value: 333.33, trend: 'down', change: -2.1, format: 'currency' },
        { label: 'Clientes Ativos', value: 120, trend: 'neutral', change: 0, format: 'number' }
      ];
    case 'chart':
      return Array.from({ length: 12 }, (_, i) => ({
        name: `Mês ${i + 1}`,
        value: Math.floor(Math.random() * 50000) + 10000,
        target: 40000
      }));
    case 'table':
      return Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Item ${i + 1}`,
        category: ['A', 'B', 'C'][i % 3],
        value: Math.floor(Math.random() * 1000),
        status: i % 2 === 0 ? 'Ativo' : 'Inativo'
      }));
    default:
      return [];
  }
};