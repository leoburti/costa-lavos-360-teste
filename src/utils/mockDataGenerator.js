import { faker } from '@faker-js/faker';

// Set seed for consistent results across re-renders
faker.seed(123);

/**
 * Helper to generate random currency values
 */
const generateCurrency = (min, max) => {
  return Number(faker.finance.amount(min, max, 2));
};

/**
 * Helper to generate trend percentage
 */
const generateTrend = () => {
  return faker.number.int({ min: -15, max: 35 });
};

/**
 * Generator for Dashboard KPIs and Charts
 */
export const generateDashboardMock = () => {
  const dailySales = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
      total: generateCurrency(15000, 50000),
      bonification: generateCurrency(1000, 5000),
      equipment: generateCurrency(500, 3000)
    };
  });

  return {
    kpi: {
      totalRevenue: generateCurrency(1200000, 1500000),
      salesCount: faker.number.int({ min: 300, max: 600 }),
      averageTicket: generateCurrency(3000, 5000),
      activeClients: faker.number.int({ min: 120, max: 200 }),
      yoyGrowth: generateTrend(),
      conversionRate: faker.number.int({ min: 15, max: 45 }),
      totalBonification: generateCurrency(50000, 100000),
      projectedRevenue: generateCurrency(1400000, 1700000)
    },
    dailySales,
    rankingData: Array.from({ length: 5 }, (_, i) => ({
      rank: i + 1,
      name: faker.person.fullName(),
      sales: generateCurrency(50000, 200000),
      growth: generateTrend()
    })),
    salesData: dailySales.map(d => ({
      name: d.date.split('-').slice(1).join('/'), // MM/DD
      receita: d.total,
      bonificacao: d.bonification
    }))
  };
};

/**
 * Generator for Churn Analysis
 */
export const generateChurnMock = () => {
  return Array.from({ length: 50 }, () => ({
    client_id: faker.string.uuid(),
    client_name: faker.company.name(),
    last_purchase_date: faker.date.recent({ days: 90 }).toISOString().split('T')[0],
    days_since_purchase: faker.number.int({ min: 1, max: 90 }),
    churn_risk: faker.helpers.arrayElement(['Baixo', 'Médio', 'Alto', 'Crítico']),
    total_purchases: faker.number.int({ min: 5, max: 100 }),
    total_spent: generateCurrency(10000, 500000),
    average_order_value: generateCurrency(1000, 10000)
  })).sort((a, b) => b.days_since_purchase - a.days_since_purchase);
};

/**
 * Generator for RFM Analysis
 */
export const generateRFMMock = () => {
  const segments = [
    { name: 'Campeões', count: 15, value: 450000 },
    { name: 'Fiéis', count: 25, value: 350000 },
    { name: 'Promissores', count: 30, value: 200000 },
    { name: 'Novos', count: 10, value: 50000 },
    { name: 'Em Risco', count: 20, value: 150000 },
    { name: 'Hibernando', count: 15, value: 80000 }
  ];
  
  return {
    segments,
    clientList: Array.from({ length: 20 }, () => ({
      clientName: faker.company.name(),
      segment: faker.helpers.arrayElement(segments).name,
      recency: faker.number.int({ min: 1, max: 180 }),
      frequency: faker.number.int({ min: 1, max: 50 }),
      monetary: generateCurrency(5000, 100000),
      rScore: faker.number.int({ min: 1, max: 5 }),
      fScore: faker.number.int({ min: 1, max: 5 }),
      mScore: faker.number.int({ min: 1, max: 5 })
    }))
  };
};

/**
 * Generator for ABC Analysis (Products/Clients)
 */
export const generateABCMock = () => {
  return Array.from({ length: 50 }, (_, i) => {
    const revenue = generateCurrency(1000, 100000);
    let classification = 'C';
    if (i < 10) classification = 'A';
    else if (i < 25) classification = 'B';

    return {
      name: faker.commerce.productName(), // or Company Name
      revenue: revenue,
      margin: revenue * 0.3, // 30% margin
      accumulated_percent: (i / 50) * 100,
      classification
    };
  }).sort((a, b) => b.revenue - a.revenue);
};

