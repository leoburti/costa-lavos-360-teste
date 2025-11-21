import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BoxBalanceReport = React.forwardRef(({ data }, ref) => {
    return (
        <div ref={ref} className="p-8 bg-white text-black font-sans">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold">Relatório de Saldo de Caixas</h1>
                <p className="text-sm text-gray-600">Gerado em: {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            </header>
            
            <main>
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border text-left font-semibold">Cliente (N Fantasia)</th>
                            <th className="p-2 border text-right font-semibold">Saldo de Caixas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((client, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2 border">{client['N Fantasia']}</td>
                                <td className="p-2 border text-right">{client.saldo_caixas}</td>
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

export default BoxBalanceReport;