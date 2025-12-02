import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from '@/components/error-boundary/ErrorBoundary';

const ChartContainer = ({ title, description, children, loading, height = 350 }) => {
  return (
    <Card className="h-full shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-base font-bold text-slate-800">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div style={{ height: height, width: '100%' }}>
          {loading ? (
            <Skeleton className="w-full h-full rounded-lg" />
          ) : (
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartContainer;