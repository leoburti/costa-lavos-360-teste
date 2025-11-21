
import React, { Suspense, lazy, useEffect, memo } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import { FilterProvider } from '@/contexts/FilterContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PageActionProvider } from '@/contexts/PageActionContext';

import AuthGuard from '@/components/AuthGuard';
import LayoutOverride from '@/components/LayoutOverride';
import { Toaster } from '@/components/ui/toaster';
import LoadingSpinner from '@/components/LoadingSpinner';
import PageSkeleton from '@/components/PageSkeleton';
import { prefetchCriticalRoutes } from '@/utils/performance';

// --- Optimized Lazy Imports ---
// We group imports or preload on interaction in real scenarios, 
// but here we stick to basic lazy to keep bundle size small initially.

// Auth Pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const AuthConfirmation = lazy(() => import('@/pages/auth/AuthConfirmation'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const UpdatePassword = lazy(() => import('@/pages/auth/UpdatePassword'));

// Main Feature Pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AIChat = lazy(() => import('@/pages/AIChat'));
const BonificacoesPage = lazy(() => import('@/pages/bonificacoes/BonificacoesPage'));
const Tarefas = lazy(() => import('@/pages/Tarefas'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Analytics Pages
const AnaliticoSupervisor = lazy(() => import('@/pages/AnaliticoSupervisor'));
const AnaliticoVendedor = lazy(() => import('@/pages/AnaliticoVendedor'));
const AnaliticoRegiao = lazy(() => import('@/pages/AnaliticoRegiao'));
const AnaliticoGrupoClientes = lazy(() => import('@/pages/AnaliticoGrupoClientes'));
const AnaliticoProduto = lazy(() => import('@/pages/AnaliticoProduto'));
const Visao360Cliente = lazy(() => import('@/pages/Visao360Cliente'));

// Commercial Analysis Pages
const AnaliticoVendasDiarias = lazy(() => import('@/pages/AnaliticoVendasDiarias'));
const AnaliseChurn = lazy(() => import('@/pages/AnaliseChurn'));
const CurvaABC = lazy(() => import('@/pages/CurvaABC'));
const CalculoRFM = lazy(() => import('@/pages/CalculoRFM'));
const TendenciaVendas = lazy(() => import('@/pages/TendenciaVendas'));
const AnaliseValorUnitario = lazy(() => import('@/pages/AnaliseValorUnitario'));
const BaixoDesempenho = lazy(() => import('@/pages/BaixoDesempenho'));
const AnaliseFidelidade = lazy(() => import('@/pages/AnaliseFidelidade'));
const ProdutosBonificados = lazy(() => import('@/pages/ProdutosBonificados'));
const PerformanceBonificados = lazy(() => import('@/pages/PerformanceBonificados'));
const AnaliticoBonificados = lazy(() => import('@/pages/AnaliticoBonificados'));

// Equipment Analysis Pages
const MovimentacaoEquipamentos = lazy(() => import('@/pages/MovimentacaoEquipamentos'));
const AnaliticoEquipamentosCliente = lazy(() => import('@/pages/AnaliticoEquipamentosCliente'));
const AnaliticoEquipamento = lazy(() => import('@/pages/AnaliticoEquipamento'));
const EquipamentosEmCampo = lazy(() => import('@/pages/EquipamentosEmCampo'));

// Managerial Analysis Pages
const RaioXSupervisor = lazy(() => import('@/pages/RaioXSupervisor'));
const RaioXVendedor = lazy(() => import('@/pages/RaioXVendedor'));

// Delivery Management Pages
const DeliveryDashboard = lazy(() => import('@/pages/delivery-management/Dashboard'));
const Deliveries = lazy(() => import('@/pages/delivery-management/Deliveries'));
const Drivers = lazy(() => import('@/pages/delivery-management/Drivers'));
const RouteOptimization = lazy(() => import('@/pages/delivery-management/RouteOptimization'));
const Customers = lazy(() => import('@/pages/delivery-management/Customers'));
const Disputes = lazy(() => import('@/pages/delivery-management/Disputes'));
const DeliveryReports = lazy(() => import('@/pages/delivery-management/Reports'));
const DeliveryReceipts = lazy(() => import('@/pages/delivery-management/DeliveryReceipts'));
const DeliverySettings = lazy(() => import('@/pages/delivery-management/Settings'));

// CRM Pages
const Pipeline = lazy(() => import('@/pages/crm/Pipeline'));
const CrmContacts = lazy(() => import('@/pages/crm/Contacts'));
const ComodatoContracts = lazy(() => import('@/pages/crm/ComodatoContracts'));
const CrmAutomations = lazy(() => import('@/pages/crm/Automations'));
const CrmReports = lazy(() => import('@/pages/crm/Reports'));
const CrmTeam = lazy(() => import('@/pages/crm/Team'));

// Gestão de Equipe
const CentralizedTeamManagement = lazy(() => import('@/pages/configuracoes/gestao-equipe/CentralizedTeamManagement'));

// Apoio Pages
const ApoioLayout = lazy(() => import('@/pages/apoio/ApoioLayout'));
// Comodato
const ComodatoLayout = lazy(() => import('@/pages/apoio/comodato/ComodatoLayout'));
const ClientesComodatoPage = lazy(() => import('@/pages/apoio/comodato/clientes/ClientesComodatoPage'));
const ClienteComodatoForm = lazy(() => import('@/pages/apoio/comodato/clientes/ClienteComodatoForm'));
const ModelosEquipamentosPage = lazy(() => import('@/pages/apoio/comodato/equipamentos/ModelosEquipamentosPage'));
const ModeloEquipamentoForm = lazy(() => import('@/pages/apoio/comodato/equipamentos/ModeloEquipamentoForm'));
const EstoqueClientePage = lazy(() => import('@/pages/apoio/comodato/estoque/EstoqueClientePage'));
const EquipamentoComodatoForm = lazy(() => import('@/pages/apoio/comodato/estoque/EquipamentoComodatoForm'));
const EntregaForm = lazy(() => import('@/pages/apoio/comodato/fluxos/EntregaForm'));
const TrocaForm = lazy(() => import('@/pages/apoio/comodato/fluxos/TrocaForm'));
const RetiradaForm = lazy(() => import('@/pages/apoio/comodato/fluxos/RetiradaForm'));

// Chamados
const ChamadosLayout = lazy(() => import('@/pages/apoio/chamados/ChamadosLayout'));
const ChamadosTodosPage = lazy(() => import('@/pages/apoio/chamados/ChamadosTodosPage'));
const ChamadoForm = lazy(() => import('@/pages/apoio/chamados/ChamadoForm'));
const ChamadoDetalhesPage = lazy(() => import('@/pages/apoio/chamados/ChamadoDetalhesPage'));
const MotivosPage = lazy(() => import('@/pages/apoio/chamados/MotivosPage'));
const MotivoForm = lazy(() => import('@/pages/apoio/chamados/MotivoForm'));
const FormulariosPage = lazy(() => import('@/pages/apoio/chamados/FormulariosPage'));
const FormularioForm = lazy(() => import('@/pages/apoio/chamados/FormularioForm'));

// Agenda
const AgendaLayout = lazy(() => import('@/pages/apoio/agenda/AgendaLayout'));
const MinhaAgendaPage = lazy(() => import('@/pages/apoio/agenda/MinhaAgendaPage'));
const AgendaEquipePage = lazy(() => import('@/pages/apoio/agenda/AgendaEquipePage'));
const DisponibilidadePage = lazy(() => import('@/pages/apoio/agenda/DisponibilidadePage'));
const BloqueiosPage = lazy(() => import('@/pages/apoio/agenda/BloqueiosPage'));
const ConflitosPage = lazy(() => import('@/pages/apoio/agenda/ConflitosPage'));
const DisponibilidadeForm = lazy(() => import('@/pages/apoio/agenda/DisponibilidadeForm'));
const BloqueioForm = lazy(() => import('@/pages/apoio/agenda/BloqueioForm'));
const EventosPage = lazy(() => import('@/pages/apoio/agenda/EventosPage'));
const AgendamentosPage = lazy(() => import('@/pages/apoio/agenda/AgendamentosPage'));

// Notificações
const NotificacoesLayout = lazy(() => import('@/pages/apoio/notificacoes/NotificacoesLayout'));
const MinhasNotificacoesPage = lazy(() => import('@/pages/apoio/notificacoes/MinhasNotificacoesPage'));
const NaoLidasPage = lazy(() => import('@/pages/apoio/notificacoes/NaoLidasPage'));
const ArquivadasPage = lazy(() => import('@/pages/apoio/notificacoes/ArquivadasPage'));
const PreferenciasPage = lazy(() => import('@/pages/apoio/notificacoes/PreferenciasPage'));

// Geolocalização
const GeolocalizacaoLayout = lazy(() => import('@/pages/apoio/geolocalizacao/GeolocalizacaoLayout'));
const CheckinCheckoutPage = lazy(() => import('@/pages/apoio/geolocalizacao/CheckinCheckoutPage'));
const RastreamentoPage = lazy(() => import('@/pages/apoio/geolocalizacao/RastreamentoPage'));
const RotasPage = lazy(() => import('@/pages/apoio/geolocalizacao/RotasPage'));
const HistoricoPage = lazy(() => import('@/pages/apoio/geolocalizacao/HistoricoPage'));
const RelatoriosGeoPage = lazy(() => import('@/pages/apoio/geolocalizacao/RelatoriosPage'));
const IntegracoesPage = lazy(() => import('@/pages/apoio/geolocalizacao/IntegracoesPage'));
const IntegracaoForm = lazy(() => import('@/pages/apoio/geolocalizacao/IntegracaoForm'));
const DadosClientesApoioPage = lazy(() => import('@/pages/apoio/geolocalizacao/DadosClientesPage'));

// Relatórios
const RelatoriosLayout = lazy(() => import('@/pages/apoio/relatorios/RelatoriosLayout'));
const RelatoriosDashboardPage = lazy(() => import('@/pages/apoio/relatorios/DashboardPage'));
const ApoioDashboardPage = lazy(() => import('@/pages/apoio/relatorios/ApoioDashboardPage'));
const RelatorioComodatoPage = lazy(() => import('@/pages/apoio/relatorios/RelatorioComodatoPage'));
const RelatorioOperacionalPage = lazy(() => import('@/pages/apoio/relatorios/RelatorioOperacionalPage'));
const AlertasPage = lazy(() => import('@/pages/apoio/relatorios/AlertasPage'));
const DashboardPersonalizadoPage = lazy(() => import('@/pages/apoio/relatorios/DashboardPersonalizadoPage'));
const PersonalizadoPage = lazy(() => import('@/pages/apoio/relatorios/PersonalizadoPage'));

// Manutenção
const ManutencaoEquipamentosPage = lazy(() => import('@/pages/apoio/manutencao/ManutencaoEquipamentosPage'));

// Configurações
const ConfiguracoesLayout = lazy(() => import('@/pages/configuracoes/ConfiguracoesLayout'));
const PerfilUsuarioPage = lazy(() => import('@/pages/configuracoes/PerfilUsuarioPage'));
const SegurancaPage = lazy(() => import('@/pages/configuracoes/SegurancaPage'));
const NotificacoesGeraisPage = lazy(() => import('@/pages/configuracoes/NotificacoesGeraisPage'));
const AparenciaPage = lazy(() => import('@/pages/configuracoes/AparenciaPage'));
const IntegracoesGlobaisPage = lazy(() => import('@/pages/configuracoes/IntegracoesGlobaisPage'));
const BackupExportacaoPage = lazy(() => import('@/pages/configuracoes/BackupExportacaoPage'));
const SobreAjudaPage = lazy(() => import('@/pages/configuracoes/SobreAjudaPage'));
const PrivacidadePage = lazy(() => import('@/pages/configuracoes/PrivacidadePage'));
const FaturamentoPage = lazy(() => import('@/pages/configuracoes/FaturamentoPage'));
const LogsPage = lazy(() => import('@/pages/configuracoes/LogsPage'));
const SystemDiagnosisPage = lazy(() => import('@/pages/configuracoes/SystemDiagnosisPage'));

// Apoio Configs
const PreferenciasRelatoriosPage = lazy(() => import('@/pages/configuracoes/PreferenciasRelatoriosPage'));
const PreferenciasDashboardPage = lazy(() => import('@/pages/configuracoes/PreferenciasDashboardPage'));
const PreferenciasGeolocalizacaoPage = lazy(() => import('@/pages/configuracoes/PreferenciasGeolocalizacaoPage'));
const PreferenciasAgendaPage = lazy(() => import('@/pages/configuracoes/PreferenciasAgendaPage'));
const PreferenciasChamadosPage = lazy(() => import('@/pages/configuracoes/PreferenciasChamadosPage'));
const PreferenciasComodatoPage = lazy(() => import('@/pages/configuracoes/PreferenciasComodatoPage'));
const DadosClientesConfigPage = lazy(() => import('@/pages/configuracoes/DadosClientesPage'));
const ConfiguracoesAvancadasAPoioPage = lazy(() => import('@/pages/configuracoes/ConfiguracoesAvancadasAPoioPage'));

// Memoized fallback to prevent re-renders of the spinner container
const FullScreenLoader = memo(() => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <LoadingSpinner message="Iniciando sistema..." />
  </div>
));

function App() {
  useEffect(() => {
    // Aggressively prefetch routes after main thread is idle
    prefetchCriticalRoutes();
  }, []);

  return (
    <HelmetProvider>
      <SupabaseAuthProvider>
        <NotificationProvider>
          <FilterProvider>
            <PageActionProvider>
              {/* Global Suspense for critical auth/setup phases */}
              <Suspense fallback={<FullScreenLoader />}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/auth/confirm" element={<AuthConfirmation />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  
                  <Route path="/" element={
                    <AuthGuard>
                      <LayoutOverride>
                        {/* 
                           CRITICAL OPTIMIZATION:
                           We nest Suspense INSIDE LayoutOverride's content area.
                           This ensures the Sidebar/Header remain visible while routes load,
                           eliminating the "white screen flash" effect during navigation.
                           We also use a rich PageSkeleton instead of a spinner.
                        */}
                        <Suspense fallback={<PageSkeleton />}>
                          <Outlet />
                        </Suspense>
                      </LayoutOverride>
                    </AuthGuard>
                  }>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="ai-chat" element={<AIChat />} />
                    
                    {/* Analytics */}
                    <Route path="analitico-supervisor" element={<AnaliticoSupervisor />} />
                    <Route path="analitico-vendedor" element={<AnaliticoVendedor />} />
                    <Route path="analitico-regiao" element={<AnaliticoRegiao />} />
                    <Route path="analitico-grupo-clientes" element={<AnaliticoGrupoClientes />} />
                    <Route path="analitico-produto" element={<AnaliticoProduto />} />
                    <Route path="visao-360-cliente" element={<Visao360Cliente />} />
                    
                    {/* Commercial Analysis */}
                    <Route path="analitico-vendas-diarias" element={<AnaliticoVendasDiarias />} />
                    <Route path="analise-churn" element={<AnaliseChurn />} />
                    <Route path="curva-abc" element={<CurvaABC />} />
                    <Route path="calculo-rfm" element={<CalculoRFM />} />
                    <Route path="tendencia-vendas" element={<TendenciaVendas />} />
                    <Route path="analise-valor-unitario" element={<AnaliseValorUnitario />} />
                    <Route path="baixo-desempenho" element={<BaixoDesempenho />} />
                    <Route path="analise-fidelidade" element={<AnaliseFidelidade />} />
                    <Route path="produtos-bonificados" element={<ProdutosBonificados />} />
                    <Route path="performance-bonificados" element={<PerformanceBonificados />} />
                    <Route path="analitico-bonificados" element={<AnaliticoBonificados />} />
                    
                    {/* Equipment Analysis */}
                    <Route path="movimentacao-equipamentos" element={<MovimentacaoEquipamentos />} />
                    <Route path="analitico-equipamentos-cliente" element={<AnaliticoEquipamentosCliente />} />
                    <Route path="analitico-equipamento" element={<AnaliticoEquipamento />} />
                    <Route path="equipamentos-em-campo" element={<EquipamentosEmCampo />} />

                    {/* Managerial Analysis */}
                    <Route path="raio-x-supervisor" element={<RaioXSupervisor />} />
                    <Route path="raio-x-vendedor" element={<RaioXVendedor />} />

                    {/* Bonificações */}
                    <Route path="bonificacoes" element={<BonificacoesPage />} />
                    
                    {/* Tarefas */}
                    <Route path="tarefas" element={<Tarefas />} />
                    
                    {/* Manutenção - Redirect to new location */}
                    <Route path="manutencao" element={<Navigate to="/admin/apoio/manutencao-equipamentos" replace />} />

                    {/* Delivery Management */}
                    <Route path="admin/delivery-management" element={<DeliveryDashboard />} />
                    <Route path="admin/delivery-management/deliveries" element={<Deliveries />} />
                    <Route path="admin/delivery-management/drivers" element={<Drivers />} />
                    <Route path="admin/delivery-management/route-optimization" element={<RouteOptimization />} />
                    <Route path="admin/delivery-management/customers" element={<Customers />} />
                    <Route path="admin/delivery-management/disputes" element={<Disputes />} />
                    <Route path="admin/delivery-management/reports" element={<DeliveryReports />} />
                    <Route path="admin/delivery-management/delivery-receipts" element={<DeliveryReceipts />} />
                    <Route path="admin/delivery-management/settings" element={<DeliverySettings />} />

                    {/* CRM */}
                    <Route path="crm/pipeline" element={<Pipeline />} />
                    <Route path="crm/contacts" element={<CrmContacts />} />
                    <Route path="crm/comodato-contracts" element={<ComodatoContracts />} />
                    <Route path="crm/automations" element={<CrmAutomations />} />
                    <Route path="crm/reports" element={<CrmReports />} />
                    <Route path="crm/team" element={<CrmTeam />} />

                    {/* Gestão de Equipe (REDIRECT OLD ROUTES) */}
                    <Route path="admin/gestao-equipe/usuarios-acesso" element={<Navigate to="/configuracoes/gestao-equipe" replace />} />

                    {/* Apoio */}
                    <Route path="admin/apoio" element={<ApoioLayout />}>
                      <Route index element={<Navigate to="comodato/clientes" replace />} />
                      
                      <Route path="comodato" element={<ComodatoLayout />}>
                        <Route index element={<Navigate to="clientes" replace />} />
                        <Route path="clientes" element={<ClientesComodatoPage />} />
                        <Route path="clientes/novo" element={<ClienteComodatoForm />} />
                        <Route path="clientes/:id/editar" element={<ClienteComodatoForm />} />
                        <Route path="clientes/:id/estoque" element={<EstoqueClientePage />} />
                        <Route path="modelos" element={<ModelosEquipamentosPage />} />
                        <Route path="modelos/novo" element={<ModeloEquipamentoForm />} />
                        <Route path="modelos/:id/editar" element={<ModeloEquipamentoForm />} />
                        <Route path="equipamentos/novo" element={<EquipamentoComodatoForm />} />
                        <Route path="equipamentos/:id/editar" element={<EquipamentoComodatoForm />} />
                        <Route path="entrega" element={<EntregaForm />} />
                        <Route path="troca" element={<TrocaForm />} />
                        <Route path="retirada" element={<RetiradaForm />} />
                        {/* Fallback routes for list/details to avoid 404 */}
                        <Route path="lista" element={<Navigate to="clientes" replace />} />
                        <Route path="detalhes" element={<Navigate to="clientes" replace />} />
                      </Route>
                      
                      <Route path="chamados" element={<ChamadosLayout />}>
                          <Route index element={<Navigate to="todos" replace />} />
                          <Route path="todos" element={<ChamadosTodosPage />} />
                          {/* Sub-routes for status filters */}
                          <Route path="abertos" element={<Navigate to="todos?status=aberto" replace />} />
                          <Route path="em-andamento" element={<Navigate to="todos?status=em_andamento" replace />} />
                          <Route path="em-progresso" element={<Navigate to="todos?status=em_andamento" replace />} />
                          <Route path="resolvidos" element={<Navigate to="todos?status=resolvido" replace />} />
                          <Route path="fechados" element={<Navigate to="todos?status=fechado" replace />} />
                          
                          <Route path="novo" element={<ChamadoForm />} />
                          <Route path="motivos" element={<MotivosPage />} />
                          <Route path="motivos/novo" element={<MotivoForm />} />
                          <Route path="motivos/:id/editar" element={<MotivoForm />} />
                          <Route path="formularios" element={<FormulariosPage />} />
                          <Route path="formularios/novo" element={<FormularioForm />} />
                          <Route path="formularios/:id/editar" element={<FormularioForm />} />
                          <Route path=":id" element={<ChamadoDetalhesPage />} />
                          <Route path=":id/editar" element={<ChamadoForm />} />
                      </Route>

                      <Route path="agenda" element={<AgendaLayout />}>
                        <Route index element={<Navigate to="minha-agenda" replace />} />
                        <Route path="minha-agenda" element={<MinhaAgendaPage />} />
                        <Route path="calendario" element={<Navigate to="minha-agenda" replace />} />
                        <Route path="eventos" element={<EventosPage />} />
                        <Route path="agendamentos" element={<AgendamentosPage />} />
                        <Route path="equipe" element={<AgendaEquipePage />} />
                        <Route path="disponibilidade" element={<DisponibilidadePage />} />
                        <Route path="disponibilidade/novo" element={<DisponibilidadeForm />} />
                        <Route path="disponibilidade/:id/editar" element={<DisponibilidadeForm />} />
                        <Route path="bloqueios" element={<BloqueiosPage />} />
                        <Route path="bloqueios/novo" element={<BloqueioForm />} />
                        <Route path="bloqueios/:id/editar" element={<BloqueioForm />} />
                        <Route path="conflitos" element={<ConflitosPage />} />
                      </Route>
                      
                      <Route path="notificacoes" element={<NotificacoesLayout />}>
                        <Route index element={<Navigate to="minhas" replace />} />
                        <Route path="minhas" element={<MinhasNotificacoesPage />} />
                        <Route path="nao-lidas" element={<NaoLidasPage />} />
                        <Route path="arquivadas" element={<ArquivadasPage />} />
                        <Route path="preferencias" element={<PreferenciasPage />} />
                      </Route>

                      <Route path="geolocalizacao" element={<GeolocalizacaoLayout />}>
                        <Route index element={<Navigate to="rastreamento" replace />} />
                        <Route path="checkin-checkout" element={<CheckinCheckoutPage />} />
                        <Route path="rastreamento" element={<RastreamentoPage />} />
                        <Route path="mapa" element={<Navigate to="rastreamento" replace />} />
                        <Route path="rotas" element={<RotasPage />} />
                        <Route path="historico" element={<HistoricoPage />} />
                        <Route path="relatorios" element={<RelatoriosGeoPage />} />
                        <Route path="integracoes" element={<IntegracoesPage />} />
                        <Route path="integracoes/novo" element={<IntegracaoForm />} />
                        <Route path="integracoes/:id/editar" element={<IntegracaoForm />} />
                        <Route path="dados-clientes" element={<DadosClientesApoioPage />} />
                      </Route>
                      {/* Routes with accents */}
                      <Route path="geolocalização" element={<Navigate to="geolocalizacao" replace />} />

                      <Route path="relatorios" element={<RelatoriosLayout />}>
                        <Route index element={<Navigate to="dashboard-apoio" replace />} />
                        <Route path="dashboard" element={<RelatoriosDashboardPage />} />
                        <Route path="dashboard-apoio" element={<ApoioDashboardPage />} />
                        <Route path="geral" element={<Navigate to="dashboard-apoio" replace />} />
                        <Route path="comodato" element={<RelatorioComodatoPage />} />
                        <Route path="operacional" element={<RelatorioOperacionalPage />} />
                        <Route path="alertas" element={<AlertasPage />} />
                        <Route path="dashboard-personalizado" element={<DashboardPersonalizadoPage />} />
                        <Route path="personalizado" element={<PersonalizadoPage />} />
                      </Route>

                      {/* Personas (REDIRECT OLD ROUTES) */}
                      <Route path="personas" element={<Navigate to="/configuracoes/gestao-equipe" replace />} />

                      {/* Manutenção Equipamentos (Submodule) */}
                      <Route path="manutencao-equipamentos" element={<ManutencaoEquipamentosPage />} />
                      {/* Aliases/Redirects */}
                      <Route path="manutencao" element={<Navigate to="manutencao-equipamentos" replace />} />
                      <Route path="manutenção" element={<Navigate to="manutencao-equipamentos" replace />} />
                      <Route path="manutencao-equipamentos/preventiva" element={<ManutencaoEquipamentosPage />} />
                      <Route path="manutencao-equipamentos/corretiva" element={<ManutencaoEquipamentosPage />} />

                      {/* Configurações Redirect */}
                      <Route path="configuracoes" element={<Navigate to="/configuracoes" replace />} />

                    </Route>

                    {/* UNIFIED SETTINGS */}
                    <Route path="configuracoes" element={<ConfiguracoesLayout />}>
                      <Route index element={<Navigate to="perfil" replace />} />
                      {/* General */}
                      <Route path="perfil" element={<PerfilUsuarioPage />} />
                      <Route path="seguranca" element={<SegurancaPage />} />
                      <Route path="notificacoes" element={<NotificacoesGeraisPage />} />
                      <Route path="privacidade" element={<PrivacidadePage />} />
                      <Route path="aparencia" element={<AparenciaPage />} />
                      <Route path="integracoes" element={<IntegracoesGlobaisPage />} />
                      <Route path="faturamento" element={<FaturamentoPage />} />
                      <Route path="backup" element={<BackupExportacaoPage />} />
                      <Route path="logs" element={<LogsPage />} />
                      <Route path="sobre" element={<SobreAjudaPage />} />
                      
                      {/* Redirect old user management routes to new location */}
                      <Route path="usuarios/*" element={<Navigate to="/configuracoes/gestao-equipe" replace />} />
                      <Route path="gestao-acesso-unificada" element={<Navigate to="/configuracoes/gestao-equipe" replace />} />
                      
                      {/* NEW CENTRALIZED MODULE */}
                      <Route path="gestao-equipe" element={<CentralizedTeamManagement />} />
                      
                      {/* System Diagnosis */}
                      <Route path="diagnostico" element={<SystemDiagnosisPage />} />

                      <Route path="apoio/relatorios" element={<PreferenciasRelatoriosPage />} />
                      <Route path="apoio/dashboard" element={<PreferenciasDashboardPage />} />
                      <Route path="apoio/geolocalizacao" element={<PreferenciasGeolocalizacaoPage />} />
                      <Route path="apoio/agenda" element={<PreferenciasAgendaPage />} />
                      <Route path="apoio/chamados" element={<PreferenciasChamadosPage />} />
                      <Route path="apoio/comodato" element={<PreferenciasComodatoPage />} />
                      <Route path="apoio/dados-clientes" element={<DadosClientesConfigPage />} />
                      <Route path="apoio/avancadas" element={<ConfiguracoesAvancadasAPoioPage />} />
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
              <Toaster />
            </PageActionProvider>
          </FilterProvider>
        </NotificationProvider>
      </SupabaseAuthProvider>
    </HelmetProvider>
  );
}

export default App;
