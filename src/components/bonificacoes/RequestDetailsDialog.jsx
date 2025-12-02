import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, CheckCircle, XCircle, Clock, PlusCircle } from 'lucide-react';
import BonificationStatusBadge from './BonificationStatusBadge';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, formatPercentage } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';


const RequestDetailsDialog = ({ isOpen, onClose, request, isProcessing, rejectionReason, setRejectionReason, onApprovalAction }) => {
    const { userContext } = useAuth();
    const { toast } = useToast();
    const [auditLog, setAuditLog] = useState([]);
    const [loadingAudit, setLoadingAudit] = useState(false);

    const isApprover = userContext?.role === 'Nivel 1' || userContext?.role === 'Nivel 2' || userContext?.eh_aprovador;

    useEffect(() => {
        const fetchAuditLog = async () => {
            if (!isOpen || !request || !request.id) return;
            setLoadingAudit(true);
            try {
                const { data, error } = await supabase
                    .from('bonification_audit_log')
                    .select('*')
                    .eq('request_id', request.id)
                    .order('timestamp', { ascending: true });
                if (error) throw error;
                setAuditLog(data);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Erro ao carregar histórico', description: error.message });
                setAuditLog([]);
            } finally {
                setLoadingAudit(false);
            }
        };

        fetchAuditLog();
    }, [isOpen, request, toast, supabase]);


    if (!request) return null;
    
    const AuditIcon = ({ action }) => {
        switch (action) {
            case 'Criado': return <PlusCircle className="h-4 w-4 text-blue-500" />;
            case 'Aprovado':
            case 'Aprovado Automaticamente': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'Rejeitado': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalhes da Bonificação</DialogTitle>
                    <DialogDescription>{`Solicitado por ${request.seller_name || 'N/A'} em ${formatDate(request.request_date)}`}</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    <div>
                        <h4 className="font-semibold mb-2">Informações</h4>
                        <div className="text-sm space-y-1">
                            <p><strong>Cliente:</strong> {request.client_name}</p>
                            <p><strong>Supervisor:</strong> {request.supervisor_name || 'N/A'}</p>
                            <p><strong>Vendedor:</strong> {request.seller_name || 'N/A'}</p>
                            <p><strong>Valor Total:</strong> {formatCurrency(request.total_amount)}</p>
                            <p><strong>Percentual sobre Venda:</strong> {request.percentual ? formatPercentage(request.percentual) : 'N/A'}</p>
                             <div className="flex items-center gap-2">
                                <strong>Motivos:</strong> 
                                <div className="flex flex-wrap gap-1">
                                {(request.motivos && request.motivos.length > 0) 
                                    ? request.motivos.map(motivo => <Badge key={motivo} variant="secondary">{motivo}</Badge>) 
                                    : <span className="text-muted-foreground">N/A</span>
                                }
                                </div>
                            </div>
                            <p><strong>Status:</strong> <BonificationStatusBadge status={request.status} /></p>
                            {request.approver_name && <p><strong>Aprovador:</strong> {request.approver_name}</p>}
                            {request.approval_date && <p><strong>Data Aprovação:</strong> {formatDate(request.approval_date, 'dd/MM/yyyy HH:mm')}</p>}
                            {request.rejection_reason && <p><strong>Motivo Rejeição:</strong> {request.rejection_reason}</p>}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Produtos</h4>
                        <ScrollArea className="h-40 border rounded-md p-2">
                             <ul className="text-sm space-y-1">
                                {(request.products_json || []).map((p, i) => (
                                    <li key={i}>{p.quantity}x {p.name} - {formatCurrency(p.price)}</li>
                                ))}
                            </ul>
                        </ScrollArea>
                    </div>
                </div>
                {auditLog.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">Histórico de Aprovação</h4>
                        <ScrollArea className="h-32 border rounded-md p-2">
                            {loadingAudit ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : (
                                <div className="space-y-4">
                                    {auditLog.map(log => (
                                        <div key={log.id} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1"><AuditIcon action={log.action} /></div>
                                            <div>
                                                <p className="text-sm font-medium">{log.action} por {log.user_name || 'Sistema'}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(log.timestamp, 'dd/MM/yyyy HH:mm')}</p>
                                                {log.details?.reason && <p className="text-xs mt-1">Motivo: {log.details.reason}</p>}
                                                {log.details?.note && <p className="text-xs mt-1">Nota: {log.details.note}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                )}
                {isApprover && ['Aguardando Aprovação'].includes(request.status) && (
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">Ações do Aprovador</h4>
                        <Textarea placeholder="Motivo da rejeição (obrigatório se rejeitar)" value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} />
                        <div className="flex justify-end gap-2">
                            <Button variant="destructive" onClick={() => onApprovalAction(request, false, rejectionReason)} disabled={isProcessing || !rejectionReason}>
                                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}Rejeitar
                            </Button>
                            <Button variant="success" onClick={() => onApprovalAction(request, true)} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}Aprovar
                            </Button>
                        </div>
                    </div>
                )}
                <DialogFooter><Button variant="outline" onClick={onClose}>Fechar</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RequestDetailsDialog;