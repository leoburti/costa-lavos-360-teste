import { describe, it, expect } from 'vitest';
import { modulesStructure } from '@/config/modulesStructure';
import { validateModulesStructure } from '@/lib/configValidator';
import * as LucideIcons from 'lucide-react';

describe('Configuration: modulesStructure', () => {
  it('should match the expected schema structure', () => {
    const validation = validateModulesStructure(modulesStructure);
    
    if (!validation.valid) {
      console.error('Validation Errors:', validation.errors);
    }
    
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should ensure all modules have valid IDs and unique IDs', () => {
    const ids = new Set();
    modulesStructure.forEach(module => {
      expect(module.id).toBeDefined();
      expect(ids.has(module.id)).toBe(false); // Check duplicate
      ids.add(module.id);
    });
  });

  it('should ensure all icons exist in Lucide React', () => {
    const checkIcon = (iconName) => {
      if (typeof iconName === 'string') {
        expect(LucideIcons[iconName]).toBeDefined();
      }
    };

    modulesStructure.forEach(module => {
      if (module.icon) checkIcon(module.icon);
      
      if (module.groups) {
        module.groups.forEach(group => {
          if (group.pages) {
            group.pages.forEach(page => {
              if (page.icon) checkIcon(page.icon);
            });
          }
        });
      }
    });
  });

  it('should ensure color codes are valid Hex', () => {
    const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;
    
    modulesStructure.forEach(module => {
      if (module.color) {
        expect(module.color).toMatch(hexRegex);
      }
    });
  });

  it('should ensure pages have valid path structures if defined', () => {
    modulesStructure.forEach(module => {
      module.groups?.forEach(group => {
        group.pages?.forEach(page => {
          if (page.path) {
            // Should start with / if it's an absolute path override, 
            // but relative paths are handled by SidebarMenu logic.
            // Validation rule in codebase: startsWith('/')
            // Let's relax this if the validator allows relative, but checking what validator says:
            // "Path da página... deve começar com '/'"
            expect(page.path.startsWith('/')).toBe(true);
          }
        });
      });
    });
  });
});