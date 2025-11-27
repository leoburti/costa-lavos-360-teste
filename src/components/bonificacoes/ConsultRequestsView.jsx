import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { sortByProperty } from '@/lib/utils';

import useConsultData from '@/hooks/bonificacoes/useConsultData';
import useRequestActions from '@/hooks/bonificacoes/useRequestActions';

import ConsultKPIs from './ConsultKPIs';
import RequestTable from './RequestTable';
import RequestDetailsDialog from './RequestDetailsDialog';

const ConsultRequestsView = ({ setView }) => {
    const { userRole } = useAuth();
    const { 
        loading, kpis, allBonifications, protheusHistory, fetchData 
    } = useConsultData();

    // FIX: Stabilize fetchData to prevent infinite loops in child hooks
    const fetchDataRef = useRef(fetchData);
    useEffect(() => {
        fetchDataRef.current = fetchData;
    }, [fetchData]);

    const stableFetchData = useCallback(() => {
        if (fetchDataRef.current) {
            fetchDataRef.current();
        }
    }, []);

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

    const isApprover = userRole === 'Nivel 1' || userRole === 'Nivel 2';
    const [activeTab, setActiveTab] = useState(isApprover ? 'pendentes' : 'historico');
    const [sortConfig, setSortConfig] = useState({ key: 'request_date', direction: 'descending' });

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const pendingForApproval = useMemo(() => {
        return allBonifications.filter(req => req.status === 'Aguardando Aprovação');
    }, [allBonifications]);


    const sortedProtheusHistory = useMemo(() => {
        return [...protheusHistory].sort(sortByProperty(sortConfig.key, sortConfig.direction));
    }, [protheusHistory, sortConfig]);
    
    const tabGridCols = isApprover ? 'grid-cols-3' : 'grid-cols-2';

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
            <Button variant="ghost" onClick={() => setView('initial')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            
            <ConsultKPIs kpis={kpis} loading={loading} onRefresh={stableFetchData} />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className={`grid w-full ${tabGridCols}`}>
                    {isApprover && <TabsTrigger value="pendentes">Aprovações Pendentes</TabsTrigger>}
                    <TabsTrigger value="historico">Histórico de Solicitações</TabsTrigger>
                    <TabsTrigger value="historico_protheus">Histórico Protheus</TabsTrigger>
                </TabsList>
                
                {isApprover && (
                    <TabsContent value="pendentes" className="mt-4">
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
                    </TabsContent>
                )}
                
                <TabsContent value="historico" className="mt-4">
                    <RequestTable
                        requests={allBonifications}
                        loading={loading}
                        title="Histórico de Solicitações"
                        description="Visualize todas as solicitações e seus status."
                        onOpenDetail={handleOpenDetail}
                        onDelete={handleDelete}
                    />
                </TabsContent>

                <TabsContent value="historico_protheus" className="mt-4">
                     <RequestTable
                        requests={sortedProtheusHistory}
                        loading={loading}
                        title="Histórico Faturado (Protheus)"
                        description="Bonificações já faturadas, importadas do ERP."
                        isProtheus={true}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                    />
                </TabsContent>
            </Tabs>

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