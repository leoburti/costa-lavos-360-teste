import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Download, Upload, Clock } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const BACKUPS = [
  {
    id: 1,
    nome: 'Backup Completo',
    data: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    tamanho: '2.5 GB',
    status: 'Completo',
  },
  {
    id: 2,
    nome: 'Backup Incremental',
    data: new Date(Date.now() - 12 * 60 * 60 * 1000),
    tamanho: '450 MB',
    status: 'Completo',
  },
  {
    id: 3,
    nome: 'Backup Incremental',
    data: new Date(Date.now() - 6 * 60 * 60 * 1000),
    tamanho: '320 MB',
    status: 'Completo',
  },
];

export default function BackupRecovery() {
  const [fazendoBackup, setFazendoBackup] = useState(false);

  return (
    <RelatoriLayout title="Backup & Recuperação">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Total de Backups</p>
              <p className="text-3xl font-bold">{BACKUPS.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Espaço Total</p>
              <p className="text-3xl font-bold">3.27 GB</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-600">Último Backup</p>
              <p className="text-3xl font-bold">6h atrás</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Ações de Backup</span>
              <Button onClick={() => setFazendoBackup(!fazendoBackup)}>
                {fazendoBackup ? 'Fazendo Backup...' : 'Novo Backup'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {BACKUPS.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{backup.nome}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {backup.data.toLocaleString('pt-BR')}
                      </span>
                      <span>{backup.tamanho}</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {backup.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Restaurar
                    </Button>
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