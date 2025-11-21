
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Check, Minus } from 'lucide-react';

const modulesList = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'crm', label: 'CRM' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'apoio', label: 'Apoio' },
  { id: 'gestao_equipe', label: 'Equipe' },
  { id: 'configuracoes', label: 'Configs' }
];

const PermissionMatrix = ({ personas }) => {
  const hasAccess = (persona, moduleId) => {
    // Fallback to data property first
    if (persona.permissoes && persona.permissoes[moduleId]) return true;
    
    // Hardcoded defaults for common personas if data is missing
    if (persona.nome === 'Admin' || persona.nome === 'Nivel 1') return true;
    if ((persona.nome === 'Supervisor' || persona.nome === 'Nivel 2') && moduleId !== 'configuracoes') return true;
    if (persona.nome === 'Vendedor' && ['crm', 'comercial', 'apoio'].includes(moduleId)) return true;
    if (persona.nome === 'Técnico' && ['apoio', 'delivery'].includes(moduleId)) return true;
    
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Permissões por Persona</CardTitle>
        <CardDescription>Visualização rápida do acesso padrão por módulo para cada persona.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Persona</TableHead>
                {modulesList.map(mod => (
                  <TableHead key={mod.id} className="text-center">{mod.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {personas.map(persona => (
                <TableRow key={persona.id}>
                  <TableCell className="font-medium">{persona.nome}</TableCell>
                  {modulesList.map(mod => (
                    <TableCell key={mod.id} className="text-center">
                      {hasAccess(persona, mod.id) ? (
                        <div className="flex justify-center">
                          <div className="bg-green-100 text-green-700 rounded-full p-1">
                            <Check className="h-3 w-3" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <Minus className="h-3 w-3 text-muted-foreground/30" />
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionMatrix;
