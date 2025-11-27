import { supabase } from '@/lib/customSupabaseClient';

export const getContactBreadVolume = async (contactName) => {
    if (!contactName) return null;
    
    try {
        // Try to find the client in bd-cl to get "Quant Dia/KG"
        // Using text search on Name or Fantasy Name
        const { data, error } = await supabase
            .from('bd-cl')
            .select('"Quant Dia/KG"')
            .or(`"N Fantasia".ilike.%${contactName}%,"Nome".ilike.%${contactName}%`)
            .not('"Quant Dia/KG"', 'is', null)
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
            return data[0]['Quant Dia/KG'];
        }
        return null;
    } catch (error) {
        console.error('Error fetching bread volume:', error);
        return null;
    }
};

export const uploadQualificationPhoto = async (file, path) => {
    try {
        // Using 'manutencao' bucket as a fallback since it's known to exist and allow uploads based on previous context
        // Ideally this should be 'crm-uploads'
        const bucketName = 'Manutencao'; 
        const fileExt = file.name.split('.').pop();
        const fileName = `${path}/${Math.random()}.${fileExt}`;
        const filePath = `crm-qualification/${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file);

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;
    }
};

export const updateDealStage = async (dealId, stageId) => {
    const { data, error } = await supabase
        .from('crm_deals')
        .update({ stage_id: stageId })
        .eq('id', dealId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

export const approveQualification = async (contactId, userId) => {
    const { data: contact, error: fetchError } = await supabase
        .from('crm_contacts')
        .select('qualification_data')
        .eq('id', contactId)
        .single();
    
    if (fetchError) throw fetchError;

    const updatedData = {
        ...contact.qualification_data,
        approved: true,
        approved_by: userId,
        approved_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('crm_contacts')
        .update({ qualification_data: updatedData })
        .eq('id', contactId)
        .select()
        .single();

    if (error) throw error;
    return data;
};