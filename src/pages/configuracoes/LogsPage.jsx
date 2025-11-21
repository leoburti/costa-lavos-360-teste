import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/lib/customSupabaseClient';
import { Loader2, Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Helmet><title>Logs - Configurações</title></Helmet>
      <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Logs de Auditoria</h2>
            <p className="text-muted-foreground">Histórico de ações e mudanças no sistema.</p>
        </div>

        <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar logs..." 
                    className="pl-8" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
            {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filteredLogs.length > 0 ? (
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 text-muted-foreground font-medium">
                        <tr>
                            <th className="p-4">Data/Hora</th>
                            <th className="p-4">Ação</th>
                            <th className="p-4">Entidade</th>
                            <th className="p-4">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-muted/5">
                                <td className="p-4 whitespace-nowrap text-muted-foreground">
                                    {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                </td>
                                <td className="p-4 font-medium">{log.action}</td>
                                <td className="p-4"><Badge variant="outline">{log.entity}</Badge></td>
                                <td className="p-4 text-muted-foreground truncate max-w-xs" title={JSON.stringify(log.payload)}>
                                    {JSON.stringify(log.payload)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="text-center p-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum log encontrado.</p>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default LogsPage;