import React from 'react';

/**
 * Converte qualquer valor em um número seguro.
 * Objetos são convertidos para 0 ou tentados extrair via 'value'.
 */
export const safeNumber = (val) => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/[^\d.-]/g, '')); // Remove caracteres não numéricos básicos (exceto . e -)
    return isNaN(parsed) ? 0 : parsed;
  }
  if (val && typeof val === 'object' && val.value !== undefined) {
    return safeNumber(val.value);
  }
  return 0;
};

/**
 * Extrai um valor primitivo (string, number, boolean) ou React Element seguro para renderização.
 * Evita erro "Objects are not valid as a React child".
 */
export const extractValue = (val, fallback = '') => {
  // 1. Null/Undefined
  if (val === null || val === undefined) return fallback;

  // 2. Primitivos válidos
  if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    return val;
  }

  // 3. React Elements (são objetos válidos para renderização)
  if (React.isValidElement(val)) {
    return val;
  }

  // 4. Objetos e Arrays (Onde o erro geralmente ocorre)
  if (typeof val === 'object') {
    // Tenta extrair propriedades comuns de wrappers
    if (val.hasOwnProperty('label')) return extractValue(val.label, fallback);
    if (val.hasOwnProperty('name')) return extractValue(val.name, fallback);
    if (val.hasOwnProperty('value')) return extractValue(val.value, fallback);
    if (val.hasOwnProperty('title')) return extractValue(val.title, fallback);

    // Tratamento de Data
    if (val instanceof Date) {
      return val.toLocaleDateString('pt-BR');
    }

    // Tratamento de Arrays
    if (Array.isArray(val)) {
      // Se for array vazio, fallback
      if (val.length === 0) return fallback;
      // Se array de primitivos, junta com vírgula
      if (val.every(item => typeof item !== 'object')) {
        return val.join(', ');
      }
      // Se for array de objetos, tenta extrair 'name' ou 'label' do primeiro item + "..."
      const first = val[0];
      const count = val.length;
      const firstVal = extractValue(first, '');
      if (firstVal) return `${firstVal}${count > 1 ? ` (+${count - 1})` : ''}`;
      
      return `[Array (${count})]`;
    }

    // Último recurso: JSON stringify seguro (para debug visual na tela, evita crash)
    try {
      // Não renderize o JSON completo se for muito grande
      const str = JSON.stringify(val);
      return str.length > 50 ? '{Objeto...}' : str;
    } catch (e) {
      return fallback;
    }
  }

  return fallback;
};

/**
 * Formata valores de células de tabela com segurança.
 */
export const formatCellValue = (val) => {
  return extractValue(val, '-');
};

/**
 * Valida e sanitiza respostas de RPC
 */
export const validateRPCResponse = (response) => {
  if (!response) return [];
  if (response.error) {
    console.error("RPC Error detected in validator:", response.error);
    return [];
  }
  if (Array.isArray(response)) return response;
  if (typeof response === 'object') return [response];
  return [];
};