import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { supabase } from '@/lib/customSupabaseClient';
import ReactMarkdown from 'react-markdown';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou o Assistente Senhor Lavos. Como posso ajudar você com análises hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Stable scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    
    // Optimistically update UI
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Sending 'query' as the new input and 'history' as the CONTEXT (previous messages).
      // The 'messages' state variable here still holds the state from BEFORE the setMessages update above 
      // (because of closure), which effectively makes it the "history" excluding the current prompt.
      // This is usually the desired behavior for { query, history } APIs.
      
      const { data, error } = await supabase.functions.invoke('openai-chat-agent', {
        body: { 
          query: input,
          history: messages 
        }
      });

      if (error) throw error;

      const assistantMessage = { 
        role: 'assistant', 
        content: data.answer || data.response || "Desculpe, não consegui processar sua solicitação." 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling AI agent:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] max-w-5xl mx-auto p-4">
      <Card className="w-full flex flex-col shadow-lg border-slate-200">
        <CardHeader className="bg-gradient-to-r from-brand-primary to-blue-800 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-300" />
            Assistente IA Senhor Lavos
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start gap-2 max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-brand-primary text-white'
                        : 'bg-white text-slate-800 border border-slate-200 shadow-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="min-w-[2rem] min-h-[2rem] rounded-full bg-blue-100 flex items-center justify-center">
                        <Bot className="h-5 w-5 text-brand-primary" />
                      </div>
                    )}
                    
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>

                    {msg.role === 'user' && (
                      <div className="min-w-[2rem] min-h-[2rem] rounded-full bg-blue-500 flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-2 shadow-sm">
                    <Bot className="h-5 w-5 text-brand-primary" />
                    <span className="text-sm text-slate-500 flex items-center gap-1">
                      Pensando <Loader2 className="h-3 w-3 animate-spin" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 border-t bg-white rounded-b-xl">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              placeholder="Pergunte sobre vendas, clientes ou tendências..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 focus-visible:ring-brand-primary"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="bg-brand-primary hover:bg-brand-primary/90">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIChat;