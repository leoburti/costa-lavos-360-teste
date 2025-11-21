import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

const modules = ['Comodato', 'Agenda', 'Chamados', 'Relatórios'];
const permissions = ['Ler', 'Escrever', 'Editar', 'Aprovar'];

const dummyUsers = [
  { id: 1, nome: 'Admin', acessos: { Comodato: { Ler: true, Escrever: true, Editar: true, Aprovar: true }, Agenda: { Ler: true, Escrever: true, Editar: true, Aprovar: true }, Chamados: { Ler: true, Escrever: true, Editar: true, Aprovar: true }, Relatórios: { Ler: true, Escrever: true, Editar: true, Aprovar: true } } },
  { id: 2, nome: 'Gestor', acessos: { Comodato: { Ler: true }, Agenda: { Ler: true }, Chamados: { Ler: true, Escrever: true }, Relatórios: { Ler: true } } },
  { id: 3, nome: 'Manutencista', acessos: { Agenda: { Ler: true }, Chamados: { Ler: true, Escrever: true } } },
];

const AcessosMatriz = () => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-background z-10">Usuário</TableHead>
            {modules.map(mod => (
              <TableHead key={mod} colSpan={permissions.length} className="text-center border-l">{mod}</TableHead>
            ))}
          </TableRow>
          <TableRow>
            <TableHead className="sticky left-0 bg-background z-10"></TableHead>
            {modules.map(mod => (
              permissions.map(perm => (
                <TableHead key={`${mod}-${perm}`} className="text-center text-xs border-l">{perm.charAt(0)}</TableHead>
              ))
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dummyUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium sticky left-0 bg-background z-10">{user.nome}</TableCell>
              {modules.map(mod => (
                permissions.map(perm => (
                  <TableCell key={`${mod}-${perm}`} className="text-center border-l">
                    <Checkbox checked={user.acessos?.[mod]?.[perm] || false} disabled />
                  </TableCell>
                ))
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AcessosMatriz;