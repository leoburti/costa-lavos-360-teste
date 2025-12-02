import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import { useEquipmentMock } from '@/hooks/useEquipmentMock';
import { useToast } from '@/components/ui/use-toast';

const EquipamentosNovo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createEquipment, loading } = useEquipmentMock();

  const handleSubmit = async (data) => {
    try {
      await createEquipment(data);
      toast({
        title: "Sucesso!",
        description: "Equipamento cadastrado com sucesso.",
        variant: "success",
      });
      navigate('/equipamentos');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o equipamento.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Novo Equipamento | Costa Lavos</title>
      </Helmet>

      <PageHeader 
        title="Novo Equipamento" 
        breadcrumbs={[
            { label: 'Equipamentos', path: '/equipamentos' }, 
            { label: 'Novo' }
        ]}
      />

      <div className="max-w-3xl mx-auto">
        <EquipmentForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

export default EquipamentosNovo;