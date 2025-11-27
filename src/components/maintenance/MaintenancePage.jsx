
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, Construction, Clock, AlertTriangle } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Helmet } from 'react-helmet-async';

const MaintenancePage = ({ endTime, message }) => {
  const { signOut } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!endTime) return;

    const interval = setInterval(() => {
      const end = new Date(endTime);
      const now = new Date();
      const diff = differenceInSeconds(end, now);

      if (diff <= 0) {
        setTimeLeft('Em instantes...');
      } else {
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setTimeLeft(`${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return (
    <>
      <Helmet>
        <title>Manutenção - Costa Lavos</title>
        <meta name="description" content="O sistema está em manutenção. Retornaremos em breve." />
      </Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-background to-slate-900"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-2xl"
        >
          <Card className="bg-card/90 border-card-foreground/10 text-foreground shadow-2xl backdrop-blur-xl">
            <CardContent className="p-12 text-center space-y-8">
              
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 ring-4 ring-primary/20"
              >
                <Construction className="h-12 w-12 text-amber-500" />
              </motion.div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold text-primary tracking-tight">Sistema em Manutenção</h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  {message || "Estamos realizando melhorias importantes na plataforma. O acesso está temporariamente restrito para garantir a integridade dos dados."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mt-8">
                {endTime && (
                  <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">
                      <Clock className="h-3 w-3" /> Retorno Previsto
                    </div>
                    <div className="text-2xl font-mono font-bold text-blue-400">
                      {format(new Date(endTime), "HH:mm 'do dia' dd/MM", { locale: ptBR })}
                    </div>
                  </div>
                )}
                
                {endTime && (
                  <div className="bg-muted/20 p-4 rounded-lg border border-border/50">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1 text-xs uppercase tracking-wider font-semibold">
                      <AlertTriangle className="h-3 w-3" /> Tempo Restante
                    </div>
                    <div className="text-2xl font-mono font-bold text-emerald-400">
                      {timeLeft}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-border/50">
                <Button 
                  onClick={signOut}
                  variant="outline" 
                  className="border-input text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sair da conta
                </Button>
              </div>

            </CardContent>
          </Card>
          
          <div className="text-center mt-8 text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Costa Lavos. Todos os direitos reservados.
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default MaintenancePage;
