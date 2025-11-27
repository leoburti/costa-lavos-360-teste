import { startOfMonth, endOfMonth, getDate, getDaysInMonth } from 'date-fns';

/**
 * Transforms raw RPC data into a unified Dashboard structure.
 * 
 * @param {Object} overviewData - Result from get_overview_data_v2
 * @param {Array} dailyData - Result from get_daily_sales_data_v2
 * @param {Object} dateRange - { from: Date, to: Date }
 * @returns {Object} transformedData
 */
export const transformDashboardData = (overviewData, dailyData, dateRange) => {
  if (!overviewData) return null;

  const kpi = overviewData.kpi || {};
  const rankings = overviewData.rankings || {};

  // 1. Calculate Average Ticket
  const salesCount = Number(kpi.salesCount) || 0;
  const totalRevenue = Number(kpi.totalRevenue) || 0;
  const averageTicket = salesCount > 0 ? totalRevenue / salesCount : 0;

  // 2. Calculate Projection (Linear based on days passed in month)
  let projectedRevenue = 0;
  const today = new Date();
  
  // Check if the selected range includes "today" and is essentially "this month"
  // Ideally we check if dateRange.to is close to month end and dateRange.from is month start
  const rangeStart = new Date(dateRange?.from || new Date());
  const rangeEnd = new Date(dateRange?.to || new Date());
  
  const isCurrentMonth = 
    rangeStart.getMonth() === today.getMonth() && 
    rangeStart.getFullYear() === today.getFullYear();

  if (isCurrentMonth) {
    const daysPassed = getDate(today); // Day of month (1-31)
    const totalDays = getDaysInMonth(today);
    
    if (daysPassed > 0) {
      projectedRevenue = (totalRevenue / daysPassed) * totalDays;
    }
  } else {
      // For past months, projection is just the total
      projectedRevenue = totalRevenue;
  }

  // 3. Merge Daily Sales
  // get_daily_sales_data_v2 returns array of { date, total }
  const mergedDailySales = Array.isArray(dailyData) ? dailyData : [];

  return {
    kpi: {
      ...kpi,
      averageTicket,
      projectedRevenue: projectedRevenue > totalRevenue ? projectedRevenue : totalRevenue
    },
    dailySales: mergedDailySales,
    rankings: {
      salesBySupervisor: rankings.salesBySupervisor || [],
      salesBySeller: rankings.salesBySeller || [],
      regionalSales: rankings.regionalSales || [],
      salesByCustomerGroup: rankings.salesByCustomerGroup || [],
      salesByClient: rankings.salesByClient || []
    }
  };
};