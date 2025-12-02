import { useState, useEffect, useCallback } from 'react';
import { faker } from '@faker-js/faker/locale/pt_BR';

const generateContacts = (count = 30) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    company: faker.company.name(),
    role: faker.person.jobTitle(),
    status: faker.helpers.arrayElement(['ativo', 'inativo', 'lead', 'prospect']),
    lastInteraction: faker.date.recent({ days: 30 }).toISOString(),
    address: faker.location.streetAddress(),
    createdAt: faker.date.past().toISOString(),
    avatar: faker.image.avatar(),
  }));
};

const generateDeals = (contacts, count = 40) => {
  return Array.from({ length: count }).map(() => {
    const contact = faker.helpers.arrayElement(contacts);
    const stage = faker.helpers.arrayElement(['prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechado']);
    return {
      id: faker.string.uuid(),
      title: `Negócio ${faker.commerce.productAdjective()} - ${contact.company}`,
      company: contact.company,
      contactId: contact.id,
      contactName: contact.name,
      value: parseFloat(faker.commerce.price({ min: 5000, max: 100000 })),
      stage: stage,
      probability: stage === 'fechado' ? 100 : faker.number.int({ min: 10, max: 90 }),
      closingDate: faker.date.future().toISOString(),
      owner: faker.person.fullName(),
      createdAt: faker.date.past().toISOString(),
    };
  });
};

const generateContracts = (deals, count = 20) => {
  const closedDeals = deals.filter(d => d.stage === 'fechado' || d.probability > 80);
  return Array.from({ length: count }).map(() => {
    const deal = faker.helpers.arrayElement(closedDeals.length > 0 ? closedDeals : deals);
    return {
      id: faker.string.uuid(),
      dealId: deal.id,
      client: deal.company,
      value: deal.value,
      startDate: faker.date.recent({ days: 60 }).toISOString(),
      endDate: faker.date.future({ years: 1 }).toISOString(),
      status: faker.helpers.arrayElement(['ativo', 'pendente', 'vencido', 'cancelado']),
      owner: deal.owner,
      type: faker.helpers.arrayElement(['Comodato', 'Fornecimento', 'Serviço']),
    };
  });
};

// Singleton Store
let store = {
  contacts: [],
  deals: [],
  contracts: [],
  initialized: false
};

export const useCRMMock = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ contacts: [], deals: [], contracts: [] });

  useEffect(() => {
    if (!store.initialized) {
      const contacts = generateContacts(30);
      const deals = generateDeals(contacts, 40);
      const contracts = generateContracts(deals, 20);
      store = { contacts, deals, contracts, initialized: true };
    }
    setData({ 
      contacts: store.contacts, 
      deals: store.deals, 
      contracts: store.contracts 
    });
  }, []);

  const getContactById = useCallback((id) => {
    return new Promise((resolve) => {
      setLoading(true);
      setTimeout(() => {
        const contact = store.contacts.find(c => c.id === id);
        setLoading(false);
        resolve(contact);
      }, 400);
    });
  }, []);

  const getDealById = useCallback((id) => {
    return new Promise((resolve) => {
      setLoading(true);
      setTimeout(() => {
        const deal = store.deals.find(d => d.id === id);
        setLoading(false);
        resolve(deal);
      }, 400);
    });
  }, []);

  const getContractById = useCallback((id) => {
    return new Promise((resolve) => {
      setLoading(true);
      setTimeout(() => {
        const contract = store.contracts.find(c => c.id === id);
        setLoading(false);
        resolve(contract);
      }, 400);
    });
  }, []);

  const updateDealStage = useCallback((dealId, newStage) => {
    return new Promise((resolve) => {
      const dealIndex = store.deals.findIndex(d => d.id === dealId);
      if (dealIndex > -1) {
        store.deals[dealIndex].stage = newStage;
        setData(prev => ({ ...prev, deals: [...store.deals] }));
      }
      resolve(true);
    });
  }, []);

  return {
    contacts: data.contacts,
    deals: data.deals,
    contracts: data.contracts,
    loading,
    getContactById,
    getDealById,
    getContractById,
    updateDealStage
  };
};