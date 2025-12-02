import { useState, useEffect } from 'react';
import { validateModulesStructure } from '@/lib/configValidator';
import { modulesStructure } from '@/config/modulesStructure';

export function useModulesValidation() {
  const [validationState, setValidationState] = useState({
    isValid: true,
    errors: [],
    warnings: []
  });

  useEffect(() => {
    const { valid, errors, warnings } = validateModulesStructure(modulesStructure);
    
    // Logar apenas em desenvolvimento para não poluir console de produção
    if (process.env.NODE_ENV === 'development') {
      if (!valid) {
        console.error('[Config Validation] Erros críticos encontrados em modulesStructure:', errors);
      }
      if (warnings.length > 0) {
        console.warn('[Config Validation] Avisos encontrados em modulesStructure:', warnings);
      }
    }

    setValidationState({ isValid: valid, errors, warnings });
  }, []);

  return validationState;
}