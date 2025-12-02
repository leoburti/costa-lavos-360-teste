/**
 * Valores padrão para garantir robustez na renderização de menus e rotas.
 */

export const defaultModule = {
  id: 'unknown-module',
  label: 'Módulo Sem Nome',
  icon: 'Package', // Ícone padrão seguro
  color: '#6B7280', // Cinza neutro
  groups: [],
  pages: [] // Suporte legado
};

export const defaultGroup = {
  id: 'unknown-group',
  label: 'Grupo Geral',
  pages: []
};

export const defaultPage = {
  id: 'unknown-page',
  label: 'Página Sem Nome',
  icon: 'File', // Ícone padrão seguro
  path: ''
};

export function getModuleWithDefaults(module) {
  return { ...defaultModule, ...module };
}

export function getGroupWithDefaults(group) {
  return { ...defaultGroup, ...group };
}

export function getPageWithDefaults(page) {
  return { ...defaultPage, ...page };
}