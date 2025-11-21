import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Paperclip, Send, Trash2, Upload, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useChamados } from '@/hooks/useChamados';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Textarea } from '@/components/ui/textarea';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ChamadoDetalhesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchChamadoById, loading, addComentario, uploadAnexo, deleteAnexo, uploading } = useChamados();
  const [chamado, setChamado] = useState(null);
  const [novoComentario, setNovoComentario] = useState('');

  const fetchData = useCallback(async () => {
    const data = await fetchChamadoById(id);
    setChamado(data);
  }, [id, fetchChamadoById]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddComentario = async () => {
    if (!novoComentario.trim()) return;
    const result = await addComentario(id, novoComentario);
    if (result) {
      // Correctly formats the returned data to match existing structure
      const formattedResult = {
        ...result,
        usuario_nome: result.usuario?.nome || 'Usuário',
      };
      setChamado(prev => ({ ...prev, comentarios: [formattedResult, ...prev.comentarios] }));
      setNovoComentario('');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = await uploadAnexo(id, file);
    if (result) {
      const formattedResult = {
        ...result,
        usuario_nome: result.usuario?.nome || 'Usuário',
      };
      setChamado(prev => ({...prev, anexos: [formattedResult, ...prev.anexos]}));
    }
  };
  
  const handleDeleteAnexo = async (anexo) => {
      if (window.confirm(`Tem certeza que deseja excluir o anexo "${anexo.nome_arquivo}"?`)) {
          const success = await deleteAnexo(anexo);
          if (success) {
              setChamado(prev => ({ ...prev, anexos: prev.anexos.filter(a => a.id !== anexo.id) }));
          }
      }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'aberto': return 'destructive';
      case 'atribuido': case 'em_andamento': return 'warning';
      case 'resolvido': return 'success';
      case 'fechado': case 'cancelado': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading && !chamado) return <div className="flex h-screen w-full items-center justify-center"><LoadingSpinner /></div>;
  if (!chamado) return <div className="text-center p-8">Chamado não encontrado.</div>;

  const { chamado: details, cliente, profissional_atribuido, historico, comentarios, anexos } = chamado;

  return (
    <>
      <Helmet><title>Chamado #{details.id.substring(0, 8)}</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate('/apoio/chamados')}><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
          <Button onClick={() => navigate(`/apoio/chamados/${id}/editar`)}><Edit className="mr-2 h-4 w-4" /> Editar Chamado</Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Chamado #{details.id.substring(0, 8)}... - {details.motivo}</CardTitle>
                <CardDescription>Cliente: {cliente?.nome_fantasia || 'Não informado'}</CardDescription>
              </div>
              <Badge variant={getStatusVariant(details.status)} className="text-sm capitalize">{details.status?.replace('_', ' ')}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><strong>Tipo:</strong> <Badge variant="outline" className="capitalize">{details.tipo_chamado}</Badge></div>
            <div><strong>Prioridade:</strong> <Badge variant="outline" className="capitalize">{details.prioridade}</Badge></div>
            <div><strong>Criação:</strong> {format(new Date(details.data_criacao), 'dd/MM/yyyy HH:mm')}</div>
            <div><strong>Data Limite:</strong> {details.data_limite ? format(new Date(details.data_limite), 'dd/MM/yyyy') : 'N/A'}</div>
            <div className="col-span-2 md:col-span-4"><strong>Atribuído a:</strong> {profissional_atribuido?.nome || 'Ninguém atribuído'}</div>
            <div className="col-span-2 md:col-span-4"><strong>Descrição:</strong><p className="text-muted-foreground mt-1">{details.observacoes || 'Nenhuma descrição fornecida.'}</p></div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader><CardTitle>Comentários</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Textarea value={novoComentario} onChange={(e) => setNovoComentario(e.target.value)} placeholder="Adicionar um comentário..." />
                        <Button onClick={handleAddComentario} disabled={!novoComentario.trim() || loading}><Send className="h-4 w-4" /></Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                        {comentarios.map((c, i) => (
                            <div key={c.id || i} className="text-sm bg-muted/50 p-3 rounded-md">
                                <p className="font-semibold">{c.usuario_nome || 'Usuário'}</p>
                                <p className="text-muted-foreground whitespace-pre-wrap">{c.comentario}</p>
                                <p className="text-xs text-right text-muted-foreground">{formatDistanceToNow(new Date(c.data_criacao), { addSuffix: true, locale: ptBR })}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Anexos</CardTitle>
                        <Button asChild variant="outline" size="sm"><label htmlFor="file-upload" className="cursor-pointer"><Upload className="mr-2 h-4 w-4" /> Enviar</label></Button>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} disabled={uploading}/>
                    </div>
                </CardHeader>
                <CardContent>
                    {uploading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /><span>Enviando...</span></div>}
                    <ul className="space-y-2">
                        {anexos.map((anexo, i) => (
                            <li key={anexo.id || i} className="flex items-center justify-between text-sm p-2 rounded hover:bg-muted/50">
                                <a href={anexo.url_arquivo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline truncate">
                                    <Paperclip className="h-4 w-4 flex-shrink-0" />
                                    <span className="truncate">{anexo.nome_arquivo}</span>
                                </a>
                                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => handleDeleteAnexo(anexo)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Histórico de Alterações</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>De</TableHead><TableHead>Para</TableHead><TableHead>Motivo</TableHead><TableHead>Usuário</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
              <TableBody>
                {historico.map((h, i) => (
                  <TableRow key={h.id || i}>
                    <TableCell><Badge variant="outline" className="capitalize">{h.status_anterior?.replace('_', ' ') || 'Criação'}</Badge></TableCell>
                    <TableCell><Badge variant={getStatusVariant(h.status_novo)} className="capitalize">{h.status_novo?.replace('_', ' ')}</Badge></TableCell>
                    <TableCell>{h.motivo_alteracao}</TableCell>
                    <TableCell>{h.usuario_nome}</TableCell>
                    <TableCell>{format(new Date(h.data_alteracao), 'dd/MM/yyyy HH:mm')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ChamadoDetalhesPage;