/**
 * Generator for Financial Reports
 */
export const generateFinancialReportMock = (type = 'receita') => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() - i);
    const monthStr = month.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    
    const baseValue = generateCurrency(800000, 1200000);
    
    if (type === 'receita') {
      return {
        period: monthStr,
        total_revenue: baseValue,
        revenue_growth: generateTrend(),
        revenue_forecast: baseValue * 1.05
      };
    } else if (type === 'margem') {
      return {
        product_name: faker.commerce.productName(),
        revenue: baseValue / 10,
        cost: (baseValue / 10) * 0.6,
        margin_percentage: faker.number.float({ min: 15, max: 45, precision: 0.1 })
      };
    } else { // Lucratividade
      return {
        product_name: faker.commerce.productName(),
        revenue: baseValue / 10,
        cost: (baseValue / 10) * 0.5,
        profit: (baseValue / 10) * 0.5,
        profit_margin: faker.number.float({ min: 20, max: 60, precision: 0.1 })
      };
    }
  });
};

/**
 * Generator for Performance/Operational Reports
 */
export const generatePerformanceReportMock = (type = 'meta') => {
  return Array.from({ length: 15 }, () => {
    const target = generateCurrency(50000, 100000);
    const achieved = generateCurrency(30000, 120000);
    
    if (type === 'meta') {
      return {
        seller_name: faker.person.fullName(),
        target: target,
        achieved: achieved,
        achievement_rate: (achieved / target) * 100
      };
    } else if (type === 'ranking') {
      return {
        ranking: faker.number.int({min: 1, max: 100}),
        seller_name: faker.person.fullName(),
        total_sales: achieved,
        performance_score: faker.number.float({ min: 60, max: 99, precision: 0.1 })
      };
    } else { // SLA
      return {
        service_name: faker.helpers.arrayElement(['Entrega', 'Atendimento', 'Manutenção', 'Instalação']),
        sla_target: 95,
        sla_compliance: faker.number.float({ min: 80, max: 100, precision: 0.1 }),
        status: faker.number.float({ min: 80, max: 100 }) > 95 ? 'Cumprido' : 'Não Cumprido'
      };
    }
  });
};

/**
 * Main Dispatcher
 */
export const getMockDataForPage = (pageId) => {
  console.log(`[MockGenerator] Generating data for: ${pageId}`);
  
  if (pageId.includes('dashboard') || pageId.includes('gerencial')) return generateDashboardMock();
  if (pageId.includes('churn')) return generateChurnMock();
  if (pageId.includes('rfm') || pageId.includes('fidelidade')) return generateRFMMock();
  if (pageId.includes('abc') || pageId.includes('curve')) return generateABCMock();
  
  // Financial
  if (pageId.includes('financeiro-receita')) return generateFinancialReportMock('receita');
  if (pageId.includes('financeiro-margem')) return generateFinancialReportMock('margem');
  if (pageId.includes('financeiro-lucro') || pageId.includes('lucratividade')) return generateFinancialReportMock('lucratividade');
  
  // Performance
  if (pageId.includes('desempenho-meta')) return generatePerformanceReportMock('meta');
  if (pageId.includes('desempenho-ranking')) return generatePerformanceReportMock('ranking');
  
  // Operational
  if (pageId.includes('operacional')) return generatePerformanceReportMock('sla');

  // Generic Fallback for Analysis pages (Supervisor, Seller, Region, Product)
  if (pageId.includes('analitico') || pageId.includes('analise')) {
    // Return a generic list structure often used in these pages
    return Array.from({ length: 20 }, () => ({
      name: faker.helpers.arrayElement([faker.person.fullName(), faker.location.city(), faker.commerce.productName()]),
      value: generateCurrency(10000, 200000), // Sales
      sales: generateCurrency(10000, 200000), // Sales alias
      percentage: faker.number.float({ min: 1, max: 25, precision: 0.1 }),
      total_orders: faker.number.int({ min: 10, max: 150 })
    })).sort((a, b) => b.value - a.value);
  }

  return [];
};