import React from 'react';
import { AlertTriangle } from 'lucide-react';

const MaintenanceBanner = () => {
  return (
    <div className="bg-amber-500 text-white px-4 py-2 text-sm font-medium text-center shadow-md relative z-50 flex items-center justify-center gap-2 animate-in slide-in-from-top-full duration-500">
      <AlertTriangle className="h-4 w-4 fill-white text-amber-600" />
      <span>
        MODO MANUTENÇÃO ATIVO: O acesso está bloqueado para usuários comuns. Você tem acesso como administrador.
      </span>
    </div>
  );
};

export default MaintenanceBanner;