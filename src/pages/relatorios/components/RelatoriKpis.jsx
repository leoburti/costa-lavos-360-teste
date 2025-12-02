import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { extractValue, safeNumber } from '@/utils/dataValidator';

export function RelatoriKpis({ kpis }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, index) => {
        const safeChange = safeNumber(kpi.change);
        const safeLabel = extractValue(kpi.label);
        const safeDisplayValue = extractValue(kpi.value);

        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="overflow-hidden">
                  <p className="text-sm text-muted-foreground truncate" title={safeLabel}>
                    {safeLabel}
                  </p>
                  <p className="text-2xl font-bold mt-2 truncate" title={String(safeDisplayValue)}>
                    {safeDisplayValue}
                  </p>
                  {kpi.change !== undefined && (
                    <p className={`text-xs mt-2 font-medium ${safeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {safeChange > 0 ? '+' : ''}{safeChange.toFixed(1)}%
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-full shrink-0 ml-2 ${safeChange > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {safeChange > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}