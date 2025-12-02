import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import { useEquipmentMock } from '@/hooks/useEquipmentMock';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const EquipamentosEditar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getEquipmentById, updateEquipment, loading } = useEquipmentMock();
  const [initialData, setInitialData] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEquipmentById(id);
        setInitialData(data);
      } catch (error) {
        toast({ title: "Erro", description: "Equipamento não encontrado.", variant: "destructive" });
        navigate('/equipamentos');
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, getEquipmentById, navigate, toast]);

  const handleSubmit = async (data) => {
    try {
      await updateEquipment(id, data);
      toast({
        title: "Sucesso!",
        description: "Equipamento atualizado com sucesso.",
        variant: "success",
      });
      navigate(`/equipamentos/${id}`);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atualizar equipamento.",
        variant: "destructive",
      });
    }
  };

  if (fetching) return <div className="p-6"><Skeleton className="h-96 w-full max-w-3xl mx-auto" /></div>;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet>
        <title>Editar Equipamento | Costa Lavos</title>
      </Helmet>

      <PageHeader 
        title="Editar Equipamento" 
        breadcrumbs={[
            { label: 'Equipamentos', path: '/equipamentos' }, 
            { label: initialData?.name, path: `/equipamentos/${id}` },
            { label: 'Editar' }
        ]}
      />

      <div className="max-w-3xl mx-auto">
        <EquipmentForm 
            initialData={initialData} 
            onSubmit={handleSubmit} 
            loading={loading} 
            isEdit 
        />
      </div>
    </div>
  );
};

export default EquipamentosEditar;