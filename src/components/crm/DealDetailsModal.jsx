import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, FileSignature, ShieldCheck } from 'lucide-react';
import QualificationChecklist from './QualificationChecklist';
import RelationshipDashboard from './RelationshipDashboard';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { approveQualification } from '@/services/crmService';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const DealDetailsModal = ({ deal, open, setOpen, onUpdate }) => {
    const { toast } = useToast();
    const { userContext } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("qualification");
    const [qualificationData, setQualificationData] = useState(deal?.crm_contacts?.qualification_data || {});

    if (!deal) return null;

    const handleQualificationChange = (field, value) => {
        setQualificationData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveQualification = async () => {
        setIsSaving(true);
        const { error } = await supabase
            .from('crm_contacts')
            .update({ qualification_data: qualificationData })
            .eq('id', deal.contact_id);

        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
        } else {
            toast({ title: 'Sucesso', description: 'Dados de qualificação atualizados.' });
            onUpdate({ ...deal, crm_contacts: { ...deal.crm_contacts, qualification_data: qualificationData }});
        }
        setIsSaving(false);
    };

    const handleApprove = async () => {
        if (!userContext?.isSupervisor && !userContext?.isAdmin) {
            toast({ variant: 'destructive', title: 'Não autorizado', description: 'Apenas supervisores podem aprovar.' });
            return;
        }
        setIsSaving(true);
        try {
            const updatedContact = await approveQualification(deal.contact_id, userContext.id);
            toast({ title: 'Aprovado', description: 'Qualificação aprovada com sucesso.' });
            setQualificationData(updatedContact.qualification_data);
            onUpdate({ ...deal, crm_contacts: updatedContact });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro', description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const isApproved = qualificationData?.approved;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b bg-slate-50/50">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        {deal.title}
                        <span className="text-sm font-normal text-muted-foreground px-2 py-1 bg-slate-100 rounded-full border">
                            {deal.crm_contacts?.fantasy_name}
                        </span>
                    </DialogTitle>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 pt-2 border-b">
                        <TabsList className="bg-transparent p-0 h-auto gap-6">
                            <TabsTrigger value="qualification" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 py-3">
                                Checklist Qualificação
                            </TabsTrigger>
                            <TabsTrigger value="relationship" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-2 py-3">
                                Relacionamento
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="qualification" className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">Dados de Qualificação</h3>
                                <p className="text-sm text-muted-foreground">Preencha todos os itens obrigatórios para avançar.</p>
                            </div>
                            {isApproved ? (
                                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                                    <ShieldCheck className="h-5 w-5" />
                                    <span className="font-medium">Aprovado</span>
                                </div>
                            ) : (
                                (userContext?.isSupervisor || userContext?.isAdmin) && (
                                    <Button onClick={handleApprove} variant="outline" className="border-green-200 hover:bg-green-50 text-green-700">
                                        <ShieldCheck className="mr-2 h-4 w-4" /> Aprovar Qualificação
                                    </Button>
                                )
                            )}
                        </div>
                        <QualificationChecklist 
                            qualificationData={qualificationData}
                            onFieldChange={handleQualificationChange}
                        />
                    </TabsContent>

                    <TabsContent value="relationship" className="flex-1 overflow-hidden">
                        <RelationshipDashboard contactId={deal.contact_id} compact />
                    </TabsContent>
                </Tabs>

                <DialogFooter className="px-6 py-4 border-t bg-white">
                    <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
                    {activeTab === 'qualification' && (
                        <Button onClick={handleSaveQualification} disabled={isSaving}>
                            {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                            Salvar Alterações
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DealDetailsModal;