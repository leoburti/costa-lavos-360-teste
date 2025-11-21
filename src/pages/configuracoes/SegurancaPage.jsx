import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import ConfiguracaoGrupo from '@/components/ConfiguracaoGrupo';
import ConfiguracaoInput from '@/components/ConfiguracaoInput';
import ConfiguracaoSwitch from '@/components/ConfiguracaoSwitch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, ShieldCheck, Key, Smartphone, History, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SegurancaPage = () => {
  const { toast } = useToast();
  const [loadingPass, setLoadingPass] = useState(false);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [twoFactor, setTwoFactor] = useState(false);

  const handlePassChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ variant: "destructive", title: "Erro", description: "As senhas não coincidem." });
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast({ variant: "destructive", title: "Erro", description: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setLoadingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.newPassword });
      if (error) throw error;
      toast({ title: "Sucesso", description: "Senha atualizada com sucesso." });
      setPasswords({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <>
      <Helmet><title>Segurança - Configurações</title></Helmet>
      <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Segurança da Conta</h2>
            <p className="text-muted-foreground">Gerencie sua senha e métodos de autenticação.</p>
        </div>

        <ConfiguracaoGrupo titulo="Alterar Senha" descricao="Atualize sua senha de acesso.">
          <div className="grid gap-4 max-w-md">
            <ConfiguracaoInput
              label="Nova Senha"
              type="password"
              name="newPassword"
              valor={passwords.newPassword}
              onChange={handlePassChange}
              placeholder="••••••••"
            />
            <ConfiguracaoInput
              label="Confirmar Nova Senha"
              type="password"
              name="confirmPassword"
              valor={passwords.confirmPassword}
              onChange={handlePassChange}
              placeholder="••••••••"
            />
            <Button onClick={handleUpdatePassword} disabled={loadingPass} className="w-full mt-2">
              {loadingPass ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Key className="mr-2 h-4 w-4" />}
              Atualizar Senha
            </Button>
          </div>
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo titulo="Autenticação de Dois Fatores (2FA)" descricao="Adicione uma camada extra de segurança à sua conta.">
           <div className="space-y-4">
             <ConfiguracaoSwitch
                label="Ativar 2FA"
                descricao="Exigir um código de verificação ao fazer login."
                checked={twoFactor}
                onCheckedChange={(checked) => {
                    setTwoFactor(checked);
                    toast({ title: checked ? "2FA Ativado" : "2FA Desativado", description: "Configuração atualizada (Simulação)." });
                }}
             />
             {twoFactor && (
                 <div className="p-4 border rounded-md bg-muted/50 flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <Smartphone className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="font-medium">Aplicativo Autenticador</p>
                        <p className="text-sm text-muted-foreground">Use Google Authenticator ou Authy.</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">Configurar</Button>
                 </div>
             )}
           </div>
        </ConfiguracaoGrupo>

        <ConfiguracaoGrupo titulo="Sessões Ativas" descricao="Dispositivos conectados à sua conta.">
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium flex items-center gap-2">Chrome no Windows <Badge variant="outline" className="text-xs">Atual</Badge></p>
                            <p className="text-xs text-muted-foreground">São Paulo, BR • Ativo agora</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg opacity-75">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                            <History className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">Safari no iPhone</p>
                            <p className="text-xs text-muted-foreground">Rio de Janeiro, BR • 2 dias atrás</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="h-4 w-4 mr-2" /> Sair
                    </Button>
                </div>
            </div>
        </ConfiguracaoGrupo>
      </div>
    </>
  );
};

export default SegurancaPage;