import { useState, useEffect, useMemo } from 'react';
import { faker } from '@faker-js/faker/locale/pt_BR';

export const useApoioMock = () => {
  const [loading, setLoading] = useState(true);

  // --- MOCK DATA GENERATORS ---

  const tickets = useMemo(() => Array.from({ length: 45 }).map(() => ({
    id: faker.string.uuid(),
    ticketNumber: `CH-${faker.string.numeric(5)}`,
    title: faker.hacker.phrase(),
    client: faker.company.name(),
    priority: faker.helpers.arrayElement(['alta', 'media', 'baixa', 'critica']),
    status: faker.helpers.arrayElement(['aberto', 'em_andamento', 'resolvido', 'fechado', 'aguardando']),
    category: faker.helpers.arrayElement(['Hardware', 'Software', 'Rede', 'Acesso', 'Outros']),
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    updatedAt: faker.date.recent({ days: 5 }).toISOString(),
    assignee: faker.person.fullName(),
    description: faker.lorem.paragraph(),
    comments: Array.from({ length: 3 }).map(() => ({
      id: faker.string.uuid(),
      author: faker.person.fullName(),
      text: faker.lorem.sentence(),
      date: faker.date.recent({ days: 2 }).toISOString()
    }))
  })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), []);

  const kbArticles = useMemo(() => Array.from({ length: 20 }).map(() => ({
    id: faker.string.uuid(),
    title: faker.hacker.phrase(),
    category: faker.helpers.arrayElement(['Instalação', 'Configuração', 'Troubleshooting', 'Segurança']),
    author: faker.person.fullName(),
    createdAt: faker.date.past().toISOString(),
    views: faker.number.int({ min: 10, max: 5000 }),
    status: 'publicado',
    content: faker.lorem.paragraphs(3)
  })), []);

  const faqs = useMemo(() => Array.from({ length: 15 }).map(() => ({
    id: faker.string.uuid(),
    question: faker.lorem.sentence() + '?',
    answer: faker.lorem.paragraph(),
    category: faker.helpers.arrayElement(['Geral', 'Financeiro', 'Técnico'])
  })), []);

  const systemStatus = useMemo(() => ({
    overall: 'operacional',
    services: [
      { name: 'API Gateway', status: 'operacional', uptime: '99.9%' },
      { name: 'Banco de Dados', status: 'operacional', uptime: '99.99%' },
      { name: 'Autenticação', status: 'degradado', uptime: '98.5%' },
      { name: 'Storage', status: 'operacional', uptime: '100%' },
      { name: 'Integração ERP', status: 'manutencao', uptime: 'N/A' },
    ],
    incidents: Array.from({ length: 5 }).map(() => ({
        id: faker.string.uuid(),
        title: 'Lentidão no Login',
        date: faker.date.recent({ days: 10 }).toISOString(),
        status: 'resolvido',
        impact: 'medio'
    }))
  }), []);

  const metrics = useMemo(() => ({
    avgResponseTime: '2h 15m',
    resolutionRate: 94.5,
    csatScore: 4.8,
    activeTickets: 12,
    ticketsByDay: Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR', { weekday: 'short' }),
        count: faker.number.int({ min: 5, max: 20 })
    })).reverse()
  }), []);

  const resources = useMemo(() => ({
    manuals: Array.from({ length: 10 }).map(() => ({ id: faker.string.uuid(), title: `Manual ${faker.commerce.productName()}`, type: 'PDF', size: '2.4 MB' })),
    videos: Array.from({ length: 8 }).map(() => ({ id: faker.string.uuid(), title: `Como usar ${faker.hacker.noun()}`, duration: '5:30', views: 120 })),
    tutorials: Array.from({ length: 12 }).map(() => ({ id: faker.string.uuid(), title: `Tutorial: ${faker.hacker.verb()}`, level: 'Iniciante' })),
  }), []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return {
    loading,
    tickets,
    kbArticles,
    faqs,
    systemStatus,
    metrics,
    resources
  };
};