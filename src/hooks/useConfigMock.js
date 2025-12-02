import { useState, useEffect, useMemo } from 'react';
import { faker } from '@faker-js/faker/locale/pt_BR';

export const useConfigMock = () => {
  const [loading, setLoading] = useState(true);

  const mockData = useMemo(() => {
    const users = Array.from({ length: 20 }).map(() => ({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: faker.helpers.arrayElement(['Admin', 'Gerente', 'Vendedor', 'Supervisor']),
      status: faker.helpers.arrayElement(['ativo', 'inativo']),
      lastAccess: faker.date.recent({ days: 7 }).toISOString(),
      team: faker.commerce.department()
    }));

    const teams = Array.from({ length: 8 }).map(() => ({
      id: faker.string.uuid(),
      name: `Equipe ${faker.commerce.department()}`,
      supervisor: faker.person.fullName(),
      membersCount: faker.number.int({ min: 2, max: 15 }),
      status: 'ativo'
    }));

    const products = Array.from({ length: 30 }).map(() => ({
      id: faker.string.uuid(),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      name: faker.commerce.productName(),
      category: faker.commerce.department(),
      price: parseFloat(faker.commerce.price()),
      stock: faker.number.int({ min: 0, max: 500 }),
      status: faker.helpers.arrayElement(['ativo', 'inativo', 'sem_estoque']),
      image: faker.image.url()
    }));

    const goals = Array.from({ length: 15 }).map(() => {
      const target = parseFloat(faker.commerce.price({ min: 10000, max: 50000 }));
      const realized = target * (faker.number.int({ min: 50, max: 120 }) / 100);
      return {
        id: faker.string.uuid(),
        period: 'Setembro/2024',
        seller: faker.person.fullName(),
        target: target,
        realized: realized,
        percentage: (realized / target) * 100,
        status: realized >= target ? 'atingida' : 'pendente'
      };
    });

    const integrations = [
      { id: '1', name: 'Slack', status: 'conectado', icon: 'Slack', description: 'Notificações de vendas no canal #vendas' },
      { id: '2', name: 'Salesforce', status: 'desconectado', icon: 'Cloud', description: 'Sincronização de CRM bidirecional' },
      { id: '3', name: 'Zapier', status: 'conectado', icon: 'Zap', description: 'Automação de fluxos de trabalho' },
      { id: '4', name: 'Google Sheets', status: 'conectado', icon: 'Sheet', description: 'Exportação diária de relatórios' },
      { id: '5', name: 'Stripe', status: 'desconectado', icon: 'CreditCard', description: 'Processamento de pagamentos' },
    ];

    const logs = Array.from({ length: 50 }).map(() => ({
      id: faker.string.uuid(),
      date: faker.date.recent({ days: 3 }).toISOString(),
      user: faker.person.fullName(),
      action: faker.helpers.arrayElement(['Login', 'Update', 'Create', 'Delete', 'Export']),
      module: faker.helpers.arrayElement(['Vendas', 'Produtos', 'Usuários', 'Configurações']),
      status: faker.helpers.arrayElement(['sucesso', 'erro', 'aviso']),
      details: faker.lorem.sentence()
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    return { users, teams, products, goals, integrations, logs };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return {
    loading,
    ...mockData
  };
};