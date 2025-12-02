import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  subDays, 
  subMonths, 
  subYears,
  format as formatFn,
  isValid
} from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value) => {
  const amount = Number(value);
  if (isNaN(amount)) return 'R$ 0,00';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('pt-BR').format(num);
};

export const formatLargeNumberCompact = (num) => {
  const amount = Number(num);
  if (isNaN(amount)) return '0';

  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(amount);
};

export const formatPercentage = (value) => {
  const num = Number(value);
  if (isNaN(num)) return '0,00%';
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num) + '%';
};

export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!isValid(dateObj)) return '-';
    return formatFn(dateObj, formatString, { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '-';
  }
};

export const formatDateForAPI = (date) => {
  if (!date) return null;
  
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  try {
    const d = date instanceof Date ? date : new Date(date);
    if (!isValid(d)) return null;
    return formatFn(d, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for API:', date, error);
    return null;
  }
};

export const getDateRange = (preset) => {
  const today = new Date();
  
  switch (preset) {
    case 'today':
      return { from: startOfDay(today), to: endOfDay(today) };
    case 'yesterday':
      const yesterday = subDays(today, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    case 'this_week':
      return { from: startOfWeek(today, { weekStartsOn: 0 }), to: endOfWeek(today, { weekStartsOn: 0 }) };
    case 'this_month':
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case 'last_month':
      const lastMonth = subMonths(today, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    default:
      return { from: startOfMonth(today), to: endOfMonth(today) };
  }
};