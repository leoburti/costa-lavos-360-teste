import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import { Button } from '@/components/ui/button';
import { Construction } from 'lucide-react';
import MaintenanceControlModal from '@/components/maintenance/MaintenanceControlModal';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const SegurancaPage = () => {
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isMaintenanceOpen, setMaintenanceOpen] = useState(false);
  const { hasPermission } = useAuth();
  
  // A verificação de administrador agora usa a função centralizada 'hasPermission'.
  // 'system_all' e 'write' é um placeholder para uma permissão de superusuário que já retorna true para admins.
  const isAdmin = hasPermission('system_all', 'write');

  return (
    <>
      <Helmet>
        <title>Segurança - Costa Lavos</title>
        <meta name="description" content="Gerencie suas configurações de segurança, altere sua senha e visualize o histórico de logins." />
      </Helmet>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Segurança</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Para sua segurança, recomendamos alterar sua senha periodicamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setPasswordDialogOpen(true)}>
              Alterar Minha Senha
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <Construction className="mr-2 h-5 w-5" />
                Modo de Manutenção
              </CardTitle>
              <CardDescription>
                Ative o modo de manutenção para restringir o acesso ao sistema durante atualizações críticas. Apenas administradores poderão acessar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={() => setMaintenanceOpen(true)}>
                Gerenciar Modo de Manutenção
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Login</CardTitle>
            <CardDescription>Visualize os últimos acessos à sua conta.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">🚧 Funcionalidade em desenvolvimento.</p>
          </CardContent>
        </Card>

      </div>
      <ChangePasswordDialog isOpen={isPasswordDialogOpen} onOpenChange={setPasswordDialogOpen} />
      {isAdmin && <MaintenanceControlModal isOpen={isMaintenanceOpen} onOpenChange={setMaintenanceOpen} />}
    </>
  );
};

export default SegurancaPage;