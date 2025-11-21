/**
 * Constantes para os status dos equipamentos de comodato.
 * Ajuda a manter a consistência entre o frontend e o banco de dados.
 */
export const EQUIPMENT_STATUS = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  EM_MANUTENCAO: 'em_manutencao',
  DESCARTADO: 'descartado',
  EM_COMODATO: 'em_comodato',
  DISPONIVEL: 'disponivel',
  INSTALADO: 'instalado', // Valor corrigido/adicionado
};

/**
 * Mapeamento dos status para rótulos legíveis.
 * Utilizado para exibição na interface do usuário.
 */
export const EQUIPMENT_STATUS_LABELS = {
  [EQUIPMENT_STATUS.ATIVO]: 'Ativo',
  [EQUIPMENT_STATUS.INATIVO]: 'Inativo',
  [EQUIPMENT_STATUS.EM_MANUTENCAO]: 'Em Manutenção',
  [EQUIPMENT_STATUS.DESCARTADO]: 'Descartado',
  [EQUIPMENT_STATUS.EM_COMODATO]: 'Em Comodato',
  [EQUIPMENT_STATUS.DISPONIVEL]: 'Disponível',
  [EQUIPMENT_STATUS.INSTALADO]: 'Instalado',
};

// Objeto para usar em selects/dropdowns
export const equipmentStatusOptions = Object.entries(EQUIPMENT_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));