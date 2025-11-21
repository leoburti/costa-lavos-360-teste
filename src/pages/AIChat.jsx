import React, { useState, useRef, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Send, Sparkles, User, Database } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/customSupabaseClient';
    import { cn } from '@/lib/utils';
    import { useNavigate } from 'react-router-dom';

    const AIChat = () => {
      const [messages, setMessages] = useState([
        {
          role: 'assistant',
          content: 'Olá! Sou o Senhor Lavos, seu assistente de dados particular. Posso consultar o banco de dados para responder perguntas complexas. O que você gostaria de saber?',
        },
      ]);
      const [input, setInput] = useState('');
      const [isLoading, setIsLoading] = useState(false);
      const [loadingMessage, setLoadingMessage] = useState('Analisando...');
      const { toast } = useToast();
      const messagesEndRef = useRef(null);
      const navigate = useNavigate();

      const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      };

      useEffect(scrollToBottom, [messages, isLoading]);

      const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        const conversationHistory = [...messages, userMessage];
        setMessages(conversationHistory);
        setInput('');
        setIsLoading(true);
        setLoadingMessage('Analisando...');

        try {
          const validHistory = conversationHistory
            .map(({ role, content }) => ({ role, content }))
            .filter(msg => typeof msg.content === 'string' && msg.content.trim() !== '');

          const { data: response, error: functionError } = await supabase.functions.invoke('openai-chat-agent', {
            body: { 
              history: validHistory
            },
          });

          if (functionError) {
            let errorMessage = 'Erro na execução da função da IA.';
            try {
              const parsedError = JSON.parse(functionError.context.responseText);
              if (parsedError.error) {
                errorMessage = parsedError.error;
              }
            } catch (e) {
              // fallback to default message
            }
            throw new Error(errorMessage);
          }
          
          const assistantMessage = { role: 'assistant', content: response.reply };
          setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
          console.error('Catch Error in handleSendMessage:', error);
          const errorMessage = error.message || 'Não foi possível obter uma resposta do assistente de IA.';
          toast({
            variant: 'destructive',
            title: 'Erro na Comunicação com a IA',
            description: errorMessage,
          });
          setMessages((prev) => [...prev, { role: 'assistant', content: `Desculpe, ocorreu um erro: ${errorMessage}` }]);
        } finally {
          setIsLoading(false);
        }
      };

      const BotIcon = () => (
        <img alt="Ícone do assistente de IA Senhor Lavos" className="h-8 w-8 object-contain" src="https://images.unsplash.com/photo-1690643129307-c13052484acd" />
      );

      return (
        <>
          <Helmet>
            <title>Senhor Lavos - Assistente IA - Costa Lavos</title>
            <meta name="description" content="Converse com o Senhor Lavos, um agente de IA para analisar seus dados de vendas." />
          </Helmet>
          <div className="flex flex-col h-full max-h-[calc(100vh-100px)] bg-card rounded-lg border">
            <header className="p-4 border-b flex items-center gap-3">
              <Sparkles className="text-primary" />
              <h1 className="text-xl font-bold text-foreground">Senhor Lavos</h1>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence>
                {messages.map((message, index) => (
                  message.role !== 'system' && (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={cn(
                        'flex items-start gap-4 max-w-2xl',
                        message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                      )}
                    >
                      <div className={cn(
                        'p-1.5 rounded-full flex items-center justify-center',
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
                        {message.role === 'user' ? <User size={20} /> : <BotIcon />}
                      </div>
                      <div className={cn(
                        'p-4 rounded-lg text-sm whitespace-pre-wrap',
                        message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                      )}>
                        <p>{message.content}</p>
                      </div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-4 max-w-2xl"
                >
                  <div className="p-1.5 rounded-full bg-muted flex items-center justify-center">
                    <BotIcon />
                  </div>
                  <div className="p-4 rounded-lg bg-muted text-foreground">
                    <div className="flex items-center gap-2">
                      <Database size={16} className="animate-pulse" />
                      <p className="text-sm">Consultando o banco de dados e analisando...</p>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ex: Qual o faturamento total dos últimos 30 dias?"
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send size={16} className="mr-2" />
                  Enviar
                </Button>
              </form>
            </footer>
          </div>
        </>
      );
    };

    export default AIChat;