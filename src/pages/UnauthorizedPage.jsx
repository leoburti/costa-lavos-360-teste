
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, Home, LogOut, Bug, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, userContext, forceRoleRefetch } = useAuth();
  const debugInfo = location.state || {};

  // Robust redirect handler
  const handleHomeRedirect = async () => {
    // Optional: Force a permission refresh before redirecting to catch any fixes applied in the background
    await forceRoleRefetch(); 
    navigate('/dashboard', { replace: true });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const hasAnyPermission = userContext?.modulePermissions && Object.values(userContext.modulePermissions).some(v => v === true);

  return (
    <>
      <Helmet>
        <title>Acesso Negado | Costa Lavos</title>
        <meta name="description" content="Você não tem permissão para acessar esta página." />
      </Helmet>
      <div className="flex items-center justify-center min-h-[80vh] p-4 bg-slate-50">
        <Card className="w-full max-w-lg shadow-lg border-red-100">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 bg-red-100 p-3 rounded-full w-fit animate-in zoom-in duration-300">
              <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Você não tem permissão para acessar este módulo com seu perfil atual.
            </p>
            
            {!hasAnyPermission && (
                 <div className="flex items-center gap-2 text-sm text-orange-700 font-medium bg-orange-50 p-3 rounded-md border border-orange-100 text-left">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <span>
                        Atenção: Seu perfil não possui nenhum módulo ativo. Se você acabou de entrar, aguarde a liberação ou contate o suporte.
                    </span>
                 </div>
            )}

            <p className="text-sm text-gray-500">
              Se você acredita que isso é um erro, entre em contato com seu supervisor ou administrador.
            </p>

            {/* Debug Information for Development/Admins */}
            {(debugInfo.userRole || debugInfo.requiredModule || userContext) && (
              <Accordion type="single" collapsible className="w-full text-left mt-4 border rounded-md bg-white">
                <AccordionItem value="debug" className="border-0">
                  <AccordionTrigger className="px-4 py-2 text-xs text-gray-500 hover:text-gray-800 hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Bug className="h-3 w-3" /> Informações de Diagnóstico
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 pt-0 text-xs text-gray-600 space-y-2">
                    <div className="p-2 bg-slate-100 rounded font-mono overflow-x-auto">
                      <p><strong>User:</strong> {userContext?.email || debugInfo.userEmail}</p>
                      <p><strong>Role:</strong> {userContext?.role || debugInfo.userRole}</p>
                      <p><strong>Target Module:</strong> {debugInfo.requiredModule || 'N/A'}</p>
                      <p className="mt-2 font-semibold">Active Permissions:</p>
                      <pre className="whitespace-pre-wrap text-[10px] max-h-40 overflow-y-auto border border-slate-200 p-1 rounded bg-white">
                        {JSON.stringify(userContext?.modulePermissions || debugInfo.availablePermissions || {}, null, 2)}
                      </pre>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="outline" onClick={handleLogout} className="gap-2 w-full sm:w-auto">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
            <Button variant="default" onClick={handleHomeRedirect} className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" /> Voltar ao Início
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default UnauthorizedPage;
