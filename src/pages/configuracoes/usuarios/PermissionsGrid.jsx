import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const modules = [
  { id: 'comodato', label: 'Comodato' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'chamados', label: 'Chamados' },
  { id: 'relatorios', label: 'Relatórios' },
];

const permissions = [
  { id: 'ler', label: 'Ler' },
  { id: 'escrever', label: 'Escrever' },
  { id: 'editar', label: 'Editar' },
  { id: 'aprovar', label: 'Aprovar' },
];

const PermissionsGrid = ({ permissions: currentPermissions, onPermissionChange }) => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Módulo</TableHead>
            {permissions.map(p => (
              <TableHead key={p.id} className="text-center">{p.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.map(mod => (
            <TableRow key={mod.id}>
              <TableCell className="font-medium">{mod.label}</TableCell>
              {permissions.map(perm => (
                <TableCell key={perm.id} className="text-center">
                  <Checkbox
                    checked={currentPermissions?.[mod.id]?.[perm.id] || false}
                    onCheckedChange={(checked) => onPermissionChange(mod.id, perm.id, checked)}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PermissionsGrid;