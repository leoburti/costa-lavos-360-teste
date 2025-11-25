
import React from 'react';
import { Phone, Mail, Users, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ActivityIcon = ({ type }) => {
  switch (type) {
    case 'call': return <Phone className="h-4 w-4" />;
    case 'email': return <Mail className="h-4 w-4" />;
    case 'meeting': return <Users className="h-4 w-4" />;
    default: return <Circle className="h-4 w-4" />;
  }
};

const ActivityLog = ({ activities = [], onComplete }) => {
  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div 
          key={activity.id} 
          className={cn(
            "flex items-start gap-3 p-3 rounded-lg border transition-all",
            activity.status === 'completed' ? "bg-slate-50 border-slate-100 opacity-70" : "bg-white border-slate-200 hover:border-primary/30"
          )}
        >
          <div className={cn(
            "mt-1 p-2 rounded-full",
            activity.status === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-blue-50 text-blue-600"
          )}>
            {activity.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> : <ActivityIcon type={activity.type} />}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className={cn("text-sm font-medium", activity.status === 'completed' && "line-through text-slate-500")}>
                {activity.description}
              </p>
              <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { locale: ptBR, addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 bg-slate-100 rounded-full text-slate-600 font-medium">
                +{activity.points_value || 10} pts
              </span>
              {activity.due_date && (
                <span className="text-xs flex items-center gap-1 text-slate-500">
                  <Clock className="h-3 w-3" />
                  {new Date(activity.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {activity.status !== 'completed' && onComplete && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 hover:bg-emerald-50 hover:text-emerald-600"
              onClick={() => onComplete(activity.id)}
            >
              <CheckCircle2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      ))}
      
      {activities.length === 0 && (
        <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
          Nenhuma atividade registrada recentemente.
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
