import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const GoalCard = ({ goal }) => {
  const progress = Math.min(100, (goal.current_value / goal.target_value) * 100);
  const isRevenue = goal.type === 'revenue';
  
  const getStatusColor = () => {
    if (progress >= 100) return 'text-emerald-600';
    if (progress >= 70) return 'text-blue-600';
    if (progress >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStatusIcon = () => {
    if (progress >= 100) return CheckCircle2;
    if (progress < 40) return AlertCircle;
    return TrendingUp;
  };

  const StatusIcon = getStatusIcon();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {goal.title}
        </CardTitle>
        <Target className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-end mb-2">
          <div className="text-2xl font-bold">
            {isRevenue ? formatCurrency(goal.current_value) : goal.current_value}
          </div>
          <div className="text-xs text-muted-foreground mb-1">
            meta: {isRevenue ? formatCurrency(goal.target_value) : goal.target_value}
          </div>
        </div>
        
        <Progress value={progress} className="h-2 mb-2" />
        
        <div className="flex items-center justify-between text-xs">
          <span className={`flex items-center gap-1 font-medium ${getStatusColor()}`}>
            <StatusIcon className="h-3 w-3" />
            {progress.toFixed(1)}% Concluído
          </span>
          <span className="text-muted-foreground">
            Fim: {new Date(goal.end_date).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalCard;