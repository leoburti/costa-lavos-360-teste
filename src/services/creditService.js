import { supabase } from '@/lib/customSupabaseClient';

export const fetchCreditDossier = async ({ cnpj, cpf }) => {
  try {
    const { data, error } = await supabase.functions.invoke('directd-proxy', {
      body: { cnpj, cpf }
    });

    if (error) {
      console.error('Error invoking directd-proxy:', error);
      throw error;
    }

    if (data.error) {
        throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Credit Service Error:', error);
    throw new Error('Falha ao buscar o Dossié de Crédito. Verifique os dados e tente novamente.');
  }
};