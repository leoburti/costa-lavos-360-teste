import React from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';
import ConfiguracaoInput from '@/components/ConfiguracaoInput';

const PreferenciasGeolocalizacaoPage = () => {
  return (
    <>
      <Helmet><title>Geolocalização (APoio) - Configurações</title></Helmet>
      <div className="space-y-8">
        <ConfiguracaoGrupo
          titulo="Check-in e Check-out"
          descricao="Defina as regras e requisitos para os registros de chegada e saída."
        >
          <ConfiguracaoInput label="Raio Permitido para Check-in (metros)" tipo="number" valor="150" />
          <ConfiguracaoSwitch label="Exigir foto de prova no check-in" />
          <ConfiguracaoSwitch label="Exigir foto de prova no check-out" checked />
          <ConfiguracaoInput label="Precisão mínima do GPS (metros)" tipo="number" valor="50" />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Rastreamento de Rota"
          descricao="Configure o rastreamento de localização dos profissionais em campo."
        >
          <ConfiguracaoSwitch label="Ativar rastreamento de rota em tempo real" checked />
          <ConfiguracaoInput label="Intervalo de rastreamento (segundos)" tipo="number" valor="60" />
          <ConfiguracaoInput label="Armazenar histórico de rotas por (dias)" tipo="number" valor="90" />
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default PreferenciasGeolocalizacaoPage;