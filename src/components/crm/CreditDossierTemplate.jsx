
import React, { forwardRef } from 'react';
import { CheckCircle, AlertTriangle, XCircle, TrendingUp, Shield, Building2, Scale, Landmark, CreditCard, Users, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-lg font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
  </div>
);

const InfoGrid = ({ items }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
    {items.map((item, index) => (
      <div key={index} className="flex flex-col">
        <span className="text-xs font-medium text-gray-500 uppercase">{item.label}</span>
        <span className="text-sm font-semibold text-gray-900 break-words">{item.value || '-'}</span>
      </div>
    ))}
  </div>
);

const StatusBadge = ({ status, type = 'default' }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  let Icon = CheckCircle;

  if (type === 'risk') {
    if (status === 'Baixo' || status === 'Muito Baixo') { colorClass = 'bg-green-100 text-green-800 border-green-200'; Icon = CheckCircle; }
    else if (status === 'Médio') { colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200'; Icon = AlertTriangle; }
    else { colorClass = 'bg-red-100 text-red-800 border-red-200'; Icon = XCircle; }
  }

  return (
    <div className={`flex items-center gap-1 px-3 py-1 rounded-full border ${colorClass} text-xs font-bold`}>
      <Icon className="w-3 h-3" />
      {status}
    </div>
  );
};

const CreditDossierTemplate = forwardRef(({ data, contact }, ref) => {
  if (!data) return null;

  // Safe access helpers
  const safe = (obj, path, fallback = '-') => {
    return path.split('.').reduce((acc, part) => acc && acc[path] ? acc[path] : (acc?.[part] !== undefined ? acc[part] : fallback), obj);
  };

  const score = safe(data, 'Score.Pontuacao', 0);
  const scoreClass = score > 700 ? 'text-green-600' : score > 400 ? 'text-yellow-600' : 'text-red-600';
  const riskLevel = score > 700 ? 'Baixo Risco' : score > 400 ? 'Médio Risco' : 'Alto Risco';

  return (
    <div ref={ref} className="bg-white p-8 max-w-[1000px] mx-auto font-sans print:p-0">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 bg-slate-900 text-white p-6 rounded-xl shadow-lg">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight mb-1">DOSSIÊ DE CRÉDITO</h1>
          <p className="text-blue-200 text-sm font-medium">ANÁLISE DETALHADA DE RISCO</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-300">Gerado em</p>
          <p className="font-bold">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Score de Crédito</p>
                        <div className={`text-4xl font-extrabold ${scoreClass} mt-1`}>{score}</div>
                    </div>
                    <TrendingUp className={`w-10 h-10 ${scoreClass} opacity-20`} />
                </div>
                <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${score > 700 ? 'bg-green-500' : score > 400 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(score / 1000) * 100}%` }}></div>
                </div>
            </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-sm">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Classificação de Risco</p>
                        <div className="text-2xl font-bold text-gray-800 mt-1">{riskLevel}</div>
                    </div>
                    <Shield className="w-10 h-10 text-indigo-500 opacity-20" />
                </div>
                <StatusBadge status={riskLevel.split(' ')[0]} type="risk" />
            </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Restrições Ativas</p>
                        <div className="text-2xl font-bold text-gray-800 mt-1">
                            {safe(data, 'Pendencias.Total', 0) + safe(data, 'Protestos.Total', 0)}
                        </div>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-purple-500 opacity-20" />
                </div>
                <p className="text-xs text-gray-400 mt-2">Pendências + Protestos</p>
            </CardContent>
        </Card>
      </div>

      {/* 1. Dados Cadastrais */}
      <div className="mb-8">
        <SectionHeader icon={Building2} title="Dados Cadastrais" />
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <InfoGrid items={[
                { label: 'Razão Social', value: safe(data, 'DadosCadastrais.RazaoSocial', contact?.corporate_name) },
                { label: 'Nome Fantasia', value: safe(data, 'DadosCadastrais.NomeFantasia', contact?.fantasy_name) },
                { label: 'CNPJ', value: safe(data, 'DadosCadastrais.CNPJ', contact?.cnpj) },
                { label: 'Data Fundação', value: formatDate(safe(data, 'DadosCadastrais.DataFundacao', contact?.foundation_date)) },
                { label: 'Situação Cadastral', value: safe(data, 'DadosCadastrais.Situacao', 'Ativa') },
                { label: 'Atividade Principal', value: safe(data, 'DadosCadastrais.AtividadePrincipal', contact?.industry_sector) },
                { label: 'Endereço', value: `${safe(data, 'Endereco.Logradouro', contact?.address_street)}, ${safe(data, 'Endereco.Numero', contact?.address_number)}` },
                { label: 'Cidade/UF', value: `${safe(data, 'Endereco.Cidade', contact?.address_city)} - ${safe(data, 'Endereco.UF', contact?.address_state)}` },
                { label: 'Telefone', value: safe(data, 'Contatos.Telefone', contact?.phone) },
            ]} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 2. Pendências Financeiras */}
          <div className="mb-8">
            <SectionHeader icon={Landmark} title="Pendências Financeiras" />
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left font-semibold text-gray-600">Origem</th>
                            <th className="p-3 text-right font-semibold text-gray-600">Valor</th>
                            <th className="p-3 text-right font-semibold text-gray-600">Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {safe(data, 'PendenciasFinanceiras', []).length > 0 ? (
                            safe(data, 'PendenciasFinanceiras').map((p, i) => (
                                <tr key={i} className="bg-white">
                                    <td className="p-3">{p.Origem || 'N/D'}</td>
                                    <td className="p-3 text-right font-medium text-red-600">{formatCurrency(p.Valor)}</td>
                                    <td className="p-3 text-right text-gray-500">{formatDate(p.DataOcorrencia)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-gray-400 italic">Nenhuma pendência encontrada.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>

          {/* 3. Protestos */}
          <div className="mb-8">
            <SectionHeader icon={Scale} title="Protestos em Cartório" />
            <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left font-semibold text-gray-600">Cartório</th>
                            <th className="p-3 text-right font-semibold text-gray-600">Valor</th>
                            <th className="p-3 text-right font-semibold text-gray-600">Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {safe(data, 'Protestos', []).length > 0 ? (
                            safe(data, 'Protestos').map((p, i) => (
                                <tr key={i} className="bg-white">
                                    <td className="p-3">{p.Cartorio || 'N/D'}</td>
                                    <td className="p-3 text-right font-medium text-red-600">{formatCurrency(p.Valor)}</td>
                                    <td className="p-3 text-right text-gray-500">{formatDate(p.DataProtesto)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="p-4 text-center text-gray-400 italic">Nenhum protesto encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
          </div>
      </div>

      {/* 4. Quadro Societário */}
      <div className="mb-8">
        <SectionHeader icon={Users} title="Quadro Societário" />
        <div className="grid grid-cols-1 gap-4">
            {safe(data, 'Socios', []).length > 0 ? (
                safe(data, 'Socios').map((socio, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div>
                            <p className="font-bold text-gray-800">{socio.Nome}</p>
                            <p className="text-xs text-gray-500">CPF/CNPJ: {socio.Documento}</p>
                        </div>
                        <div className="text-right">
                            <Badge variant="outline" className="mb-1">{socio.Qualificacao || 'Sócio'}</Badge>
                            <p className="text-xs text-gray-500">Entrada: {formatDate(socio.DataEntrada)}</p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="p-4 text-center text-gray-400 italic bg-gray-50 rounded-lg">Informações societárias não disponíveis.</div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 5. Consultas Recentes */}
          <div className="mb-8">
            <SectionHeader icon={History} title="Histórico de Consultas" />
            <ul className="space-y-2">
                {safe(data, 'Consultas', []).slice(0, 5).map((c, i) => (
                    <li key={i} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                        <span className="font-medium text-gray-700">{c.NomeConsultante || 'Empresa Diversa'}</span>
                        <span className="text-gray-500">{formatDate(c.DataConsulta)}</span>
                    </li>
                ))}
                {safe(data, 'Consultas', []).length === 0 && <li className="text-gray-400 italic text-sm">Sem consultas recentes.</li>}
            </ul>
          </div>

          {/* 6. Produtos Financeiros */}
          <div className="mb-8">
            <SectionHeader icon={CreditCard} title="Produtos Financeiros" />
            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Empréstimos Ativos</span>
                    <Badge variant={safe(data, 'Emprestimos.Total', 0) > 0 ? 'secondary' : 'outline'}>
                        {safe(data, 'Emprestimos.Total', 0)}
                    </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Cartões de Crédito</span>
                    <Badge variant={safe(data, 'Cartoes.Total', 0) > 0 ? 'secondary' : 'outline'}>
                        {safe(data, 'Cartoes.Total', 0)}
                    </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Consórcios</span>
                    <Badge variant={safe(data, 'Consorcios.Total', 0) > 0 ? 'secondary' : 'outline'}>
                        {safe(data, 'Consorcios.Total', 0)}
                    </Badge>
                </div>
            </div>
          </div>
      </div>

      <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">Este documento é confidencial e destinado exclusivamente para análise de crédito interna.</p>
      </div>
    </div>
  );
});

CreditDossierTemplate.displayName = 'CreditDossierTemplate';

export default CreditDossierTemplate;
