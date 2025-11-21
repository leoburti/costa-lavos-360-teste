
import React from 'react';
import { Check, X, MapPin, Calendar, User, Package, Info, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ProtocolDetailReport = React.forwardRef(({ protocol }, ref) => {
    if (!protocol) return null;

    const formattedDate = protocol.data_entrega ? format(new Date(protocol.data_entrega), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : 'N/A';
    const checkInTime = protocol.check_in_time ? format(new Date(protocol.check_in_time), "HH:mm:ss", { locale: ptBR }) : null;
    const checkOutTime = protocol.check_out_time ? format(new Date(protocol.check_out_time), "HH:mm:ss", { locale: ptBR }) : null;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${protocol.id}`;

    return (
        <div ref={ref} className="p-10 bg-white text-black font-sans max-w-[210mm] mx-auto">
            {/* Header */}
            <header className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-6">
                <div className="flex items-center gap-4">
                    {/* Logo Placeholder - In a real app, use <img src="/logo.png" /> */}
                    <div className="h-16 w-16 bg-red-800 flex items-center justify-center text-white font-bold text-xl rounded-md">CL</div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">Comprovante de Entrega</h1>
                        <p className="text-sm text-gray-600">Costa Lavos Distribuidora</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">ID da Entrega</p>
                    <p className="font-mono text-xs text-gray-700 mb-2">{protocol.id}</p>
                    <img src={qrCodeUrl} alt="QR Code ID" className="w-20 h-20 ml-auto border border-gray-200 p-1" />
                </div>
            </header>

            <main className="space-y-6">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <User className="w-3 h-3" /> Dados do Cliente
                        </h3>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-semibold">Cliente:</span> {protocol.cliente_nome}</p>
                            <p><span className="font-semibold">Nota Fiscal:</span> {protocol.venda_num_docto}</p>
                            {protocol.check_in_address && (
                                <p className="flex items-start gap-1 mt-2">
                                    <MapPin className="w-3 h-3 mt-1 text-gray-400" />
                                    <span className="text-xs text-gray-600">{protocol.check_in_address}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                            <Truck className="w-3 h-3" /> Dados da Operação
                        </h3>
                        <div className="space-y-1 text-sm">
                            <p><span className="font-semibold">Motorista:</span> {protocol.motoristas?.nome || 'N/A'}</p>
                            <p><span className="font-semibold">Data/Hora:</span> {formattedDate}</p>
                            <p><span className="font-semibold">Status:</span> <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase">{protocol.status}</span></p>
                            
                            {(checkInTime || checkOutTime) && (
                                <div className="mt-2 pt-2 border-t border-gray-200 text-xs grid grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-gray-500">Check-in</span>
                                        <p className="font-mono font-semibold">{checkInTime || '--:--'}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Check-out</span>
                                        <p className="font-mono font-semibold">{checkOutTime || '--:--'}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Boxes and Reception */}
                <section className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Movimentação de Carga
                        </h3>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-4 text-center">
                        <div className="bg-blue-50 p-3 rounded border border-blue-100">
                            <p className="text-xs text-blue-600 font-bold uppercase">Caixas Entregues</p>
                            <p className="text-2xl font-bold text-blue-900">{protocol.caixas_entregues || 0}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded border border-orange-100">
                            <p className="text-xs text-orange-600 font-bold uppercase">Caixas Recolhidas</p>
                            <p className="text-2xl font-bold text-orange-900">{protocol.caixas_recolhidas || 0}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border border-gray-100 text-left flex flex-col justify-center px-6">
                            <p className="text-xs text-gray-500 uppercase font-bold mb-1">Recebido Por</p>
                            <p className="text-sm font-bold">{protocol.recebedor_nome || 'Não informado'}</p>
                            <p className="text-xs text-gray-500">{protocol.recebedor_documento ? `Doc: ${protocol.recebedor_documento}` : 'Documento não inf.'}</p>
                        </div>
                    </div>
                </section>

                {/* Observations */}
                {protocol.observacoes && (
                    <section className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                        <h3 className="text-xs font-bold text-yellow-700 uppercase mb-1 flex items-center gap-2">
                            <Info className="w-3 h-3" /> Observações
                        </h3>
                        <p className="text-sm text-gray-800 italic">"{protocol.observacoes}"</p>
                    </section>
                )}

                {/* Checklist */}
                {protocol.items_status && Object.keys(protocol.items_status).length > 0 && (
                    <section>
                        <h3 className="text-sm font-bold text-gray-900 mb-2 border-b pb-1">Conferência de Itens</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(protocol.items_status).map(([item, checked]) => (
                                <div key={item} className="flex items-center text-xs p-2 border rounded bg-gray-50">
                                    {checked ? 
                                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white mr-2"><Check className="w-3 h-3" /></div> : 
                                        <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white mr-2"><X className="w-3 h-3" /></div>
                                    }
                                    <span className={checked ? 'text-gray-900' : 'text-gray-500'}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Evidence Images */}
                <section className="break-inside-avoid">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Evidências da Entrega</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                        {/* Signature */}
                        {protocol.assinatura_digital ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center bg-gray-50 min-h-[150px]">
                                <img 
                                    src={protocol.assinatura_digital} 
                                    alt="Assinatura Digital" 
                                    className="max-h-32 object-contain mix-blend-multiply"
                                    crossOrigin="anonymous"
                                />
                                <p className="text-xs text-gray-400 mt-2 uppercase font-bold tracking-wider">Assinatura Digital</p>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50 min-h-[150px] text-gray-400 text-xs uppercase">
                                Sem assinatura digital
                            </div>
                        )}

                        {/* Canhoto */}
                        {protocol.foto_comprovante ? (
                            <div className="border rounded-lg overflow-hidden bg-black min-h-[150px] relative group">
                                <img 
                                    src={protocol.foto_comprovante} 
                                    alt="Foto do Canhoto" 
                                    className="w-full h-40 object-contain bg-gray-900"
                                    crossOrigin="anonymous"
                                />
                                <div className="absolute bottom-0 left-0 w-full bg-black/70 text-white text-xs py-1 text-center font-bold uppercase">
                                    Foto do Canhoto
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50 min-h-[150px] text-gray-400 text-xs uppercase">
                                Sem foto do canhoto
                            </div>
                        )}
                    </div>

                    {/* Additional Photos */}
                    {protocol.fotos && protocol.fotos.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Fotos Adicionais</p>
                            <div className="grid grid-cols-3 gap-2">
                                {protocol.fotos.map((foto, index) => (
                                    <div key={index} className="border rounded overflow-hidden h-32 bg-gray-100">
                                        <img 
                                            src={foto} 
                                            alt={`Evidência ${index + 1}`} 
                                            className="w-full h-full object-cover"
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500 mb-1">Este documento é um comprovante digital de entrega gerado pelo sistema Costa Lavos 360.</p>
                <p className="text-[10px] text-gray-400">Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })} • ID: {protocol.id}</p>
            </footer>
        </div>
    );
});

export default ProtocolDetailReport;
