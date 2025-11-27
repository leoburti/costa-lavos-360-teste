import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Clock } from 'lucide-react';

const DAYS = [
  { id: 'mon', label: 'Segunda-feira' },
  { id: 'tue', label: 'Terça-feira' },
  { id: 'wed', label: 'Quarta-feira' },
  { id: 'thu', label: 'Quinta-feira' },
  { id: 'fri', label: 'Sexta-feira' },
  { id: 'sat', label: 'Sábado' },
  { id: 'sun', label: 'Domingo' },
];

const SchedulesTab = ({ data, onChange }) => {
  const schedules = data.schedules || {};

  const handleToggleDay = (dayId) => {
    const current = schedules[dayId] || { active: false, start: '08:00', end: '18:00' };
    onChange({
      ...data,
      schedules: {
        ...schedules,
        [dayId]: { ...current, active: !current.active }
      }
    });
  };

  const handleChangeTime = (dayId, field, value) => {
    const current = schedules[dayId] || { active: false, start: '08:00', end: '18:00' };
    onChange({
      ...data,
      schedules: {
        ...schedules,
        [dayId]: { ...current, [field]: value }
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horários de Operação</CardTitle>
        <CardDescription>Defina os dias e horários disponíveis para entrega.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {DAYS.map((day) => {
            const config = schedules[day.id] || { active: false, start: '08:00', end: '18:00' };
            return (
              <div key={day.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <Switch 
                    checked={config.active} 
                    onCheckedChange={() => handleToggleDay(day.id)}
                  />
                  <Label className="font-medium w-32">{day.label}</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="time" 
                    className="w-28" 
                    value={config.start} 
                    onChange={(e) => handleChangeTime(day.id, 'start', e.target.value)}
                    disabled={!config.active}
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input 
                    type="time" 
                    className="w-28" 
                    value={config.end} 
                    onChange={(e) => handleChangeTime(day.id, 'end', e.target.value)}
                    disabled={!config.active}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SchedulesTab;