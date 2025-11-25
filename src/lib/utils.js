
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
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
  subYears 
} from "date-fns"

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

export const getDateRange = (preset) => {
  const today = new Date();
  
  switch (preset) {
    case 'today':
      return {
        from: startOfDay(today),
        to: endOfDay(today)
      };
    case 'yesterday':
      const yesterday = subDays(today, 1);
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday)
      };
    case 'this_week':
      return {
        from: startOfWeek(today, { weekStartsOn: 0 }),
        to: endOfWeek(today, { weekStartsOn: 0 })
      };
    case 'last_week':
      const lastWeek = subDays(today, 7);
      return {
        from: startOfWeek(lastWeek, { weekStartsOn: 0 }),
        to: endOfWeek(lastWeek, { weekStartsOn: 0 })
      };
    case 'this_month':
      return {
        from: startOfMonth(today),
        to: endOfMonth(today)
      };
    case 'last_month':
      const lastMonth = subMonths(today, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth)
      };
    case 'this_year':
      return {
        from: startOfYear(today),
        to: endOfYear(today)
      };
    case 'last_year':
      const lastYear = subYears(today, 1);
      return {
        from: startOfYear(lastYear),
        to: endOfYear(lastYear)
      };
    case 'last_30_days':
      return {
        from: subDays(today, 30),
        to: endOfDay(today)
      };
    case 'last_90_days':
      return {
        from: subDays(today, 90),
        to: endOfDay(today)
      };
    default:
      return {
        from: startOfMonth(today),
        to: endOfMonth(today)
      };
  }
};
