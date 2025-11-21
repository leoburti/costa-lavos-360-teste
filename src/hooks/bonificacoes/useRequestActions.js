import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const useRequestActions = (onActionSuccess) => {
    const { toast } = useToast();
    const { user, userRole, supabase, isSupabaseConfigured } = useAuth();
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [openDetail, setOpenDetail] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const isApprover = userRole === 'Nivel 1' || userRole === 'Nivel 2';

    const handleOpenDetail = useCallback((request) => {
        setSelectedRequest(request);
        setRejectionReason('');
        setOpenDetail(true);
    }, []);

    const handleCloseDetail = () => {
        setOpenDetail(false);
        setSelectedRequest(null);
    };

    const handleApprovalAction = async (request, approve, reason = '') => {
        if (!isSupabaseConfigured) {
            toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Banco de dados não configurado.' });
            return;
        }
        if (!isApprover) {
            toast({ variant: 'destructive', title: 'Ação não permitida' });
            return;
        }
        if (!approve && !reason) {
            toast({ variant: 'destructive', title: 'Motivo da rejeição é obrigatório' });
            return;
        }

        setIsProcessing(true);
        const newStatus = approve ? 'Aprovado' : 'Rejeitado';

        try {
            const { error: updateError } = await supabase
                .from('bonification_requests')
                .update({
                    status: newStatus,
                    approver_id: user.id,
                    approver_name: user.user_metadata.full_name,
                    approval_date: new Date().toISOString(),
                    rejection_reason: approve ? null : reason,
                })
                .eq('id', request.id);

            if (updateError) throw updateError;

            toast({ title: `Solicitação ${newStatus.toLowerCase()} com sucesso!` });
            if (onActionSuccess) onActionSuccess();
            if (openDetail) handleCloseDetail();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Erro ao processar ação', description: error.message });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (requestId) => {
        if (!isSupabaseConfigured) {
            toast({ variant: 'destructive', title: 'Ação não permitida', description: 'Banco de dados não configurado.' });
            return;
        }
        setIsProcessing(true);
        try {
            await supabase.from('bonification_audit_log').delete().eq('request_id', requestId);
            const { error } = await supabase.from('bonification_requests').delete().eq('id', requestId);
            if (error) throw error;
            toast({ title: "Sucesso!", description: "Solicitação de bonificação excluída." });
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
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
    };
};

export default useRequestActions;