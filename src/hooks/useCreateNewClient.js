import { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed or available

export const useCreateNewClient = () => {
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    const createClient = async (clientData) => {
        setIsCreating(true);
        try {
            // Generate a UUID for the 'id' field on the client-side
            const dataToInsert = {
                ...clientData,
                id: uuidv4(), // Ensures 'id' is not null
                dt_insert: new Date().toISOString(),
            };

            const { error } = await supabase
                .from('contele_insert_cliente')
                .insert([dataToInsert]);

            if (error) {
                throw error;
            }

            toast({
                title: 'Sucesso!',
                description: 'Novo cliente enviado para cadastro no Contele.',
            });
            return true;
        } catch (error) {
            console.error('Error creating new client:', error);
            toast({
                variant: 'destructive',
                title: 'Erro ao criar cliente',
                description: error.message || 'Ocorreu um problema ao tentar salvar o novo cliente.',
            });
            return false;
        } finally {
            setIsCreating(false);
        }
    };

    return { createClient, isCreating };
};