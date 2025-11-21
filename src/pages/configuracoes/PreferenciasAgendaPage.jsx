import React from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoInput from '@/components/ConfiguracaoInput';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';

const PreferenciasAgendaPage = () => {
  return (
    <>
      <Helmet><title>Agenda (APoio) - Configurações</title></Helmet>
      <div className="space-y-8">
        <ConfiguracaoGrupo
          titulo="Visualização Padrão"
          descricao="Defina a visualização padrão da sua agenda."
        >
          <ConfiguracaoInput label="Visualização Padrão" tipo="select" valor="semana" opcoes={[{ valor: 'dia', label: 'Dia' }, { valor: 'semana', label: 'Semana' }, { valor: 'mes', label: 'Mês' }]} />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Horário de Trabalho"
          descricao="Defina seu horário de trabalho padrão para facilitar o agendamento."
        >
          <ConfiguracaoInput label="Início do Expediente" tipo="time" valor="08:00" />
          <ConfiguracaoInput label="Fim do Expediente" tipo="time" valor="18:00" />
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo
          titulo="Notificações da Agenda"
          descricao="Configure lembretes para seus eventos."
        >
          <ConfiguracaoSwitch label="Enviar lembrete 15 minutos antes do evento" checked />
          <ConfiguracaoSwitch label="Notificar sobre conflitos de agendamento" checked />
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default PreferenciasAgendaPage;