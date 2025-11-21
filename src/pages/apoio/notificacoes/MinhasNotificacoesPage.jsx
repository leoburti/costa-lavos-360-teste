import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCheck, Archive, Bell, Loader2 } from 'lucide-react';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import NotificacaoDetalhesModal from './NotificacaoDetalhesModal';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const MinhasNotificacoesPage = () => {
  const { fetchNotificacoes, marcarComoLida, marcarTodasComoLidas, arquivar, loading } = useNotificacoes();
  const [notificacoes, setNotificacoes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedNotificacao, setSelectedNotificacao] = useState(null);

  const loadData = async () => {
    const data = await fetchNotificacoes({ busca: search, arquivada: false });
    setNotificacoes(data);
  };

  useEffect(() => {
    const debounce = setTimeout(loadData, 500);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleMarcarLida = async (id, e) => {
    e?.stopPropagation();
    const success = await marcarComoLida(id);
    if (success) {
      setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
    }
  };

  const handleArquivar = async (id, e) => {
    e?.stopPropagation();
    const success = await arquivar(id);
    if (success) {
      setNotificacoes(prev => prev.filter(n => n.id !== id));
      if (selectedNotificacao?.id === id) setSelectedNotificacao(null);
    }
  };

  const handleMarcarTodas = async () => {
    const success = await marcarTodasComoLidas();
    if (success) {
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    }
  };

  return (
    <>
      <Helmet><title>Minhas Notificações</title></Helmet>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Minhas Notificações</h1>
            <p className="text-muted-foreground">Acompanhe suas atualizações e alertas.</p>
          </div>
          <Button variant="outline" onClick={handleMarcarTodas} disabled={loading || notificacoes.length === 0}>
            <CheckCheck className="mr-2 h-4 w-4" /> Marcar todas como lidas
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar notificações..." 
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
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Nenhuma notificação encontrada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notificacoes.map((notificacao) => (
                  <div 
                    key={notificacao.id} 
                    className={cn(
                      "flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50",
                      !notificacao.lida ? "bg-muted/30 border-l-4 border-l-primary" : "bg-card"
                    )}
                    onClick={() => setSelectedNotificacao(notificacao)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={cn("text-sm font-medium truncate", !notificacao.lida && "font-bold")}>
                          {notificacao.titulo}
                        </h4>
                        {!notificacao.lida && <Badge variant="default" className="h-1.5 w-1.5 rounded-full p-0" />}
                        <span className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                          {formatDistanceToNow(new Date(notificacao.data_criacao), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{notificacao.mensagem}</p>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100">
                      {!notificacao.lida && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleMarcarLida(notificacao.id, e)} title="Marcar como lida">
                          <CheckCheck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={(e) => handleArquivar(notificacao.id, e)} title="Arquivar">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
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
        onMarcarLida={(id) => handleMarcarLida(id)}
        onArquivar={(id) => handleArquivar(id)}
      />
    </>
  );
};

export default MinhasNotificacoesPage;