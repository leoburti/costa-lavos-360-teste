import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';

export function MaintenanceCalendar({ data }) {
  return (
    <div className="grid gap-4">
      {data.map((item) => (
        <Card key={item.maintenance_id} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">{item.equipment_name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(item.maintenance_date).toLocaleDateString()} - {item.maintenance_type}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
              {item.status}
            </span>
            <p className="text-sm text-muted-foreground mt-1">{item.technician_name}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}