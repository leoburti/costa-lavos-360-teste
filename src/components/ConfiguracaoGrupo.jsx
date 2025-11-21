import React from 'react';

const ConfiguracaoGrupo = ({ titulo, descricao, children }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

export default ConfiguracaoGrupo;