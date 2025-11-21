import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Star, AlertTriangle, ShieldCheck } from 'lucide-react';

const kpiConfig = {
  ABC: {
    'A+': 'bg-sky-100 text-sky-800 border-sky-200',
    'A': 'bg-sky-100 text-sky-700 border-sky-200',
    'B': 'bg-blue-100 text-blue-800 border-blue-200',
    'C': 'bg-teal-100 text-teal-800 border-teal-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  RFM: {
    'Campeão': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Fiel': 'bg-green-100 text-green-800 border-green-200',
    'Potencial': 'bg-lime-100 text-lime-800 border-lime-200',
    'Em Risco': 'bg-amber-100 text-amber-800 border-amber-200',
    'Hibernando': 'bg-orange-100 text-orange-800 border-orange-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  Churn: {
    'Ativo': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Risco': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Elevado': 'bg-amber-100 text-amber-800 border-amber-200',
    'Crítico': 'bg-red-100 text-red-800 border-red-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  },
  Tendência: {
    'Crescimento': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Estabilidade': 'bg-blue-100 text-blue-800 border-blue-200',
    'Queda': 'bg-red-100 text-red-800 border-red-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  }
};

const sizeConfig = {
  normal: 'px-3 py-1 text-xs',
  tiny: 'px-2 py-0.5 text-[10px]'
}

const KPIBadge = ({ label, value, size = 'normal' }) => {
  if (!value) return null;

  const config = kpiConfig[label] || {};
  const colorClass = config[value] || config.default;
  const sizeClass = sizeConfig[size] || sizeConfig.normal;

  return (
    <div className={cn(
      'flex items-center gap-1.5 font-semibold rounded-full border',
      colorClass,
      sizeClass
    )}>
      <span className="font-bold">{label}:</span>
      <span>{value}</span>
    </div>
  );
};

export default KPIBadge;