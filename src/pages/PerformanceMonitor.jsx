import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Zap, HardDrive, Cpu } from 'lucide-react';
import { RelatoriLayout } from '@/components/RelatoriLayout';

const PERFORMANCE_DATA = [
  { time: '00:00', cpu: 25, memory: 45, latency: 120 },
  { time: '04:00', cpu: 30, memory: 50, latency: 135 },
  { time: '08:00', cpu: 45, memory: 65, latency: 180 },
  { time: '12:00', cpu: 60, memory: 75, latency: 220 },
  { time: '16:00', cpu: 55, memory: 70, latency: 200 },
  { time: '20:00', cpu: 40, memory: 60, latency: 160 },
  { time: '24:00', cpu: 28, memory: 48, latency: 125 },
];

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    cpu: 40,
    memory: 60,
    latency: 160,
    uptime: 99.9,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 80) + 10,
        memory: Math.floor(Math.random() * 80) + 20,
        latency: Math.floor(Math.random() * 300) + 100,
        uptime: 99.9,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <RelatoriLayout title="Monitor de Performance">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">CPU</p>
                  <p className="text-3xl font-bold">{metrics.cpu}%</p>
                </div>
                <Cpu className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Memória</p>
                  <p className="text-3xl font-bold">{metrics.memory}%</p>
                </div>
                <HardDrive className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Latência</p>
                  <p className="text-3xl font-bold">{metrics.latency}ms</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-3xl font-bold">{metrics.uptime}%</p>
                </div>
                <Activity className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Performance (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#3b82f6" name="CPU %" />
                <Line type="monotone" dataKey="memory" stroke="#10b981" name="Memória %" />
                <Line type="monotone" dataKey="latency" stroke="#f59e0b" name="Latência (ms)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </RelatoriLayout>
  );
}