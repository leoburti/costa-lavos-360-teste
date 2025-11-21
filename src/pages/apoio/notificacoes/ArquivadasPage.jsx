import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArchiveRestore, Archive, Loader2 } from 'lucide-react';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import NotificacaoDetalhesModal from './NotificacaoDetalhesModal';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ArquivadasPage = () => {
  const { fetchNotificacoes, desarquivar, loading } = useNotificacoes();
  const [notificacoes, setNotificacoes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedNotificacao, setSelectedNotificacao] = useState(null);

  const loadData = async () => {
    const data = await fetchNotificacoes({ busca: search, arquivada: true });
    setNotificacoes(data);
  };

  useEffect(() => {
    const debounce = setTimeout(loadData, 500);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleDesarquivar = async (id, e) => {
    e?.stopPropagation();
    const success = await desarquivar(id);
    if (success) {
      setNotificacoes(prev => prev.filter(n => n.id !== id));
    }
  };

  return (
    <>
      <Helmet><title>Notificações Arquivadas</title></Helmet>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Arquivadas</h1>
          <p className="text-muted-foreground">Histórico de notificações arquivadas.</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar notificações arquivadas..." 
                className="pl-10" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : notificacoes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Archive className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma notificação arquivada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notificacoes.map((notificacao) => (
                  <div 
                    key={notificacao.id} 
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card opacity-75 hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setSelectedNotificacao(notificacao)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium truncate">{notificacao.titulo}</h4>
                        <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                          {formatDistanceToNow(new Date(notificacao.data_criacao), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notificacao.mensagem}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleDesarquivar(notificacao.id, e)} title="Desarquivar">
                      <ArchiveRestore className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <NotificacaoDetalhesModal 
        notificacao={selectedNotificacao} 
        isOpen={!!selectedNotificacao} 
        onClose={() => setSelectedNotificacao(null)}
        onMarcarLida={() => {}} // No action needed for archived
        onArquivar={() => {}} // Already archived
      />
    </>
  );
};

export default ArquivadasPage;