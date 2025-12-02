import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Calendar, User } from 'lucide-react';

export const DealCard = ({ deal, isOverlay }) => {
  return (
    <Card className={`cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white ${isOverlay ? 'shadow-xl rotate-2 scale-105' : ''}`}>
      <CardContent className="p-3 space-y-2">
        <div className="font-medium text-sm text-slate-900">{deal.title}</div>
        <div className="text-xs text-slate-500 truncate">{deal.crm_contacts?.fantasy_name}</div>
        <div className="flex justify-between items-center mt-2">
          <Badge variant="outline" className="bg-slate-50">{formatCurrency(deal.value)}</Badge>
          {deal.expected_close_date && (
            <div className="flex items-center text-[10px] text-slate-400">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(deal.expected_close_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};