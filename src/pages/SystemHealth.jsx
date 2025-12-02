import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const HEALTH_CHECKS = [
  { id: 1, nome: 'API Server', status: 'healthy', latencia: '45ms' },
  { id: 2, nome: 'Database', status: 'healthy', latencia: '12ms' },
  { id: 3, nome: 'Cache', status: 'healthy', latencia: '5ms' },
  { id: 4, nome: 'Storage', status: 'healthy', latencia: '78ms' },
  { id: 5, nome: 'Email Service', status: 'healthy', latencia: '234ms' },
  { id: 6, nome: 'Authentication', status: 'healthy', latencia: '89ms' },
];

export default function SystemHealth() {
  const [checks, setChecks] = useState(HEALTH_CHECKS);

  useEffect(() => {
    const interval = setInterval(() => {
      setChecks(prev =>
        prev.map(check => ({
          ...check,
          latencia: `${Math.floor(Math.random() * 300)}ms`,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const healthyCount = checks.filter(c => c.status === 'healthy').length;

  return (
    <RelatoriLayout title="Saúde do Sistema">
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status Geral</p>
                <p className="text-3xl font-bold text-green-600">Operacional</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Serviços Saudáveis</p>
                <p className="text-3xl font-bold">{healthyCount}/{checks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status dos Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checks.map((check) => (
                <div key={check.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <span className="font-medium">{check.nome}</span>
                  </div>
                  <span className="text-sm text-gray-600">{check.latencia}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RelatoriLayout>
  );
}