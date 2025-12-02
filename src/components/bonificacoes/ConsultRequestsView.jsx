import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import useConsultData from '@/hooks/bonificacoes/useConsultData';
import useRequestActions from '@/hooks/bonificacoes/useRequestActions';
import ConsultKPIs from './ConsultKPIs';
import RequestTable from './RequestTable';
import RequestDetailsDialog from './RequestDetailsDialog';
import LoadingSpinner from '@/components/LoadingSpinner';

const ConsultRequestsView = () => {
    console.log("ConsultRequestsView renderizando");
    const { userContext } = useAuth();
    const { 
        loading, kpis, allBonifications, fetchData 
    } = useConsultData();
    
    // Memoize a função fetchData para evitar recriações desnecessárias
    const stableFetchData = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const {
        selectedRequest,
        openDetail,
        isProcessing,
        rejectionReason,
        setRejectionReason,
        handleOpenDetail,
        handleApprovalAction,
        handleDelete,
        handleCloseDetail,
    } = useRequestActions(stableFetchData);

    const isApprover = userContext?.role === 'Nivel 1' || userContext?.role === 'Nivel 2' || userContext?.eh_aprovador;
    
    const pendingForApproval = useMemo(() => {
        return allBonifications.filter(req => req.status === 'Aguardando Aprovação');
    }, [allBonifications]);

    if (loading && allBonifications.length === 0) {
        return <div className="flex h-64 w-full items-center justify-center"><LoadingSpinner message="Carregando dados de consulta..." /></div>
    }
    
    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            
            <ConsultKPIs kpis={kpis} loading={loading} onRefresh={stableFetchData} />
            
            {isApprover && (
                <RequestTable
                    requests={pendingForApproval}
                    loading={loading}
                    title="Aprovações Pendentes"
                    description="Solicitações aguardando sua análise e aprovação."
                    onOpenDetail={handleOpenDetail}
                    onQuickApprove={(req) => handleApprovalAction(req, true)}
                    onQuickReject={(req) => handleApprovalAction(req, false, 'Rejeitado pelo painel rápido')}
                    isApproverTab={true}
                />
            )}
            
            <RequestTable
                requests={allBonifications}
                loading={loading}
                title="Histórico de Solicitações"
                description="Visualize todas as solicitações e seus status."
                onOpenDetail={handleOpenDetail}
                onDelete={handleDelete}
            />

            {selectedRequest && (
                 <RequestDetailsDialog
                    isOpen={openDetail}
                    onClose={handleCloseDetail}
                    request={selectedRequest}
                    isProcessing={isProcessing}
                    rejectionReason={rejectionReason}
                    setRejectionReason={setRejectionReason}
                    onApprovalAction={handleApprovalAction}
                 />
            )}
        </motion.div>
    );
};

export default ConsultRequestsView;