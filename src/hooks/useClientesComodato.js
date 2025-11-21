import { useState, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useClientesComodato = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_clientes_comodato').select('*');
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar clientes', description: error.message });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchClienteById = useCallback(async (id) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_clientes_comodato').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar cliente', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createCliente = useCallback(async (dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_clientes_comodato').insert([dados]).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Cliente criado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao criar cliente', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateCliente = useCallback(async (id, dados) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('apoio_clientes_comodato').update(dados).eq('id', id).select();
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso.' });
      return data;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar cliente', description: error.message });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteCliente = useCallback(async (id) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_clientes_comodato').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Cliente deletado com sucesso.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao deletar cliente', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const toggleAptoComodato = useCallback(async (id, currentValue) => {
    setLoading(true);
    try {
      const { error } = await supabase.from('apoio_clientes_comodato').update({ apto_comodato: !currentValue }).eq('id', id);
      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Status de aptidão alterado.' });
      return true;
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao alterar status', description: error.message });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    fetchClientes,
    fetchClienteById,
    createCliente,
    updateCliente,
    deleteCliente,
    toggleAptoComodato,
  };
};