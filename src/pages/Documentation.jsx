import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const DOCUMENTACAO = [
  {
    id: 1,
    titulo: 'Guia de Início Rápido',
    descricao: 'Comece a usar o sistema em 5 minutos',
    link: '#',
  },
  {
    id: 2,
    titulo: 'Documentação de API',
    descricao: 'Referência completa de todas as APIs',
    link: '#',
  },
  {
    id: 3,
    titulo: 'Guia de Usuário',
    descricao: 'Instruções detalhadas para cada funcionalidade',
    link: '#',
  },
  {
    id: 4,
    titulo: 'Guia de Administrador',
    descricao: 'Configuração e gerenciamento do sistema',
    link: '#',
  },
  {
    id: 5,
    titulo: 'FAQ',
    descricao: 'Perguntas frequentes e respostas',
    link: '#',
  },
  {
    id: 6,
    titulo: 'Changelog',
    descricao: 'Histórico de atualizações e melhorias',
    link: '#',
  },
];

export default function Documentation() {
  return (
    <RelatoriLayout title="Documentação">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCUMENTACAO.map((doc) => (
            <Card key={doc.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{doc.titulo}</span>
                  <ExternalLink className="h-5 w-5 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{doc.descricao}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </RelatoriLayout>
  );
}