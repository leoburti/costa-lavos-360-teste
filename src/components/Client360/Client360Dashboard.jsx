
import React, { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, User, Users, ShoppingCart, HardHat, Globe, Star, Clock, Building2, FileText, Loader2, Mail, Phone, MapPin, AlertTriangle, Info, Gift, TrendingUp, TrendingDown, Minus, Image as ImageIcon, Tag } from 'lucide-react';
import { exportToPDF } from '@/utils/geoExportUtils';
import { format } from 'date-fns';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { enrichmentService } from '@/services/enrichmentService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(value || 0);
const formatPercent = (value) => new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 }).format((value || 0) / 100);

// --- Helper for CFOPs ---
const isBonificacao = (cfop) => ['5910', '6910'].includes(String(cfop));
const isEquipamento = (cfop) => ['5908', '6551', '6908', '5551'].includes(String(cfop));
const isVenda = (cfop) => !isBonificacao(cfop) && !isEquipamento(cfop);

// --- Google Places Component ---
const PlacesTab = ({ client, internalCnpj }) => {
  const [placesData, setPlacesData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchPlaces = async () => {
      setStatus('loading');
      setErrorMsg(null);

      const cnpjToUse = client.cnpj || internalCnpj;
      let searchParams = {};

      try {
          // 1. Fetch Enhanced Data (Check Cache -> Fallback to API)
          let enhancedData = null;
          if (cnpjToUse) {
              const enrichedResult = await enrichmentService.getEnrichedClientData({ cnpj: cnpjToUse });
              if (enrichedResult.status === 'success') {
                  enhancedData = enrichedResult.data;
              }
          }

          if (enhancedData) {
              // Map fields explicitly from enriched data
              searchParams = {
                  razao_social: enhancedData.razao_social || client.nome || undefined,
                  endereco_logradouro: enhancedData.logradouro || undefined,
                  endereco_numero: enhancedData.numero || undefined,
                  endereco_cidade: enhancedData.cidade || undefined,
                  endereco_uf: enhancedData.uf || undefined,
                  telefone: enhancedData.telefone || client.telefone || undefined,
                  cnpj: cnpjToUse ? cnpjToUse.replace(/\D/g, '') : undefined,
                  fantasyName: enhancedData.nome_fantasia || client.nome_fantasia || undefined,
                  address: (!enhancedData.logradouro && client.endereco) ? client.endereco : undefined 
              };
          } else {
              // Fallback to basic info
              searchParams = {
                  razao_social: client.nome || undefined,
                  fantasyName: client.nome_fantasia || undefined,
                  address: client.endereco || undefined,
                  telefone: client.telefone || undefined,
                  cnpj: cnpjToUse ? cnpjToUse.replace(/\D/g, '') : undefined
              };
          }

          if (!searchParams.address && (!searchParams.endereco_logradouro || !searchParams.endereco_cidade)) {
              if (client.endereco) {
                  searchParams.address = client.endereco;
              } else {
                  setStatus('error');
                  setErrorMsg('Endereço indisponível para busca no Google Maps.');
                  return;
              }
          }

          const result = await enrichmentService.getPlacesData(searchParams);
          
          if (result.status === 'success') {
            setPlacesData(result.data);
            setStatus('success');
          } else if (result.status === 'not_found') {
            setStatus('not_found');
          } else {
            setStatus('error');
            setErrorMsg(result.message || 'Erro ao buscar dados do local.');
          }
      } catch (err) {
          console.error(err);
          setStatus('error');
          setErrorMsg('Erro interno ao processar busca.');
      }
    };
    
    if (client) fetchPlaces();
  }, [client, internalCnpj]);

  if (status === 'loading') return <div className="p-8 flex flex-col items-center justify-center text-muted-foreground"><Loader2 className="animate-spin h-8 w-8 text-primary mb-2" /> Atualizando dados Google Maps...</div>;
  if (status === 'not_found') return <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">Local não encontrado no Google Maps.</div>;
  if (status === 'error' || !placesData) return <div className="p-8 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed flex flex-col items-center gap-2"><AlertTriangle className="h-6 w-6 text-yellow-500"/> <span>{errorMsg}</span></div>;

  const pd = placesData;
  const openingHoursList = pd.regular_opening_hours?.weekday_text || pd.regular_opening_hours?.weekdayDescriptions;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* Main Info Card */}
      <Card className="border-blue-100 shadow-sm lg:col-span-2">
        <CardHeader className="bg-blue-50/50 pb-4">
          <div className="flex justify-between items-start">
              <div>
                  <CardTitle className="flex items-center gap-2 text-blue-700 text-xl">
                    <Globe className="h-5 w-5" /> {pd.display_name}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm">{pd.formatted_address}</CardDescription>
              </div>
              {pd.price_level && <Badge variant="outline" className="bg-white">{pd.price_level}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-wrap gap-4 items-center">
             {pd.rating ? (
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-100">
                  <div className="flex flex-col items-center">
                      <span className="font-bold text-2xl text-yellow-700 leading-none">{pd.rating}</span>
                      <div className="flex text-yellow-400 mt-1">
                          {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < Math.round(pd.rating) ? 'fill-current' : 'text-gray-300'}`} />
                          ))}
                      </div>
                  </div>
                  <div className="h-8 w-px bg-yellow-200 mx-2"></div>
                  <div className="flex flex-col">
                      <span className="text-xs text-yellow-800 font-medium uppercase">Avaliações</span>
                      <span className="text-sm text-yellow-700">{pd.user_rating_count} opiniões</span>
                  </div>
                </div>
             ) : <Badge variant="secondary">Sem avaliações</Badge>}
             
             {pd.types && pd.types.length > 0 && (
                 <div className="flex flex-wrap gap-1.5">
                     {pd.types.slice(0, 4).map((t, i) => (
                         <Badge key={i} variant="secondary" className="text-xs font-normal capitalize">
                             <Tag className="h-3 w-3 mr-1 opacity-50"/> {t.replace(/_/g, ' ')}
                         </Badge>
                     ))}
                 </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                  <span className="text-xs text-muted-foreground block mb-1">Telefone</span>
                  <div className="flex items-center gap-2 font-medium">
                      <Phone className="h-4 w-4 text-slate-400"/> {pd.national_phone_number || 'N/A'}
                  </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
                  <span className="text-xs text-muted-foreground block mb-1">Website</span>
                  <div className="flex items-center gap-2 font-medium overflow-hidden">
                      <Globe className="h-4 w-4 text-slate-400"/> 
                      {pd.website_uri ? (
                          <a href={pd.website_uri} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">
                              Acessar site
                          </a>
                      ) : 'N/A'}
                  </div>
              </div>
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3 border-b"><CardTitle className="flex items-center gap-2 text-base"><Clock className="h-4 w-4 text-green-600" /> Horários de Funcionamento</CardTitle></CardHeader>
        <CardContent className="pt-4">
          {openingHoursList ? (
            <ul className="space-y-2 text-sm">
              {openingHoursList.map((desc, i) => {
                  // Handle potential formatting differences, usually "Day: Hours"
                  const parts = desc.split(': ');
                  const day = parts[0];
                  const hours = parts.slice(1).join(': ');
                  
                  return (
                      <li key={i} className="flex justify-between items-start border-b border-slate-50 pb-1 last:border-0 last:pb-0">
                          <span className="font-medium text-slate-700 capitalize">{day}</span>
                          <span className="text-slate-500 text-right">{hours || 'Fechado'}</span>
                      </li>
                  );
              })}
            </ul>
          ) : <div className="text-center text-muted-foreground py-4">Horários indisponíveis.</div>}
        </CardContent>
      </Card>

      {/* Photos Section */}
      {pd.photos && pd.photos.length > 0 && (
          <Card className="lg:col-span-3 overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b py-3">
                  <CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Fotos do Local ({pd.photos.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                  <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex w-max space-x-4 p-4">
                          {pd.photos.map((photo, i) => (
                              <div key={i} className="relative shrink-0 rounded-md overflow-hidden border shadow-sm w-[200px] h-[150px] bg-slate-100 flex items-center justify-center">
                                  <span className="text-xs text-muted-foreground">Foto {i+1} (Referência API)</span>
                                  {/* Note: Real photo rendering requires passing 'photo_reference' to Google API Places Photo endpoint with API Key. */}
                              </div>
                          ))}
                      </div>
                  </ScrollArea>
              </CardContent>
          </Card>
      )}
    </div>
  );
};

// --- Info Components ---
const BasicInfoTab = ({ data }) => {
    if (!data) return null;
    const val = (v) => v || '-';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            <Card className="h-full border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                        <User className="h-4 w-4 text-blue-600" /> Identificação do Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Código</p>
                            <p className="text-sm font-bold text-slate-900 bg-slate-100 inline-block px-2 py-0.5 rounded border border-slate-200">{val(data.codigo)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Loja</p>
                            <p className="text-sm font-bold text-slate-900 bg-slate-100 inline-block px-2 py-0.5 rounded border border-slate-200">{val(data.loja)}</p>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Razão Social</p>
                        <p className="text-sm font-medium text-slate-800">{val(data.nome)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Nome Fantasia</p>
                        <p className="text-sm font-medium text-slate-800">{val(data.nome_fantasia)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">CNPJ</p>
                        <p className="text-sm font-mono text-slate-700">{val(data.cnpj)}</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="h-full border-slate-200 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                    <CardTitle className="text-base flex items-center gap-2 text-slate-800">
                        <MapPin className="h-4 w-4 text-green-600" /> Localização e Contato
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-5">
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Endereço</p>
                        <p className="text-sm font-medium text-slate-800">{val(data.endereco)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Cidade / UF</p>
                        <p className="text-sm font-medium text-slate-800">{val(data.cidade)} {data.estado ? `- ${data.estado}` : ''}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 pt-2 border-t border-dashed border-slate-200">
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1 flex items-center gap-1"><Phone className="h-3 w-3"/> Telefone</p>
                            <p className="text-sm font-medium text-slate-800">{val(data.telefone)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1 flex items-center gap-1"><Mail className="h-3 w-3"/> Email</p>
                            <p className="text-sm font-medium text-slate-800 break-all">{val(data.email)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const DadosReceitaCard = ({ fantasyName, cnpj }) => {
    const [receitaData, setReceitaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setError(null);
            
            const identifier = cnpj || fantasyName;
            if (!identifier) {
                setLoading(false);
                return;
            }

            // Ensure we trigger the API if needed
            const result = await enrichmentService.getEnrichedClientData(cnpj ? { cnpj } : fantasyName);
            
            if (result.status === 'success') {
                setReceitaData(result.data);
            } else {
                setError(result.message);
            }
            setLoading(false);
        };
        
        if (fantasyName || cnpj) fetch();
    }, [fantasyName, cnpj]);

    if (loading) return <Card className="border-dashed"><CardContent className="p-6 flex justify-center"><Loader2 className="animate-spin h-5 w-5 text-primary"/></CardContent></Card>;
    if (error) return <Card className="border-dashed border-red-200 bg-red-50"><CardContent className="p-6 text-center text-red-600 text-sm">{error}</CardContent></Card>;
    if (!receitaData) return null;

    return (
        <Card className="border-emerald-100 shadow-sm animate-in fade-in duration-500">
            <CardHeader className="bg-emerald-50/50 pb-3 border-b border-emerald-100">
                <CardTitle className="flex items-center gap-2 text-emerald-700 text-base">
                    <Building2 className="h-4 w-4" /> Dados Receita Federal (Enriquecidos)
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-y-5 gap-x-4 text-sm">
                <div className="md:col-span-2"><p className="text-xs text-muted-foreground mb-0.5">Razão Social (RF)</p><p className="font-medium">{receitaData.razao_social || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground mb-0.5">CNPJ</p><p className="font-mono text-slate-700">{receitaData.CNPJ || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground mb-0.5">Situação</p><Badge variant={receitaData.situacao_cadastral === 'ATIVA' ? 'success' : 'secondary'}>{receitaData.situacao_cadastral || '-'}</Badge></div>
                <div><p className="text-xs text-muted-foreground mb-0.5">Data Abertura</p><p className="font-medium">{receitaData.data_fundacao ? format(new Date(receitaData.data_fundacao), 'dd/MM/yyyy') : '-'}</p></div>
                <div><p className="text-xs text-muted-foreground mb-0.5">Porte</p><p className="font-medium">{receitaData.porte || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground mb-0.5">Faixa Funcionários</p><p className="font-medium">{receitaData.faixa_funcionarios || '-'}</p></div>
                <div><p className="text-xs text-muted-foreground mb-0.5">Faixa Faturamento</p><p className="font-medium">{receitaData.faixa_faturamento || '-'}</p></div>
                
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 mt-2 border-t border-dashed border-slate-200">
                    <div><p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><MapPin className="h-3 w-3"/> Endereço Principal</p><p className="text-slate-700">{receitaData.logradouro}, {receitaData.numero} {receitaData.complemento}<br/>{receitaData.bairro} - {receitaData.cidade}/{receitaData.uf}<br/>CEP: {receitaData.cep}</p></div>
                    <div className="space-y-2">
                        <div><p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1"><Phone className="h-3 w-3"/> Telefone</p><p className="font-medium">{receitaData.telefone || '-'}</p></div>
                        <div><p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1"><Mail className="h-3 w-3"/> Email</p><p className="font-medium break-all">{receitaData.email || '-'}</p></div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const CostaLavosInfoTab = ({ data }) => {
    if (!data) return <div className="p-8 text-center text-muted-foreground">Dados não disponíveis.</div>;
    
    const items = [
        { label: "Supervisor", value: data.supervisor_name, icon: User },
        { label: "Vendedor", value: data.seller_name, icon: ShoppingCart },
        { label: "Grupo Cliente", value: data.customer_group, icon: Users },
        { label: "Data Cadastro", value: data.registration_date ? format(new Date(data.registration_date), 'dd/MM/yyyy') : '-', icon: Clock },
        { label: "Primeira Compra", value: data.first_purchase_date ? format(new Date(data.first_purchase_date), 'dd/MM/yyyy') : '-', icon: TrendingUp },
        { label: "Última Compra", value: data.last_purchase_date ? format(new Date(data.last_purchase_date), 'dd/MM/yyyy') : '-', icon: TrendingUp },
        { label: "Usa Equipamento?", value: data.uses_equipment, icon: HardHat },
        { label: "Qtd Dia/KG", value: data.kg_per_day, icon: Info },
        { label: "Cond. Pagamento", value: data.payment_condition, icon: FileText },
        { label: "Região", value: data.region, icon: MapPin },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-500">
            {items.map((item, idx) => (
                <Card key={idx} className="border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                            <p className="font-semibold text-slate-900">{item.value || 'N/A'}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

const TransactionsTable = ({ items, typeLabel }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Detalhamento de {typeLabel}</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Produto</TableHead>
                                <TableHead className="text-right">Qtd</TableHead>
                                <TableHead className="text-right">Valor Unit.</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-center">Var. Preço (90d)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item, idx) => (
                                <TableRow key={idx} className="hover:bg-slate-50">
                                    <TableCell className="font-medium text-xs">{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell className="text-xs">{item.product}</TableCell>
                                    <TableCell className="text-right text-xs">{formatNumber(item.quantity)}</TableCell>
                                    <TableCell className="text-right text-xs">{formatCurrency(item.unit_price)}</TableCell>
                                    <TableCell className="text-right text-xs font-bold">{formatCurrency(item.total_value)}</TableCell>
                                    <TableCell className="text-center">
                                        {item.price_diff_percent !== 0 ? (
                                            <Badge variant={item.price_diff_percent > 0 ? "destructive" : "success"} className="text-[10px]">
                                                {item.price_diff_percent > 0 ? <TrendingUp className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
                                                {Math.abs(item.price_diff_percent).toFixed(1)}%
                                            </Badge>
                                        ) : <Minus className="h-3 w-3 mx-auto text-muted-foreground"/>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

const SalesTab = ({ commercial, itemHistory }) => {
  const salesHistory = useMemo(() => itemHistory.filter(i => isVenda(i.cfop)), [itemHistory]);
  
  const chartData = useMemo(() => {
      const grouped = {};
      salesHistory.forEach(item => {
          const month = format(new Date(item.date), 'MM/yyyy');
          if (!grouped[month]) grouped[month] = { name: month, value: 0 };
          grouped[month].value += item.total_value;
      });
      return Object.values(grouped).reverse();
  }, [salesHistory]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
        <div className="grid grid-cols-2 gap-4">
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Vendas (12m)</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{formatCurrency(salesHistory.reduce((a,b) => a + b.total_value, 0))}</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pedidos (12m)</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold">{salesHistory.length}</div></CardContent>
            </Card>
        </div>

        <Card className="h-[350px]">
            <CardHeader><CardTitle>Evolução de Vendas (Últimos 12 Meses)</CardTitle></CardHeader>
            <CardContent className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `R$ ${(val/1000).toFixed(0)}k`} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Vendas" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <TransactionsTable items={salesHistory} typeLabel="Vendas" />
    </div>
  );
};

const BonificationTab = ({ itemHistory }) => {
    const bonusHistory = useMemo(() => itemHistory.filter(i => isBonificacao(i.cfop)), [itemHistory]);
    const totalBonus = bonusHistory.reduce((a,b) => a + b.total_value, 0);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
             <Card className="bg-purple-50 border-purple-100">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="p-3 bg-purple-100 rounded-full text-purple-600"><Gift className="h-6 w-6"/></div>
                    <div>
                        <p className="text-sm text-muted-foreground">Total Bonificado (12m)</p>
                        <p className="text-2xl font-bold text-purple-700">{formatCurrency(totalBonus)}</p>
                    </div>
                </CardContent>
            </Card>
            <TransactionsTable items={bonusHistory} typeLabel="Bonificações" />
        </div>
    );
};

const EquipmentTab = ({ inventory, itemHistory }) => {
  const equipOrders = useMemo(() => itemHistory.filter(i => isEquipamento(i.cfop)), [itemHistory]);

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><HardHat className="h-5 w-5 text-orange-600"/> Inventário Atual (ERP)</CardTitle></CardHeader>
            <CardContent>
                {inventory.length > 0 ? (
                    <div className="grid gap-3">
                        {inventory.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 border rounded-lg bg-slate-50">
                                <div>
                                    <p className="font-semibold text-sm">{item.modelo}</p>
                                    <p className="text-xs text-muted-foreground">Série: {item.serie}</p>
                                </div>
                                <Badge variant={item.status === 'Ativo' ? 'default' : 'secondary'}>{item.status}</Badge>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-muted-foreground py-4">Sem equipamentos no inventário.</p>}
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Pedidos de Equipamentos (12m)</CardTitle></CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Equipamento</TableHead>
                                <TableHead className="text-right">Qtd</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipOrders.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                                    <TableCell>{item.product}</TableCell>
                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(item.total_value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  );
};

export default function Client360Dashboard({ data, headerInfo }) {
  const { basicInfo, commercial, inventory, registration, itemHistory } = data;
  const displayFantasyName = headerInfo?.nome_fantasia || basicInfo.nome_fantasia || basicInfo.nome;
  const displayCnpj = basicInfo.cnpj; 
  
  const [internalCnpj, setInternalCnpj] = useState(null);

  useEffect(() => {
    const getCnpj = async () => {
       if (!displayCnpj) {
           const cnpj = await enrichmentService.findCNPJByFantasyName(displayFantasyName);
           setInternalCnpj(cnpj);
       }
    };
    getCnpj();
  }, [displayFantasyName, displayCnpj]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6 overflow-y-auto h-full bg-slate-50/30 dark:bg-slate-950/30">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{displayFantasyName}</h2>
          <div className="flex items-center gap-2 mt-1 text-gray-500 dark:text-gray-400 text-sm">
             <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{basicInfo.codigo}</span>
             <span>•</span>
             <span>{basicInfo.loja}</span>
             <span>•</span>
             <span className="flex items-center gap-1"><Globe className="h-3 w-3"/> {basicInfo.endereco}</span>
          </div>
        </div>
        <Button variant="outline" onClick={() => exportToPDF(`Ficha_${displayFantasyName}`, [], [])} className="shadow-sm">
          <Download className="w-4 h-4 mr-2" /> Exportar Ficha
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap bg-transparent p-0 gap-2 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50"><User className="w-4 h-4 mr-2"/> Informações</TabsTrigger>
          <TabsTrigger value="costa_lavos" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50"><Info className="w-4 h-4 mr-2"/> Informações Costa Lavos</TabsTrigger>
          <TabsTrigger value="receita" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50"><Building2 className="w-4 h-4 mr-2"/> Receita Federal</TabsTrigger>
          <TabsTrigger value="vendas" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50"><ShoppingCart className="w-4 h-4 mr-2"/> Vendas</TabsTrigger>
          <TabsTrigger value="bonificacao" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50"><Gift className="w-4 h-4 mr-2"/> Bonificação</TabsTrigger>
          <TabsTrigger value="equipamentos" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50"><HardHat className="w-4 h-4 mr-2"/> Equipamentos</TabsTrigger>
          <TabsTrigger value="places" className="data-[state=active]:bg-primary data-[state=active]:text-white border bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50"><Globe className="w-4 h-4 mr-2"/> Google Places</TabsTrigger>
        </TabsList>

        <div className="mt-2">
          <TabsContent value="info"><BasicInfoTab data={basicInfo} /></TabsContent>
          <TabsContent value="costa_lavos"><CostaLavosInfoTab data={registration} /></TabsContent>
          <TabsContent value="receita"><DadosReceitaCard fantasyName={displayFantasyName} cnpj={displayCnpj || internalCnpj} /></TabsContent>
          <TabsContent value="vendas"><SalesTab commercial={commercial} itemHistory={itemHistory} /></TabsContent>
          <TabsContent value="bonificacao"><BonificationTab itemHistory={itemHistory} /></TabsContent>
          <TabsContent value="equipamentos"><EquipmentTab inventory={inventory} itemHistory={itemHistory} /></TabsContent>
          <TabsContent value="places"><PlacesTab client={basicInfo} internalCnpj={internalCnpj} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
