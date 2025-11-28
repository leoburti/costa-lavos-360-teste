import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const InsightCard = ({ title = "Observações Sazonais", insights, loading }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };
  
  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="p-2 bg-amber-500/10 rounded-full">
          <Lightbulb className="h-6 w-6 text-amber-600" />
        </div>
        <CardTitle className="text-amber-800">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-amber-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-amber-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-amber-200 rounded w-5/6 animate-pulse"></div>
          </div>
        ) : (
          <motion.ul 
            className="space-y-3 list-disc pl-5 text-sm text-amber-700"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {insights.length > 0 ? (
              insights.map((insight, index) => (
                <motion.li key={index} variants={itemVariants}>
                  {insight}
                </motion.li>
              ))
            ) : (
              <motion.li variants={itemVariants}>
                Nenhum insight gerado para o período selecionado.
              </motion.li>
            )}
          </motion.ul>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightCard;