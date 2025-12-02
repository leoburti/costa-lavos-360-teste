import { useState, useEffect, useCallback } from 'react';
import { faker } from '@faker-js/faker/locale/pt_BR';

// Helper to generate mock data
const generateMockEquipments = (count = 50) => {
  return Array.from({ length: count }).map(() => ({
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    type: faker.helpers.arrayElement(['Freezer', 'Geladeira', 'Forno', 'Balcão', 'Expositor']),
    brand: faker.company.name(),
    model: faker.string.alphanumeric(5).toUpperCase(),
    serial: faker.string.alphanumeric(10).toUpperCase(),
    status: faker.helpers.arrayElement(['ativo', 'manutencao', 'inativo', 'baixado']),
    location: faker.location.streetAddress(),
    acquisitionDate: faker.date.past({ years: 5 }).toISOString(),
    value: parseFloat(faker.commerce.price({ min: 1000, max: 15000 })),
    warrantyExpiration: faker.date.future({ years: 2 }).toISOString(),
    description: faker.lorem.sentence(),
    lastMaintenance: faker.date.past({ years: 1 }).toISOString(),
    image: faker.image.urlLoremFlickr({ category: 'technics' }), // Placeholder
  }));
};

const generateMockMaintenances = (equipments, count = 100) => {
  return Array.from({ length: count }).map(() => {
    const equipment = faker.helpers.arrayElement(equipments);
    return {
      id: faker.string.uuid(),
      equipmentId: equipment.id,
      equipmentName: equipment.name,
      date: faker.date.recent({ days: 90 }).toISOString(),
      type: faker.helpers.arrayElement(['preventiva', 'corretiva', 'instalacao']),
      technician: faker.person.fullName(),
      status: faker.helpers.arrayElement(['concluida', 'pendente', 'agendada', 'cancelada']),
      cost: parseFloat(faker.commerce.price({ min: 100, max: 2000 })),
      description: faker.lorem.paragraph(),
    };
  });
};

const generateMockHistory = (equipmentId) => {
  return Array.from({ length: 5 }).map(() => ({
    id: faker.string.uuid(),
    date: faker.date.recent({ days: 365 }).toISOString(),
    action: faker.helpers.arrayElement(['Criado', 'Editado', 'Movimentado', 'Manutenção', 'Status Alterado']),
    user: faker.person.fullName(),
    description: faker.lorem.sentence(),
    details: faker.helpers.maybe(() => ({
      from: 'Ativo',
      to: 'Manutenção'
    }), { probability: 0.3 })
  })).sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Singleton store for the session
let store = {
  equipments: [],
  maintenances: [],
  initialized: false
};

export const useEquipmentMock = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ equipments: [], maintenances: [] });

  // Initialize data once
  useEffect(() => {
    if (!store.initialized) {
      const eqs = generateMockEquipments(50);
      const maints = generateMockMaintenances(eqs, 100);
      store = { equipments: eqs, maintenances: maints, initialized: true };
    }
    setData({ equipments: store.equipments, maintenances: store.maintenances });
  }, []);

  const getEquipmentById = useCallback((id) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setTimeout(() => {
        const eq = store.equipments.find(e => e.id === id);
        setLoading(false);
        if (eq) resolve(eq);
        else reject(new Error('Equipamento não encontrado'));
      }, 600);
    });
  }, []);

  const getHistoryByEquipmentId = useCallback((id) => {
    return new Promise((resolve) => {
      setLoading(true);
      setTimeout(() => {
        const history = generateMockHistory(id);
        setLoading(false);
        resolve(history);
      }, 500);
    });
  }, []);

  const createEquipment = useCallback((newEquipment) => {
    return new Promise((resolve) => {
      setLoading(true);
      setTimeout(() => {
        const created = {
          ...newEquipment,
          id: faker.string.uuid(),
          status: newEquipment.status || 'ativo',
          lastMaintenance: null
        };
        store.equipments = [created, ...store.equipments];
        setData(prev => ({ ...prev, equipments: store.equipments }));
        setLoading(false);
        resolve(created);
      }, 800);
    });
  }, []);

  const updateEquipment = useCallback((id, updates) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setTimeout(() => {
        const index = store.equipments.findIndex(e => e.id === id);
        if (index === -1) {
          setLoading(false);
          reject(new Error('Equipamento não encontrado'));
          return;
        }
        const updated = { ...store.equipments[index], ...updates };
        store.equipments[index] = updated;
        store.equipments = [...store.equipments]; // Trigger generic update
        setData(prev => ({ ...prev, equipments: store.equipments }));
        setLoading(false);
        resolve(updated);
      }, 800);
    });
  }, []);

  const deleteEquipment = useCallback((id) => {
    return new Promise((resolve) => {
      setLoading(true);
      setTimeout(() => {
        store.equipments = store.equipments.filter(e => e.id !== id);
        setData(prev => ({ ...prev, equipments: store.equipments }));
        setLoading(false);
        resolve(true);
      }, 600);
    });
  }, []);

  return {
    equipments: data.equipments,
    maintenances: data.maintenances,
    loading,
    getEquipmentById,
    getHistoryByEquipmentId,
    createEquipment,
    updateEquipment,
    deleteEquipment
  };
};