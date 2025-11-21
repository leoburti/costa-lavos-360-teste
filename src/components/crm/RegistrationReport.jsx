import React, { forwardRef } from 'react';

const ReportField = ({ label, value, className = '' }) => (
    <div className={`border-b border-gray-400 py-1 ${className}`}>
        <p className="text-[10px] font-bold text-gray-600">{label}</p>
        <p className="text-xs font-semibold text-black break-words">{value || '---'}</p>
    </div>
);

const ReportBlock = ({ label, value, bgColor, textColor = 'black', smallLabel = false }) => (
    <div className={`border border-black p-1.5 ${bgColor}`}>
        <p className={`text-[10px] font-bold ${textColor}`}>{label}</p>
        <p className={`font-bold ${smallLabel ? 'text-sm' : 'text-lg'} text-center ${textColor}`}>{value || '---'}</p>
    </div>
);

const RegistrationReport = forwardRef(({ reportData }, ref) => {
    if (!reportData) return null;

    const {
        deal_id,
        deal_created_at,
        seller_name,
        supervisor_name,
        qualification_data,
        corporate_name,
        fantasy_name,
        cnpj,
        state_registration,
        address_street,
        address_number,
        address_district,
        address_city,
        address_zip_code,
        email,
        phone,
        representative_name,
        representative_email,
        stage_name,
    } = reportData;

    const qd = qualification_data || {};

    const formattedDate = deal_created_at ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(deal_created_at)) : 'N/A';

    return (
        <div ref={ref} className="p-8 bg-white text-black font-sans A4-size">
            <header className="grid grid-cols-3 items-center border-b-2 border-black pb-4">
                <div className="col-span-1">
                    <div className="border-2 border-black p-2 max-w-[200px]">
                        <p className="text-3xl font-extrabold text-center">COSTA</p>
                        <p className="text-3xl font-extrabold text-center -mt-2">LAVOS</p>
                        <p className="text-[8px] text-center font-semibold mt-1">O AMOR PELO PÃO NOS CONECTA</p>
                    </div>
                </div>
                <div className="col-span-2">
                    <h1 className="text-4xl font-bold text-center">Cadastro de Cliente ou Prospect</h1>
                </div>
            </header>

            <main className="mt-4 grid grid-cols-2 gap-x-4">
                <div className="space-y-2">
                    <ReportBlock label="ID" value={deal_id?.substring(0, 8) || 'N/A'} bgColor="bg-white" />
                    <ReportBlock label="Data" value={formattedDate} bgColor="bg-yellow-200" />
                    <ReportBlock label="PRAZO PARA PAGAMENTO" value="---" bgColor="bg-yellow-200" smallLabel={true} />
                </div>
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-x-4">
                        <ReportBlock label="TIPO DE SOLICITAÇÃO" value={stage_name || "Cliente"} bgColor="bg-yellow-200" smallLabel={true} />
                        <ReportBlock label="VENDEDOR/SUPERVISOR" value={seller_name || supervisor_name} bgColor="bg-white" smallLabel={true} />
                    </div>
                    <ReportBlock label="VALOR A SER COBRADO PZ" value={qd.proposed_bread_price ? `R$ ${qd.proposed_bread_price}` : '---'} bgColor="bg-white" />
                    <div className="grid grid-cols-2 gap-x-4">
                        <ReportBlock label="QUANTIDADE MÊS KG" value={qd.proposed_bread_volume || '---'} bgColor="bg-green-500" textColor="white" />
                        <ReportBlock label="EQUIPAMENTOS A COMODATAR" value={qd.equipment_needed ? 'Sim' : 'Não'} bgColor="bg-red-500" textColor="white" />
                    </div>
                </div>
            </main>

            <section className="mt-4 border-t-2 border-black pt-2">
                <div className="grid grid-cols-2 gap-x-8">
                    <ReportField label="Cadastro de Prospect ou Cliente efetivo?" value={stage_name === 'Ganho' ? 'Cliente Efetivo' : 'Prospect'} />
                    <ReportField label="FORNECEDOR ATUAL" value={qd.current_supplier} />
                    <ReportField label="PRODUÇÃO PRÓPRIA" value="---" />
                    <ReportField label="TIPO DE CADASTRO" value="Jurídica" />
                    <ReportField label="CNPJ / CPF" value={cnpj} />
                    <ReportField label="INSCRIÇÃO" value={state_registration} />
                    <ReportField label="RAZÃO SOCIAL" value={corporate_name} />
                    <ReportField label="FANTASIA" value={fantasy_name} />
                    <ReportField label="CEP" value={address_zip_code} />
                    <ReportField label="ENDEREÇO DE ENTREGA" value={`${address_street || ''}, ${address_number || ''}`} />
                    <ReportField label="BAIRRO" value={address_district} />
                    <ReportField label="CIDADE" value={address_city} />
                    <ReportField label="E-MAIL PARA ENVIO DE NF E XML" value={email} />
                    <ReportField label="TELEFONE PARA CAPTAÇÃO DE PEDIDO" value={phone} />
                    <ReportField label="NOME DO RESPONSÁVEL PELO PEDIDO" value={representative_name} />
                    <ReportField label="NOME RESPONSÁVEL ASSINATURA CONTRATO" value={representative_name} />
                    <ReportField label="E-MAIL DO RESPONSÁVEL PARA ENVIO DO COMODATO" value={representative_email} />
                </div>
                <div className="mt-2">
                    <ReportField label="HISTÓRICO" value={qd.main_complaint || 'Nenhum histórico informado.'} />
                </div>
            </section>
            
            <footer className="mt-8 space-y-8">
                 <div className="h-24 border-b-2 border-black">
                     <p className="text-sm font-bold">FOTOS DO ESTABELECIMENTO:</p>
                 </div>
                 <div className="h-24 border-b-2 border-black">
                     <p className="text-sm font-bold">OBS Equipamentos:</p>
                     <p className="text-xs">{qd.equipment_needed || 'Nenhuma observação.'}</p>
                 </div>
            </footer>
        </div>
    );
});

export default RegistrationReport;