import * as LucideIcons from 'lucide-react';

/**
 * Valida a estrutura do arquivo de configuração de módulos.
 * @param {Array} structure - O array exportado de modulesStructure.js
 * @returns {Object} { valid: boolean, errors: string[], warnings: string[] }
 */
export function validateModulesStructure(structure) {
  const errors = [];
  const warnings = [];
  const moduleIds = new Set();

  if (!Array.isArray(structure)) {
    errors.push("A estrutura raiz deve ser um array.");
    return { valid: false, errors, warnings };
  }

  structure.forEach((module, mIndex) => {
    // 1. Validação de Módulo
    if (!module.id) {
      errors.push(`Módulo no índice ${mIndex} não possui 'id'.`);
    } else {
      if (moduleIds.has(module.id)) {
        errors.push(`ID de módulo duplicado encontrado: '${module.id}'.`);
      }
      moduleIds.add(module.id);
    }

    if (!module.label) warnings.push(`Módulo '${module.id || mIndex}' não possui 'label'.`);
    
    if (module.color) {
      if (!/^#([0-9A-F]{3}){1,2}$/i.test(module.color)) {
        warnings.push(`Módulo '${module.id}' possui cor inválida: '${module.color}'. Use formato HEX.`);
      }
    } else {
      warnings.push(`Módulo '${module.id}' não possui 'color'. Usando padrão.`);
    }

    if (module.icon) {
      if (typeof module.icon === 'string' && !LucideIcons[module.icon]) {
        warnings.push(`Ícone '${module.icon}' do módulo '${module.id}' não encontrado na biblioteca Lucide.`);
      }
    } else {
      warnings.push(`Módulo '${module.id}' não possui 'icon'.`);
    }

    // 2. Validação de Grupos
    if (!module.groups || !Array.isArray(module.groups)) {
      // Fallback legado
      if (module.pages && Array.isArray(module.pages)) {
        warnings.push(`Módulo '${module.id}' usa estrutura legada 'pages' na raiz. Migrar para 'groups'.`);
      } else {
        errors.push(`Módulo '${module.id}' não possui array de 'groups'.`);
      }
    } else {
      module.groups.forEach((group, gIndex) => {
        if (!group.id) errors.push(`Grupo no índice ${gIndex} do módulo '${module.id}' não possui 'id'.`);
        if (!group.label) warnings.push(`Grupo '${group.id}' do módulo '${module.id}' não possui 'label'.`);

        // 3. Validação de Páginas/Itens
        const pages = group.pages || group.items;
        if (!pages || !Array.isArray(pages)) {
          errors.push(`Grupo '${group.id}' (Módulo '${module.id}') não possui array de 'pages'.`);
        } else {
          pages.forEach((page, pIndex) => {
            if (!page.id) errors.push(`Página no índice ${pIndex} do grupo '${group.id}' não possui 'id'.`);
            
            if (page.icon && typeof page.icon === 'string' && !LucideIcons[page.icon]) {
              warnings.push(`Ícone '${page.icon}' da página '${page.id}' não encontrado.`);
            }

            // Validação de path (se existir explícito)
            if (page.path && !page.path.startsWith('/')) {
              warnings.push(`Path da página '${page.id}' deve começar com '/' (valor atual: '${page.path}').`);
            }
          });
        }
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}