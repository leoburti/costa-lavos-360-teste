/**
 * CONFIGURAÇÕES GERAIS DO SISTEMA
 */

export const CONFIG = {
  // API Settings
  API: {
    TIMEOUT: 30000, // 30 segundos
    RETRY_COUNT: 2,
    RETRY_DELAY: 1000, // 1 segundo
  },

  // Paginação Padrão
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },

  // Configurações de Cache (em milissegundos)
  CACHE: {
    STALE_TIME: 1000 * 60 * 5, // 5 minutos
    GC_TIME: 1000 * 60 * 30,   // 30 minutos
  },

  // Formatos de Data e Moeda
  FORMAT: {
    DATE: 'dd/MM/yyyy',
    DATETIME: 'dd/MM/yyyy HH:mm',
    LOCALE: 'pt-BR',
    CURRENCY: 'BRL',
  }
};