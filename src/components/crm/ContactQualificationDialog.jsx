import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import QualificationChecklist from './QualificationChecklist';

const ContactQualificationDialog = ({ deal, open, setOpen, onSaveSuccess }) => {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [qualificationData, setQualificationData] = useState(deal.crm_contacts?.qualification_data || {});

    const handleFieldChange = (field, value) => {
        setQualificationData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('crm_contacts')
            .update({ qualification_data: qualificationData })
            .eq('id', deal.contact_id);

        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
        } else {
            toast({ title: 'Sucesso!', description: 'Dados de qualificação salvos.' });
            onSaveSuccess({ ...deal, crm_contacts: { ...deal.crm_contacts, qualification_data: qualificationData }});
            setOpen(false);
        }
        setIsSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Checklist de Qualificação - {deal.crm_contacts?.fantasy_name}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-grow pr-6 -mr-6">
                    <QualificationChecklist 
                        qualificationData={qualificationData}
                        onFieldChange={handleFieldChange}
                    />
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                        Salvar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ContactQualificationDialog;