import { useState, useEffect, useMemo } from 'react';
import { faker } from '@faker-js/faker/locale/pt_BR';

export const useBonificationMock = () => {
  const [loading, setLoading] = useState(true);
  
  // Mock Data Generators
  const dashboardData = useMemo(() => ({
    kpis: {
      totalBonified: 145250.00,
      averagePerSeller: 1250.00,
      highestBonification: 5400.00,
      totalSellersBonified: 42
    },
    topSellers: Array.from({ length: 10 }).map((_, i) => ({
      name: faker.person.fullName(),
      value: faker.number.float({ min: 2000, max: 8000, precision: 0.01 }),
    })).sort((a, b) => b.value - a.value),
    recentTable: Array.from({ length: 5 }).map(() => ({
      id: faker.string.uuid(),
      seller: faker.person.fullName(),
      period: 'Novembro 2025',
      value: faker.number.float({ min: 500, max: 3000, precision: 0.01 }),
      status: faker.helpers.arrayElement(['pago', 'pendente', 'processando'])
    }))
  }), []);

  const historyData = useMemo(() => 
    Array.from({ length: 25 }).map(() => {
        const gross = faker.number.float({ min: 1000, max: 5000, precision: 0.01 });
        const tax = gross * 0.15;
        return {
            id: faker.string.uuid(),
            date: faker.date.recent({ days: 90 }).toISOString(),
            seller: faker.person.fullName(),
            period: faker.date.past().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
            grossValue: gross,
            taxValue: tax,
            netValue: gross - tax,
            status: faker.helpers.arrayElement(['pago', 'pendente', 'cancelado'])
        };
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  , []);

  const [rulesData, setRulesData] = useState(
    Array.from({ length: 5 }).map(() => ({
      id: faker.string.uuid(),
      name: faker.commerce.department() + ' Bonus',
      description: faker.lorem.sentence(),
      type: faker.helpers.arrayElement(['Percentual', 'Fixo', 'Escalonado']),
      percentage: faker.number.int({ min: 1, max: 10 }),
      condition: '> R$ 10.000,00',
      active: faker.datatype.boolean()
    }))
  );

  useEffect(() => {
    // Simulate API delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Actions
  const toggleRuleStatus = (id) => {
    setRulesData(prev => prev.map(rule => 
      rule.id === id ? { ...rule, active: !rule.active } : rule
    ));
  };

  const deleteRule = (id) => {
    setRulesData(prev => prev.filter(rule => rule.id !== id));
  };

  const saveRule = (rule) => {
    if (rule.id) {
        setRulesData(prev => prev.map(r => r.id === rule.id ? { ...rule } : r));
    } else {
        setRulesData(prev => [...prev, { ...rule, id: faker.string.uuid(), active: true }]);
    }
  };

  return {
    loading,
    dashboardData,
    historyData,
    rulesData,
    toggleRuleStatus,
    deleteRule,
    saveRule
  };
};