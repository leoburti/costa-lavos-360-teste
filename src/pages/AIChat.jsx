
import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, User, Database, RefreshCw } from 'lucide-react';
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
      content: 'Olá! Sou o Senhor Lavos, seu assistente de dados particular. Posso ajudar com dúvidas sobre o sistema ou orientações gerais. Como posso ajudar hoje?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const callAI = async (conversationHistory, retry = 0) => {
    console.log(`[AIChat] Sending request to Edge Function (Attempt ${retry + 1})...`);
    try {
      const { data: response, error: functionError } = await supabase.functions.invoke('openai-chat-agent', {
        body: { 
          history: conversationHistory
        },
      });

      if (functionError) {
        console.error('[AIChat] Supabase Edge Function Error:', functionError);
        
        // Try to extract a meaningful message
        let detail = 'Erro desconhecido no servidor.';
        if (functionError.message) detail = functionError.message;
        else if (typeof functionError === 'string') detail = functionError;
        
        // If it's a specific HTTP error type
        if (functionError.context && functionError.context.responseText) {
            try {
                const parsed = JSON.parse(functionError.context.responseText);
                if (parsed.error) detail = parsed.error;
            } catch (e) {
                console.warn('Could not parse error response JSON');
            }
        }

        throw new Error(detail);
      }

      if (!response || !response.reply) {
        console.error('[AIChat] Invalid response structure:', response);
        throw new Error('Resposta inválida da IA (formato inesperado).');
      }

      return response.reply;

    } catch (error) {
      console.error(`[AIChat] Tentativa ${retry + 1} falhou:`, error);
      
      // Retry logic: Try up to 2 additional times (total 3) if it's likely a transient network issue
      if (retry < 2) { 
        const backoff = 1000 * (retry + 1); // 1s, 2s
        console.log(`[AIChat] Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        return callAI(conversationHistory, retry + 1);
      }
      throw error;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (input.length > 500) {
        toast({
            variant: 'destructive',
            title: 'Mensagem muito longa',
            description: 'Por favor, limite sua mensagem a 500 caracteres.',
        });
        return;
    }

    const userMessage = { role: 'user', content: input.trim() };
    
    // Optimistic update
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare history: Send only last 10 messages to conserve context window and cost
      const validHistory = [...messages, userMessage]
        .slice(-10) 
        .map(({ role, content }) => ({ role, content }));

      const reply = await callAI(validHistory);
      
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

    } catch (error) {
      console.error('[AIChat] Final Error:', error);
      
      const errorMessage = error.message || 'O serviço de IA está temporariamente indisponível.';
      
      toast({
        variant: 'destructive',
        title: 'Erro na IA',
        description: errorMessage,
      });

      // Add a visual error message to the chat
      setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `⚠️ Desculpe, encontrei um erro: "${errorMessage}". Por favor, tente novamente.` 
      }]);
      
    } finally {
      setIsLoading(false);
    }
  };

  const BotIcon = () => (
    <div className="h-8 w-8 rounded-full overflow-hidden border border-gray-200 bg-white p-0.5">
        <img alt="Senhor Lavos" className="h-full w-full object-contain" src="https://images.unsplash.com/photo-1531297461136-82fe72a29462?w=100&h=100&fit=crop" />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Senhor Lavos - Assistente IA - Costa Lavos</title>
        <meta name="description" content="Converse com o Senhor Lavos, um agente de IA para analisar seus dados de vendas." />
      </Helmet>
      <div className="flex flex-col h-full min-h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-lg border shadow-sm">
        <header className="p-4 border-b flex items-center gap-3 bg-slate-50/50 rounded-t-lg">
          <Sparkles className="text-blue-600 h-5 w-5" />
          <div>
            <h1 className="text-lg font-bold text-slate-800">Senhor Lavos</h1>
            <p className="text-xs text-slate-500">Assistente Virtual Inteligente</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              message.role !== 'system' && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'flex items-start gap-3 max-w-[85%]',
                    message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  )}
                >
                  <div className={cn(
                    'shrink-0',
                    message.role === 'user' ? '' : ''
                  )}>
                    {message.role === 'user' ? (
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 border border-blue-200">
                            <User size={16} />
                        </div>
                    ) : <BotIcon />}
                  </div>
                  
                  <div className={cn(
                    'p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm',
                    message.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-slate-700 rounded-tl-sm'
                  )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </motion.div>
              )
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 max-w-[85%]"
            >
              <BotIcon />
              <div className="p-4 rounded-2xl rounded-tl-sm bg-white border border-gray-100 shadow-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Database size={14} className="animate-pulse text-blue-500" />
                  <p className="text-xs font-medium">Processando...</p>
                  <div className="flex gap-1 ml-1">
                    <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 border-t bg-white rounded-b-lg">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem aqui..."
              className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
              disabled={isLoading}
              maxLength={500}
            />
            <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className={cn("transition-all", isLoading ? "w-12 px-0" : "w-auto px-4")}
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {!isLoading && <span className="ml-2">Enviar</span>}
            </Button>
          </form>
          <div className="text-center mt-2">
            <p className="text-[10px] text-muted-foreground">
                O Senhor Lavos pode cometer erros. Verifique informações importantes.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AIChat;
