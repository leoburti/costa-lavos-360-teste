
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';

const EditUserDialog = ({ user, isOpen, onClose, onUserUpdated }) => {
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen && user) {
            setFullName(user.full_name || '');
            setPassword('');
        }
    }, [isOpen, user]);

    const handleUpdateUser = async () => {
        if (!fullName) {
            toast({ variant: 'destructive', title: 'Nome é obrigatório' });
            return;
        }
        setLoading(true);

        const { error } = await supabase.rpc('update_user_by_admin', {
            p_user_id: user.user_id,
            p_full_name: fullName,
            p_password: password || null,
        });

        if (error) {
            toast({ variant: 'destructive', title: 'Erro ao atualizar usuário', description: error.message });
        } else {
            toast({ title: 'Sucesso!', description: `Usuário ${fullName} atualizado.` });
            onUserUpdated(user.user_id, fullName);
            onClose();
            setPassword('');
        }
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Editar Usuário: {user?.email}</DialogTitle>
                    <DialogDescription>
                        Altere o nome completo ou defina uma nova senha. Deixe o campo de senha em branco para não alterá-la.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-1">
                        <Label htmlFor="editFullName">Nome Completo</Label>
                        <Input id="editFullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="editPassword">Nova Senha</Label>
                        <Input id="editPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Deixe em branco para não alterar" />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleUpdateUser} disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditUserDialog;
