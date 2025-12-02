/**
 * DEFINIÇÕES DE TIPOS (JSDoc)
 * Como o projeto é estritamente JavaScript, usamos JSDoc para documentação de tipos.
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {'admin' | 'supervisor' | 'seller'} role
 */

/**
 * @typedef {Object} FilterState
 * @property {[Date, Date]} dateRange
 * @property {string[]} [supervisors]
 * @property {string[]} [sellers]
 * @property {string[]} [regions]
 * @property {string[]} [clients]
 * @property {string[]} [customerGroups]
 * @property {boolean} excludeEmployees
 * @property {string} [searchTerm]
 * @property {boolean} showDefinedGroupsOnly
 */

/**
 * @typedef {Object} RpcResponse
 * @property {any} data
 * @property {Error|null} error
 */

export const Types = {}; // Placeholder export