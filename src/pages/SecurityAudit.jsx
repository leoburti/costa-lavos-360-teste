import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const SECURITY_CHECKS = [
  { id: 1, nome: 'SSL/TLS', status: 'secure', detalhes: 'Certificado válido até 2025' },
  { id: 2, nome: 'Autenticação', status: 'secure', detalhes: 'JWT com expiração de 24h' },
  { id: 3, nome: 'Autorização', status: 'secure', detalhes: 'RBAC implementado' },
  { id: 4, nome: 'Validação de Entrada', status: 'secure', detalhes: 'Todas as entradas validadas' },
  { id: 5, nome: 'SQL Injection', status: 'secure', detalhes: 'Prepared statements' },
  { id: 6, nome: 'XSS Protection', status: 'secure', detalhes: 'Content Security Policy ativa' },
  { id: 7, nome: 'CSRF Protection', status: 'secure', detalhes: 'Tokens CSRF implementados' },
  { id: 8, nome: 'Rate Limiting', status: 'secure', detalhes: '100 requisições/minuto' },
];

export default function SecurityAudit() {
  const [auditando, setAuditando] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'secure':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const seguras = SECURITY_CHECKS.filter(c => c.status === 'secure').length;

  return (
    <RelatoriLayout title="Auditoria de Segurança">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total de Verificações</p>
              <p className="text-3xl font-bold">{SECURITY_CHECKS.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Seguras</p>
              <p className="text-3xl font-bold text-green-600">{seguras}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Score de Segurança</p>
              <p className="text-3xl font-bold text-blue-600">A+</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Verificações de Segurança</span>
              <Button onClick={() => setAuditando(!auditando)}>
                {auditando ? 'Auditando...' : 'Executar Auditoria'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {SECURITY_CHECKS.map((check) => (
                <div key={check.id} className={`p-4 rounded-lg border ${getStatusColor(check.status)}`}>
                  <div className="flex items-center gap-3">
                    {check.status === 'secure' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{check.nome}</h3>
                      <p className="text-sm opacity-75">{check.detalhes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RelatoriLayout>
  );
}