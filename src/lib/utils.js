
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, startOfToday, endOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, subYears } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (value) => {
  const amount = Number(value);
  if (isNaN(amount)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return format(d, formatStr, { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

export const formatPercentage = (value) => {
  const amount = Number(value);
  if (isNaN(amount)) return '0%';
  
  // Assuming value is percent (e.g. 10 for 10%)
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount / 100);
};

export const getDateRange = (preset) => {
  const today = new Date();
  switch (preset) {
    case 'today':
      return { from: startOfToday(), to: endOfToday() };
    case 'this_week':
      return { from: startOfWeek(today, { locale: ptBR }), to: endOfWeek(today, { locale: ptBR }) };
    case 'this_month':
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case 'last_month': {
      const lastMonth = subMonths(today, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case 'this_year':
      return { from: startOfYear(today), to: endOfYear(today) };
    case 'last_year': {
      const lastYear = subYears(today, 1);
      return { from: startOfYear(lastYear), to: endOfYear(lastYear) };
    }
    default:
      return { from: startOfMonth(today), to: endOfMonth(today) };
  }
};

export const sortByProperty = (key, direction) => {
  return (a, b) => {
    if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property not found on either object
      return 0;
    }

    const varA = typeof a[key] === 'string' ? a[key].toUpperCase() : a[key];
    const varB = typeof b[key] === 'string' ? b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return direction === 'descending' ? comparison * -1 : comparison;
  };
};
