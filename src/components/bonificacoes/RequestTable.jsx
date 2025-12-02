import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, ShieldAlert } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import BonificationStatusBadge from './BonificationStatusBadge';

const RequestTable = ({ requests, loading, title, description, onOpenDetail, onDelete, onQuickApprove, onQuickReject, isApproverTab = false }) => {
    const { userContext } = useAuth();
    const userRole = userContext?.role;
    const canDelete = userRole === 'Nivel 1' || userRole === 'Nivel 2';

    const headers = [
        { key: "client_name", label: "Cliente" },
        { key: "total_amount", label: "Valor" },
        { key: "request_date", label: "Data" },
        { key: "status", label: "Status" },
        { key: "motivos", label: "Motivos" },
        { key: "seller_name", label: "Vendedor" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {headers.map(h => (
                                    <TableHead key={h.key}>{h.label}</TableHead>
                                ))}
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={headers.length + 1} className="text-center h-24"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                            ) : requests.length === 0 ? (
                                <TableRow><TableCell colSpan={headers.length + 1} className="text-center h-24">Nenhum registro encontrado.</TableCell></TableRow>
                            ) : (
                                requests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-medium">{req.client_name}</TableCell>
                                        <TableCell>{formatCurrency(req.total_amount)}</TableCell>
                                        <TableCell>{formatDate(req.request_date, 'dd/MM/yyyy HH:mm')}</TableCell>
                                        <TableCell><BonificationStatusBadge status={req.status} /></TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {(req.motivos && req.motivos.length > 0) 
                                                    ? req.motivos.map(motivo => <Badge key={motivo} variant="secondary">{motivo}</Badge>) 
                                                    : <span className="text-xs text-muted-foreground">N/A</span>
                                                }
                                            </div>
                                        </TableCell>
                                        <TableCell>{req.seller_name}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => onOpenDetail && onOpenDetail(req)}>Ver Detalhes</Button>
                                                {isApproverTab && onQuickApprove && onQuickReject && (
                                                    <>
                                                        <Button variant="destructive" size="sm" onClick={() => onQuickReject(req)}>Rejeitar</Button>
                                                        <Button variant="success" size="sm" onClick={() => onQuickApprove(req)}>Aprovar</Button>
                                                    </>
                                                )}
                                                {canDelete && onDelete && (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive" />Tem certeza?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita. Isso excluirá permanentemente a solicitação.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => onDelete(req.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Sim, excluir</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default RequestTable;