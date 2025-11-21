import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, AlertTriangle, Lightbulb, Target } from 'lucide-react';

const InsightPill = ({ insight }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'Oportunidade':
                return <Lightbulb className="h-5 w-5 text-blue-500" />;
            case 'Risco':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'Tendência Positiva':
                return <ArrowUp className="h-5 w-5 text-green-500" />;
            case 'Tendência Negativa':
                return <ArrowDown className="h-5 w-5 text-yellow-500" />;
            case 'Ação Recomendada':
                return <Target className="h-5 w-5 text-purple-500" />;
            default:
                return <Lightbulb className="h-5 w-5 text-gray-500" />;
        }
    };
    
    const getBadgeVariant = (type) => {
        switch (type) {
            case 'Oportunidade':
                return 'default';
            case 'Risco':
                return 'destructive';
            case 'Tendência Positiva':
                return 'success';
            case 'Tendência Negativa':
                return 'warning';
             case 'Ação Recomendada':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const pillVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.4, 0, 0.2, 1]
            }
        }
    };

    return (
        <motion.div variants={pillVariants}>
            <Card className="h-full transform hover:scale-105 transition-transform duration-300 ease-out shadow-lg hover:shadow-primary/20">
                <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            {getIcon(insight.type)}
                            <h3 className="font-semibold text-base">{insight.title}</h3>
                        </div>
                        <Badge variant={getBadgeVariant(insight.type)}>{insight.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex-grow">{insight.description}</p>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export { InsightPill };