import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';


const useRequestActions = (onActionSuccess) => {
    const { toast } = useToast();
    const { user, userContext } = useAuth();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const isApprover = userContext?.role === 'Nivel 1' || userContext?.role === 'Nivel 2' || userContext?.eh_aprovador;


    const handleOpenDetail = useCallback((request) => {
        console.log("useRequestActions: Abrindo detalhes para a solicitação:", request.id);
        setSelectedRequest(request);
        setRejectionReason('');
        setOpenDetail(true);
    }, []);

    const handleCloseDetail = () => {
        console.log("useRequestActions: Fechando detalhes.");
        setOpenDetail(false);
        setSelectedRequest(null);
    };

    const handleApprovalAction = async (request, approve, reason = '') => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Usuário não autenticado.' });
            return;
        }
        if (!isApprover) {
            toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Você não tem permissão para aprovar ou rejeitar.' });
            return;
        }
        if (!approve && !reason) {
            toast({ variant: 'destructive', title: 'Motivo da rejeição é obrigatório' });
            return;
        }

        setIsProcessing(true);
        const newStatus = approve ? 'Aprovado' : 'Rejeitado';
        console.log(`useRequestActions: Processando ação '${newStatus}' para a solicitação ${request.id}`);

        try {
            const { data: updateData, error: updateError } = await supabase
                .from('bonification_requests')
                .update({
                    status: newStatus,
                    approver_id: user.id,
                    approver_name: userContext.fullName,
                    approval_date: new Date().toISOString(),
                    rejection_reason: approve ? null : reason,
                })
                .eq('id', request.id)
                .select()
                .single();

            if (updateError) throw updateError;
            
            await supabase.from('bonification_audit_log').insert({
                request_id: request.id,
                user_id: user.id,
                user_name: userContext.fullName,
                action: newStatus,
                details: { reason: approve ? null : reason },
            });


            toast({ title: `Solicitação ${newStatus.toLowerCase()} com sucesso!` });
            if (onActionSuccess) {
                console.log("useRequestActions: Chamando onActionSuccess callback.");
                onActionSuccess();
            }
            if (openDetail) handleCloseDetail();
        } catch (error) {
            console.error("useRequestActions: Erro ao processar ação:", error);
            toast({ variant: 'destructive', title: 'Erro ao processar ação', description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (requestId) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Usuário não autenticado.' });
            return;
        }
        setIsProcessing(true);
        console.log(`useRequestActions: Deletando solicitação ${requestId}`);
        try {
            await supabase.from('bonification_audit_log').delete().eq('request_id', requestId);
            const { error } = await supabase.from('bonification_requests').delete().eq('id', requestId);
            if (error) throw error;
            toast({ title: "Sucesso!", description: "Solicitação de bonificação excluída." });
            if (onActionSuccess) {
                console.log("useRequestActions: Chamando onActionSuccess callback após deleção.");
                onActionSuccess();
            }
        } catch (error) {
             console.error("useRequestActions: Erro ao deletar:", error);
            toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        selectedRequest,
        openDetail,
        isProcessing,
        rejectionReason,
        setRejectionReason,
        handleOpenDetail,
        handleCloseDetail,
        handleApprovalAction,
        handleDelete,
        isApprover,
    };
};

export default useRequestActions;