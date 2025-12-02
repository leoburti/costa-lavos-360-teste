/**
 * Utilitários para agregação de dados de gráficos
 * Limita pontos de dados para melhor performance
 */

/**
 * Agregar dados para gráfico
 * Limita a máximo de pontos especificado
 * 
 * @param {Array} data - Dados originais
 * @param {number} maxPoints - Máximo de pontos (default: 500)
 * @param {string} dateKey - Chave de data (default: 'date')
 * @param {string} valueKey - Chave de valor (default: 'value')
 * @returns {Array} Dados agregados
 */
export function aggregateChartData(data, maxPoints = 500, dateKey = 'date', valueKey = 'value') {
  if (!data || data.length === 0) {
    return [];
  }

  // Se dados já estão dentro do limite, retornar como está
  if (data.length <= maxPoints) {
    return data;
  }

  // Calcular intervalo de agregação
  const interval = Math.ceil(data.length / maxPoints);

  // Agregar dados
  const aggregated = [];
  for (let i = 0; i < data.length; i += interval) {
    const chunk = data.slice(i, i + interval);
    
    // Calcular média dos valores
    const avgValue = chunk.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0) / chunk.length;
    
    // Usar primeira data do chunk
    aggregated.push({
      ...chunk[0],
      [valueKey]: avgValue,
    });
  }

  return aggregated;
}

/**
 * Agregar dados por período
 * Agrupa dados por dia, semana, mês, etc.
 * 
 * @param {Array} data - Dados originais
 * @param {string} period - Período ('day', 'week', 'month')
 * @param {string} dateKey - Chave de data
 * @param {string} valueKey - Chave de valor
 * @returns {Array} Dados agregados
 */
export function aggregateByPeriod(data, period = 'day', dateKey = 'date', valueKey = 'value') {
  if (!data || data.length === 0) {
    return [];
  }

  const grouped = {};

  data.forEach(item => {
    const date = new Date(item[dateKey]);
    let key;

    switch (period) {
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = date.toISOString().split('T')[0].substring(0, 7);
        break;
      case 'day':
      default:
        key = date.toISOString().split('T')[0];
    }

    if (!grouped[key]) {
      grouped[key] = {
        [dateKey]: key,
        [valueKey]: 0,
        count: 0,
      };
    }

    grouped[key][valueKey] += Number(item[valueKey]) || 0;
    grouped[key].count += 1;
  });

  // Converter para array e calcular média
  return Object.values(grouped).map(item => ({
    ...item,
    [valueKey]: item[valueKey] / item.count,
  }));
}

/**
 * Limitar dados a máximo de pontos
 * Remove pontos intermediários mantendo primeiro e último
 * 
 * @param {Array} data - Dados originais
 * @param {number} maxPoints - Máximo de pontos
 * @returns {Array} Dados limitados
 */
export function limitDataPoints(data, maxPoints = 500) {
  if (!data || data.length <= maxPoints) {
    return data;
  }

  const result = [];
  const step = Math.floor(data.length / maxPoints);

  for (let i = 0; i < data.length; i += step) {
    result.push(data[i]);
  }

  // Garantir que último ponto está incluído
  if (result[result.length - 1] !== data[data.length - 1]) {
    result.push(data[data.length - 1]);
  }

  return result;
}