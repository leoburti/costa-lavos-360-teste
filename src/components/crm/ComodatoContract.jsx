import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ComodatoContract = React.forwardRef(({ deal }, ref) => {
    const client = deal?.crm_contacts;
    const today = new Date();
    const formattedDate = format(today, "d 'de' MMMM 'de' yyyy", { locale: ptBR });

    const companyInfo = {
        name: 'COSTA LAVOS INDÚSTRIA E COMÉRCIO DE PRODUTOS ALIMENTÍCIOS LTDA',
        cnpj: '00.000.000/0001-00', // Placeholder
        address: 'Rua Exemplo, 123',
        city: 'São Paulo',
        state: 'SP',
        zip: '00000-000',
    };

    if (!deal || !client) {
        return <div ref={ref} className="p-8 text-center">Carregando dados do contrato...</div>;
    }

    return (
        <div ref={ref} className="bg-white text-black font-serif p-12 text-sm leading-relaxed">
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 1in;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                    }
                    .no-break {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
            <header className="text-center mb-12">
                <img src="https://horizons-cdn.hostinger.com/af07f265-a066-448a-97b1-ed36097a0659/702b0260ab5ec21070e294c9fe739730.png" alt="Costa Lavos Logo" className="h-20 mx-auto mb-4" />
                <h1 className="text-xl font-bold uppercase">Contrato de Comodato de Equipamentos</h1>
            </header>

            <section className="mb-8">
                <p className="font-bold mb-2">COMODANTE:</p>
                <p>{companyInfo.name}, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº {companyInfo.cnpj}, com sede na {companyInfo.address}, {companyInfo.city} - {companyInfo.state}, CEP {companyInfo.zip}, neste ato representada na forma de seu Contrato Social.</p>
            </section>

            <section className="mb-8">
                <p className="font-bold mb-2">COMODATÁRIO:</p>
                <p>{client.corporate_name}, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº {client.cnpj}, com sede na {client.address_street}, {client.address_number}, {client.address_city} - {client.address_state}, CEP {client.address_zip_code}, neste ato representada na forma de seu Contrato Social.</p>
            </section>

            <p className="mb-8">As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Comodato, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.</p>

            <div className="space-y-4">
                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA 1ª - DO OBJETO DO CONTRATO</h2>
                    <p>O presente contrato tem como OBJETO a cessão, pela COMODANTE à COMODATÁRIA, de equipamentos para armazenamento e preparo de pães e produtos de panificação (doravante denominados "Equipamentos"), cuja descrição e quantidade serão especificadas em anexo ou em ordens de serviço subsequentes, que farão parte integrante deste instrumento.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA 2ª - DAS OBRIGAÇÕES DA COMODATÁRIA</h2>
                    <p>A COMODATÁRIA se obriga a:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Utilizar os Equipamentos exclusivamente para o armazenamento e preparo dos produtos fornecidos pela COMODANTE.</li>
                        <li>Manter os Equipamentos em perfeito estado de conservação, limpeza e funcionamento, arcando com os custos de manutenção preventiva e corretiva que não decorram de vício de fabricação.</li>
                        <li>Não ceder, alugar, emprestar ou de qualquer forma transferir a posse dos Equipamentos a terceiros sem a prévia e expressa autorização da COMODANTE.</li>
                        <li>Responsabilizar-se por quaisquer danos, perdas, furtos ou roubos dos Equipamentos, devendo ressarcir a COMODANTE pelo valor de mercado de um equipamento novo e de mesmas características.</li>
                        <li>Permitir o livre acesso de prepostos da COMODANTE para vistorias e manutenções.</li>
                    </ul>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA 3ª - DAS OBRIGAÇÕES DA COMODANTE</h2>
                    <p>A COMODANTE se obriga a entregar os Equipamentos em perfeitas condições de uso e a prestar o suporte técnico inicial para sua instalação e operação.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA 4ª - DO PRAZO</h2>
                    <p>O presente contrato vigorará por prazo indeterminado, enquanto perdurar a relação comercial de compra e venda de produtos entre as partes.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA 5ª - DA RESCISÃO</h2>
                    <p>O presente contrato poderá ser rescindido por qualquer das partes, mediante notificação por escrito com antecedência mínima de 30 (trinta) dias. A rescisão da relação comercial de fornecimento de produtos implica na rescisão automática deste contrato, devendo a COMODATÁRIA devolver os Equipamentos em até 5 (cinco) dias úteis, nas mesmas condições em que os recebeu, ressalvado o desgaste natural pelo uso.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA 6ª - DA EXCLUSIVIDADE</h2>
                    <p>A COMODATÁRIA compromete-se a adquirir com exclusividade da COMODANTE os produtos de panificação congelados a serem utilizados nos Equipamentos objeto deste contrato, sob pena de rescisão imediata e cobrança de multa no valor de 3 (três) vezes o valor de mercado dos equipamentos cedidos.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA 7ª - DO FORO</h2>
                    <p>Fica eleito o foro da Comarca de São Paulo - SP para dirimir quaisquer controvérsias oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.</p>
                </div>
            </div>

            <p className="text-center my-12">E, por estarem assim justas e contratadas, firmam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.</p>

            <p className="text-right my-12">{companyInfo.city}, {formattedDate}.</p>

            <footer className="mt-24 space-y-16">
                <div className="grid grid-cols-2 gap-16 text-center">
                    <div className="border-t pt-2">
                        <p className="font-bold">{companyInfo.name}</p>
                        <p className="text-xs">CNPJ: {companyInfo.cnpj}</p>
                        <p className="text-xs">(Comodante)</p>
                    </div>
                    <div className="border-t pt-2">
                        <p className="font-bold">{client.corporate_name}</p>
                        <p className="text-xs">CNPJ: {client.cnpj}</p>
                        <p className="text-xs">(Comodatário)</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-16 text-center">
                    <div className="border-t pt-2">
                        <p>Testemunha 1</p>
                        <p className="text-xs">Nome:</p>
                        <p className="text-xs">CPF:</p>
                    </div>
                    <div className="border-t pt-2">
                        <p>Testemunha 2</p>
                        <p className="text-xs">Nome:</p>
                        <p className="text-xs">CPF:</p>
                    </div>
                </div>
            </footer>
        </div>
    );
});

export default ComodatoContract;