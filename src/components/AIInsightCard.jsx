import React from 'react';
import { Bot, Zap, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

const AIInsightCard = ({ insight, isLoading }) => {
  return (
    <Card className="bg-primary/5 border-primary/20 shadow-lg col-span-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-bold text-primary">Análise do Senhor Lavos</CardTitle>
        </div>
        <Zap className="h-5 w-5 text-amber-400" />
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-3 py-4"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-sm text-primary/80">Analisando os dados para gerar um insight valioso...</p>
            </motion.div>
          ) : (
            <motion.div
              key="insight"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                {insight || 'Não foi possível gerar um insight com os dados atuais. Tente alterar os filtros.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AIInsightCard;