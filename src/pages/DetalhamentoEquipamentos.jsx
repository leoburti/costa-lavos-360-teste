import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Settings, CheckCircle, AlertCircle, XCircle, Package, Calendar } from 'lucide-react';
import ChartCard from '@/components/ChartCard';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const DetalhamentoEquipamentos = () => {
  const equipamentos = [
    { id: 'FT-001', tipo: 'Forno Turbo F-10', cliente: 'Padaria Central', status: 'Operacional', ultimaManutencao: '2025-07-15' },
    { id: 'FV-002', tipo: 'Freezer V-500', cliente: 'Supermercado Bom Preço', status: 'Operacional', ultimaManutencao: '2025-08-01' },
    { id: 'FE-003', tipo: 'Forno Elétrico E-5', cliente: 'Lanchonete Saborosa', status: 'Quebrado', ultimaManutencao: '2025-05-20' },
    { id: 'FT-004', tipo: 'Forno Turbo F-10', cliente: 'Hotelaria Premium', status: 'Manutenção', ultimaManutencao: '2025-09-10' },
    { id: 'FV-005', tipo: 'Freezer V-500', cliente: 'Rede Padarias Alfa', status: 'Operacional', ultimaManutencao: '2025-06-25' },
  ];

  const statusData = [
    { name: 'Operacional', value: 200, color: '#059669' },
    { name: 'Manutenção', value: 35, color: '#D97706' },
    { name: 'Quebrado', value: 23, color: '#DC2626' }
  ];

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Operacional': return { icon: CheckCircle, color: 'text-green-600' };
      case 'Manutenção': return { icon: AlertCircle, color: 'text-orange-600' };
      case 'Quebrado': return { icon: XCircle, color: 'text-red-600' };
      default: return { icon: CheckCircle, color: 'text-gray-500' };
    }
  };

  return (
    <>
      <Helmet>
        <title>Detalhamento de Equipamentos - Colsta Lavos</title>
        <meta name="description" content="Visão detalhada do status dos equipamentos em campo" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Detalhamento de Equipamentos</h1>
          <p className="text-gray-600">Status e informações de cada equipamento em comodato</p>
        </motion.div>

        {/* Status Geral */}
        <ChartCard title="Status Geral dos Equipamentos">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} equipamentos`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Lista de Equipamentos */}
        <ChartCard title="Lista de Equipamentos">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">ID</th>
                  <th scope="col" className="px-6 py-3">Tipo</th>
                  <th scope="col" className="px-6 py-3">Cliente</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Última Manutenção</th>
                </tr>
              </thead>
              <tbody>
                {equipamentos.map((equip, index) => {
                  const StatusIcon = getStatusInfo(equip.status).icon;
                  const statusColor = getStatusInfo(equip.status).color;
                  return (
                    <motion.tr
                      key={equip.id}
                      className="bg-white border-b"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{equip.id}</td>
                      <td className="px-6 py-4">{equip.tipo}</td>
                      <td className="px-6 py-4">{equip.cliente}</td>
                      <td className={`px-6 py-4 flex items-center space-x-2 ${statusColor}`}>
                        <StatusIcon size={16} />
                        <span>{equip.status}</span>
                      </td>
                      <td className="px-6 py-4">{new Date(equip.ultimaManutencao).toLocaleDateString()}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </>
  );
};

export default DetalhamentoEquipamentos;