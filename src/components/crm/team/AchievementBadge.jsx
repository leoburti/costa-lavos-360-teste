import React from 'react';
import { Trophy, Star, Target, Medal, Crown, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const iconMap = {
  Trophy,
  Star,
  Target,
  Medal,
  Crown,
  Zap
};

const AchievementBadge = ({ name, description, icon, earned = false, className }) => {
  const IconComponent = iconMap[icon] || Star;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border-2",
            earned 
              ? "bg-gradient-to-br from-yellow-50 to-amber-100 border-amber-200 shadow-sm text-amber-900 scale-105" 
              : "bg-slate-50 border-slate-100 text-slate-300 grayscale opacity-70",
            className
          )}>
            <div className={cn(
              "p-2 rounded-full mb-2",
              earned ? "bg-white shadow-inner text-amber-500" : "bg-slate-100 text-slate-300"
            )}>
              <IconComponent className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-center leading-tight">{name}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-bold">{name}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {!earned && <p className="text-xs text-amber-600 mt-1 font-medium">Bloqueado</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AchievementBadge;