import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SupplyContract = React.forwardRef(({ deal }, ref) => {
    const buyer = deal?.crm_contacts;
    const today = new Date();
    const formattedDate = format(today, "d 'de' MMMM 'de' yyyy", { locale: ptBR });

    const sellerInfo = {
        name: 'COSTA LAVOS INDÚSTRIA E COMÉRCIO DE PRODUTOS ALIMENTÍCIOS LTDA',
        cnpj: '00.000.000/0001-00', // Placeholder
        address: 'Rua Exemplo, 123',
        city: 'São Paulo',
        state: 'SP',
        zip: '00000-000',
    };

    if (!deal || !buyer) {
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
                .contract-paragraph {
                    text-align: justify;
                    text-indent: 2em;
                    margin-bottom: 0.5rem;
                }
            `}</style>
            <header className="text-center mb-12">
                <h1 className="text-xl font-bold uppercase">CONTRATO DE FORNECIMENTO</h1>
            </header>

            <section className="mb-8">
                <p className="font-bold mb-4 text-center">Pelo presente instrumento particular, de um lado:</p>
                <p><span className="font-bold">CONTRATANTE:</span> {buyer.corporate_name}, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº {buyer.cnpj}, com sede na {buyer.address_street}, {buyer.address_number}, {buyer.address_city} - {buyer.address_state}, CEP {buyer.address_zip_code}, neste ato representada na forma de seu contrato social.</p>
                <p className="font-bold my-4 text-center">E de outro lado:</p>
                <p><span className="font-bold">CONTRATADA:</span> {sellerInfo.name}, pessoa jurídica de direito privado, inscrita no CNPJ sob o n.º {sellerInfo.cnpj}, com sede na {sellerInfo.address}, Bairro {`{{bairro}}`}, Cidade {sellerInfo.city} – {sellerInfo.state}, CEP {sellerInfo.zip}, neste ato representada na forma de seu contrato social.</p>
            </section>

            <p className="mb-8">As partes acima qualificadas, doravante denominadas individualmente como “Parte” e, em conjunto, como “Partes”, resolvem celebrar o presente Contrato de Fornecimento, que será regido pelas seguintes cláusulas e condições:</p>

            <div className="space-y-4">
                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA PRIMEIRA - DO OBJETO</h2>
                    <p className="contract-paragraph">1.1. O presente contrato tem por objeto o fornecimento, pela CONTRATADA à CONTRATANTE, de pães e produtos de panificação congelados (“Produtos”), de acordo com as especificações, quantidades e preços detalhados nas Ordens de Compra emitidas pela CONTRATANTE e confirmadas pela CONTRATADA.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA SEGUNDA - DO PREÇO E DO PAGAMENTO</h2>
                    <p className="contract-paragraph">2.1. Pelos produtos fornecidos, a CONTRATANTE pagará à CONTRATADA os valores constantes na tabela de preços vigente na data de emissão de cada Ordem de Compra, ou conforme negociação específica documentada.</p>
                    <p className="contract-paragraph">2.2. O pagamento será realizado pela CONTRATANTE conforme as condições (forma e prazo) estabelecidas na respectiva nota fiscal/fatura emitida pela CONTRATADA.</p>
                    <p className="contract-paragraph">2.3. O não pagamento no vencimento acordado implicará na incidência de multa de 2% (dois por cento) sobre o valor do débito, acrescida de juros de mora de 1% (um por cento) ao mês e correção monetária pelo IGPM/FGV, ou índice que o substitua.</p>
                </div>
                
                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA TERCEIRA - DOS PEDIDOS</h2>
                    <p className="contract-paragraph">3.1. As solicitações de fornecimento serão realizadas por meio de Ordens de Compra, encaminhadas pela CONTRATANTE por e-mail, sistema eletrônico ou outro meio previamente acordado, com antecedência mínima de 48 (quarenta e oito) horas da data de entrega pretendida.</p>
                    <p className="contract-paragraph">3.2. A CONTRATADA confirmará o recebimento e a capacidade de atendimento da Ordem de Compra em até 24 (vinte e quatro) horas de seu recebimento.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA QUARTA - DA ENTREGA E DO RECEBIMENTO</h2>
                    <p className="contract-paragraph">4.1. A CONTRATADA se obriga a entregar os Produtos no endereço indicado pela CONTRATANTE, em conformidade com as normas sanitárias vigentes e em perfeitas condições para consumo.</p>
                    <p className="contract-paragraph">4.2. Caberá à CONTRATANTE conferir os Produtos no ato da entrega, em relação à quantidade e à integridade das embalagens, devendo recusar o recebimento de volumes que apresentem avarias ou que estejam em desacordo com a Ordem de Compra, registrando a ressalva no canhoto da nota fiscal.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA QUINTA - DAS OBRIGAÇÕES DA CONTRATADA</h2>
                    <p className="contract-paragraph">5.1. São obrigações da CONTRATADA:</p>
                    <p className="ml-8">a) Fornecer os Produtos com a qualidade e as especificações acordadas;</p>
                    <p className="ml-8">b) Cumprir rigorosamente os prazos de entrega;</p>
                    <p className="ml-8">c) Manter todas as licenças e alvarás necessários para a produção e comercialização dos Produtos em dia;</p>
                    <p className="ml-8">d) Garantir a rastreabilidade dos lotes de produção.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA SEXTA - DAS OBRIGAÇÕES DA CONTRATANTE</h2>
                    <p className="contract-paragraph">6.1. São obrigações da CONTRATANTE:</p>
                    <p className="ml-8">a) Realizar os pagamentos de forma pontual;</p>
                    <p className="ml-8">b) Disponibilizar local e condições adequadas para o recebimento e armazenamento dos Produtos, garantindo a manutenção da cadeia de frio conforme as especificações da CONTRATADA;</p>
                    <p className="ml-8">c) Informar à CONTRATADA, de imediato, sobre qualquer não conformidade identificada nos produtos após o recebimento.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA SÉTIMA - DA CONFIDENCIALIDADE</h2>
                    <p className="contract-paragraph">7.1. As Partes se obrigam a manter em absoluto sigilo e confidencialidade todas as informações, dados técnicos, comerciais e financeiros a que tiverem acesso em virtude da execução deste Contrato, não podendo revelá-las a terceiros, salvo com autorização expressa da outra Parte ou por força de lei.</p>
                </div>

                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA OITAVA - DA VIGÊNCIA E DA RESCISÃO</h2>
                    <p className="contract-paragraph">8.1. O presente Contrato vigorará por prazo indeterminado, a contar da data de sua assinatura.</p>
                    <p className="contract-paragraph">8.2. Este Contrato poderá ser rescindido por qualquer das Partes, imotivadamente, mediante notificação prévia e por escrito à outra Parte, com antecedência mínima de 30 (trinta) dias.</p>
                    <p className="contract-paragraph">8.3. O Contrato poderá ser rescindido de pleno direito, independentemente de notificação, em caso de descumprimento de qualquer de suas cláusulas, falência, pedido de recuperação judicial ou extrajudicial de qualquer das Partes.</p>
                </div>

                 <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA NONA - DO CASO FORTUITO E FORÇA MAIOR</h2>
                    <p className="contract-paragraph">9.1. As Partes não serão responsabilizadas pelo descumprimento de suas obrigações na ocorrência de caso fortuito ou força maior, nos termos do artigo 393 do Código Civil brasileiro, devendo a Parte afetada comunicar a outra imediatamente.</p>
                </div>

                 <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA DÉCIMA - DAS DISPOSIÇÕES GERAIS</h2>
                    <p className="contract-paragraph">10.1. Nenhuma tolerância por qualquer das Partes, em relação ao cumprimento das obrigações da outra, importará em novação, renúncia ou alteração do pactuado.</p>
                    <p className="contract-paragraph">10.2. Todas as comunicações relativas a este Contrato deverão ser feitas por escrito.</p>
                </div>

                 <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA DÉCIMA PRIMEIRA - DA LEGISLAÇÃO APLICÁVEL</h2>
                     <p className="contract-paragraph">11.1. Este contrato é regido e interpretado de acordo com as leis da República Federativa do Brasil.</p>
                </div>
                
                <div className="no-break">
                    <h2 className="font-bold mb-2">CLÁUSULA DÉCIMA SEGUNDA - DO FORO</h2>
                    <p className="contract-paragraph">12.1. As Partes elegem o foro da Comarca de {sellerInfo.city}, {sellerInfo.state}, para dirimir quaisquer controvérsias oriundas do presente Contrato, com expressa renúncia a qualquer outro, por mais privilegiado que seja.</p>
                </div>
            </div>

            <p className="contract-paragraph mt-12">E, por estarem assim justas e contratadas, as Partes assinam o presente Contrato em 2 (duas) vias de igual teor e forma, na presença de 2 (duas) testemunhas abaixo assinadas.</p>

            <p className="text-right my-12">{sellerInfo.city}, {formattedDate}.</p>

            <footer className="mt-24 space-y-16">
                <div className="grid grid-cols-2 gap-16 text-center">
                    <div className="border-t pt-2 border-black">
                        <p className="font-bold">{sellerInfo.name}</p>
                        <p className="text-xs">CNPJ: {sellerInfo.cnpj}</p>
                        <p className="text-xs">(CONTRATADA)</p>
                    </div>
                    <div className="border-t pt-2 border-black">
                        <p className="font-bold">{buyer.corporate_name}</p>
                        <p className="text-xs">CNPJ: {buyer.cnpj}</p>
                        <p className="text-xs">(CONTRATANTE)</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-16 text-center pt-8">
                    <div className="border-t pt-2 border-black">
                        <p>Testemunha 1</p>
                        <p className="text-xs mt-4">Nome:</p>
                        <p className="text-xs">CPF:</p>
                    </div>
                    <div className="border-t pt-2 border-black">
                        <p>Testemunha 2</p>
                        <p className="text-xs mt-4">Nome:</p>
                        <p className="text-xs">CPF:</p>
                    </div>
                </div>
            </footer>
        </div>
    );
});

export default SupplyContract;