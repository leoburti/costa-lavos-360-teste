import React from 'react';
import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/PageHeader';
import { useApoioMock } from '@/hooks/useApoioMock';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, HelpCircle } from 'lucide-react';

const FaqPage = () => {
  const { faqs, loading } = useApoioMock();
  const [search, setSearch] = React.useState('');

  const filteredFaqs = faqs?.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <Helmet><title>Perguntas Frequentes (FAQ) | Apoio</title></Helmet>
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-4">
            <h1 className="text-3xl font-bold text-slate-900">Como podemos ajudar?</h1>
            <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <Input 
                    className="pl-10 h-12 text-lg shadow-sm" 
                    placeholder="Busque por uma dúvida..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
                {loading ? (
                    <div className="space-y-4 text-center py-10 text-slate-400">Carregando FAQs...</div>
                ) : filteredFaqs.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">Nenhuma pergunta encontrada.</div>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        {filteredFaqs.map((faq) => (
                            <AccordionItem key={faq.id} value={faq.id}>
                                <AccordionTrigger className="text-left font-medium text-slate-800 hover:text-primary">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-slate-600 leading-relaxed">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FaqPage;