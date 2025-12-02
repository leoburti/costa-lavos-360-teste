import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, FileText, Video, BookOpen, Download, PlayCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ResourceList = ({ title, description, items, type = 'manual', loading }) => {
  const [search, setSearch] = useState('');

  const filteredItems = items?.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getIcon = () => {
    switch(type) {
        case 'video': return Video;
        case 'tutorial': return BookOpen;
        default: return FileText;
    }
  };

  const Icon = getIcon();

  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader className="pb-4 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    {title}
                </CardTitle>
                {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                <Input 
                    placeholder={`Buscar ${type}...`} 
                    className="pl-8" 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
            <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
        ) : (
            <div className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">Nenhum item encontrado.</div>
                ) : (
                    filteredItems.map((item, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-900">{item.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                        {item.size && <span>{item.size}</span>}
                                        {item.duration && <span>{item.duration}</span>}
                                        {item.level && <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{item.level}</span>}
                                        {item.views && <span>{item.views} visualizações</span>}
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm">
                                {type === 'video' ? <PlayCircle className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                                {type === 'video' ? 'Assistir' : 'Download'}
                            </Button>
                        </div>
                    ))
                )}
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceList;