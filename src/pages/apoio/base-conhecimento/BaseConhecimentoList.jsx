import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { useApoioMock } from '@/hooks/useApoioMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, FileText, BookOpen, Eye } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const BaseConhecimentoList = () => {
  const { kbArticles, loading } = useApoioMock();
  const [search, setSearch] = useState('');

  const filteredArticles = useMemo(() => {
    return kbArticles.filter(a => 
      a.title.toLowerCase().includes(search.toLowerCase()) || 
      a.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [kbArticles, search]);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Base de Conhecimento | Apoio</title></Helmet>
      
      <PageHeader 
        title="Base de Conhecimento" 
        description="Artigos técnicos, procedimentos e documentação oficial."
        breadcrumbs={[{ label: 'Apoio', path: '/apoio' }, { label: 'Base de Conhecimento' }]}
        actions={
            <Button><Plus className="mr-2 h-4 w-4" /> Novo Artigo</Button>
        }
      />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Pesquisar artigos..." 
                className="pl-10 h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
            [...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)
        ) : filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow border-slate-200 cursor-pointer group">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="mb-2">{article.category}</Badge>
                        {article.status === 'publicado' && <span className="h-2 w-2 bg-green-500 rounded-full" title="Publicado"></span>}
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 line-clamp-3 mb-4">
                        {article.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {article.views}
                        </div>
                        <span>{formatDate(article.createdAt)}</span>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
};

export default BaseConhecimentoList;