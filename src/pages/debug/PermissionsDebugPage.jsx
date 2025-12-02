import React from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getUserRole, getUserLevel, getUserPermissions, hasPermission, PERMISSIONS } from '@/utils/permissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X } from 'lucide-react';

const PermissionsDebugPage = () => {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-8">Carregando dados do usuário...</div>;
    if (!user) return <div className="p-8">Usuário não autenticado.</div>;

    const derivedRole = getUserRole(user);
    const derivedLevel = getUserLevel(user);
    const allPermissions = getUserPermissions(user);

    const checkModule = (mod) => hasPermission(user, mod);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold">Diagnóstico de Permissões</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Dados do Objeto User (Contexto)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-[400px]">
                            {JSON.stringify(user, null, 2)}
                        </pre>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Interpretação do Sistema</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium">Role Detectado:</span>
                                <Badge>{derivedRole || 'Nenhum'}</Badge>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium">Nível Detectado:</span>
                                <Badge variant="outline">{derivedLevel}</Badge>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium">Is Admin / Nível 5?</span>
                                {derivedLevel >= 5 || ['admin', 'nivel 1', 'nivel 5'].includes(derivedRole?.toLowerCase()) ? (
                                    <Badge className="bg-green-500">Sim (Bypass Ativo)</Badge>
                                ) : (
                                    <Badge variant="destructive">Não</Badge>
                                )}
                            </div>
                            <div>
                                <span className="font-medium block mb-2">Lista de Permissões Efetivas:</span>
                                <div className="flex flex-wrap gap-1">
                                    {allPermissions.map(p => (
                                        <Badge key={p} variant="secondary">{p}</Badge>
                                    ))}
                                    {allPermissions.length === 0 && <span className="text-muted-foreground text-sm">Nenhuma permissão encontrada.</span>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Teste de Acesso a Módulos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Módulo</TableHead>
                                        <TableHead>ID da Permissão</TableHead>
                                        <TableHead className="text-right">Acesso</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.entries(PERMISSIONS).map(([key, value]) => {
                                        const hasAccess = checkModule(value);
                                        return (
                                            <TableRow key={key}>
                                                <TableCell className="font-medium">{key}</TableCell>
                                                <TableCell className="font-mono text-xs">{value}</TableCell>
                                                <TableCell className="text-right">
                                                    {hasAccess ? (
                                                        <div className="flex justify-end items-center text-green-600"><Check size={16} /> Permitido</div>
                                                    ) : (
                                                        <div className="flex justify-end items-center text-red-600"><X size={16} /> Negado</div>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PermissionsDebugPage;