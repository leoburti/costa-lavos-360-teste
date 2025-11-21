import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SyntheticReport = React.forwardRef(({ data, dateRange }, ref) => {
    const period = dateRange?.from && dateRange?.to 
        ? `${format(new Date(dateRange.from), 'dd/MM/yy', { locale: ptBR })} a ${format(new Date(dateRange.to), 'dd/MM/yy', { locale: ptBR })}`
        : 'N/A';

    const sortedData = data ? Object.entries(data).sort(([a], [b]) => new Date(a) - new Date(b)) : [];

    return (
        <div ref={ref} className="p-8 bg-white text-black font-sans">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold">Relatório Sintético de Entregas</h1>
                <p className="text-lg text-gray-700">Período: {period}</p>
            </header>

            <main>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border text-left font-semibold">Data</th>
                            <th className="p-2 border text-right font-semibold">Total de Entregas</th>
                            <th className="p-2 border text-right font-semibold">Caixas Entregues</th>
                            <th className="p-2 border text-right font-semibold">Caixas Recolhidas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map(([date, dailyData]) => (
                            <tr key={date} className="border-b">
                                <td className="p-2 border">{format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })}</td>
                                <td className="p-2 border text-right">{dailyData.totalDeliveries}</td>
                                <td className="p-2 border text-right">{dailyData.boxesDelivered}</td>
                                <td className="p-2 border text-right">{dailyData.boxesCollected}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
             <footer className="mt-12 pt-4 border-t text-center text-xs text-gray-500">
                <p>Costa Lavos - Sistema de Gestão Comercial</p>
            </footer>
        </div>
    );
});

export default SyntheticReport;