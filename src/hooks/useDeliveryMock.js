import { useState, useEffect, useMemo } from 'react';
import { faker } from '@faker-js/faker/locale/pt_BR';

export const useDeliveryMock = () => {
  const [loading, setLoading] = useState(true);

  // --- MOCK DATA GENERATORS ---

  const deliveries = useMemo(() => Array.from({ length: 50 }).map(() => ({
    id: faker.string.uuid(),
    trackingId: `TRK-${faker.string.alphanumeric(8).toUpperCase()}`,
    client: faker.company.name(),
    address: faker.location.streetAddress(),
    status: faker.helpers.arrayElement(['pendente', 'em_rota', 'entregue', 'cancelado', 'falha']),
    date: faker.date.recent({ days: 10 }).toISOString(),
    driverId: faker.string.uuid(),
    driverName: faker.person.fullName(),
    value: parseFloat(faker.commerce.price({ min: 100, max: 5000 })),
    items: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(() => ({
        name: faker.commerce.productName(),
        qty: faker.number.int({ min: 1, max: 10 })
    })),
    history: Array.from({ length: 3 }).map(() => ({
        status: faker.helpers.arrayElement(['pedido_recebido', 'saiu_para_entrega', 'entregue']),
        date: faker.date.recent({ days: 2 }).toISOString(),
        obs: faker.lorem.sentence()
    })),
    coordinates: {
        lat: -23.55052 + (Math.random() - 0.5) * 0.1,
        lng: -46.633308 + (Math.random() - 0.5) * 0.1
    }
  })).sort((a, b) => new Date(b.date) - new Date(a.date)), []);

  const drivers = useMemo(() => Array.from({ length: 10 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    vehicle: faker.vehicle.vehicle(),
    plate: faker.vehicle.vrm(),
    status: faker.helpers.arrayElement(['disponivel', 'em_rota', 'indisponivel']),
    currentLocation: {
        lat: -23.55052 + (Math.random() - 0.5) * 0.1,
        lng: -46.633308 + (Math.random() - 0.5) * 0.1
    }
  })), []);

  const routes = useMemo(() => Array.from({ length: 15 }).map(() => ({
    id: faker.string.uuid(),
    name: `Rota ${faker.location.city()}`,
    driverId: drivers[faker.number.int({ min: 0, max: 9 })].id,
    driverName: drivers[faker.number.int({ min: 0, max: 9 })].name,
    date: faker.date.recent({ days: 5 }).toISOString(),
    distance: faker.number.float({ min: 10, max: 150, precision: 0.1 }) + ' km',
    time: faker.number.int({ min: 30, max: 400 }) + ' min',
    status: faker.helpers.arrayElement(['planejada', 'em_andamento', 'concluida']),
    deliveriesCount: faker.number.int({ min: 5, max: 20 })
  })), [drivers]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getDeliveryById = (id) => {
      return new Promise((resolve) => {
          setTimeout(() => resolve(deliveries.find(d => d.id === id)), 300);
      });
  };

  return {
    loading,
    deliveries,
    drivers,
    routes,
    getDeliveryById
  };
};