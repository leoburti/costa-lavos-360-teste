/**
 * Mapeamento completo dos arquivos que utilizam dados MOCK e suas respectivas RPC Functions reais.
 * Este arquivo serve como guia para a migração do frontend.
 */
export const RPC_MIGRATION_MAP = [
  {
    module: "Analytics (Geral)",
    files: [
      {
        path: "src/pages/AnalisePreditivaVendas.jsx", // Consolidated Page
        component: "AnalisePreditivaVendas",
        status: "LIVE_DATA",
        rpc: "get_churn_analysis_data_v3, get_rfm_analysis, get_new_client_trends",
        params: "p_start_date, p_end_date, filters...",
        description: "Página consolidada para análises preditivas: Churn, RFM e Tendências."
      },
      {
        path: "src/pages/CurvaABC.jsx",
        component: "CurvaABC",
        status: "LIVE_DATA",
        rpc: "get_projected_abc_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Classificação ABC de clientes baseada em receita projetada."
      },
      {
        path: "src/pages/AnaliseValorUnitario.jsx",
        component: "AnaliseValorUnitario",
        status: "LIVE_DATA",
        rpc: "get_price_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Variação de preço médio e unitário por produto."
      },
      {
        path: "src/pages/AnaliseDesempenhoFidelidade.jsx", // Consolidated Page
        component: "AnaliseDesempenhoFidelidade",
        status: "LIVE_DATA",
        rpc: "get_low_performance_clients, get_loyalty_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Página consolidada para análise de clientes de baixo desempenho e fidelidade."
      }
    ]
  },
  {
    module: "Bonificações",
    files: [
      {
        path: "src/pages/bonificacoes/AnaliseBonificacaoPage.jsx",
        component: "AnaliseBonificacaoPage",
        status: "LIVE_DATA",
        rpc: "get_bonification_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Visão geral de produtos bonificados."
      },
      {
        path: "src/components/bonificacoes/BonificationPerformanceExplorer.jsx",
        component: "BonificationPerformanceExplorer",
        status: "LIVE_DATA",
        rpc: "get_bonification_performance",
        params: "p_start_date, p_end_date, filters...",
        description: "Performance percentual de bonificação por vendedor/supervisor."
      },
      {
        path: "src/components/bonificacoes/BonificationDistributionExplorer.jsx",
        component: "BonificationDistributionExplorer",
        status: "LIVE_DATA",
        rpc: "get_analytical_bonification",
        params: "p_start_date, p_end_date, filters...",
        description: "Detalhamento profundo das bonificações concedidas."
      }
    ]
  },
  {
    module: "Equipamentos",
    files: [
      {
        path: "src/pages/MovimentacaoEquipamentos.jsx",
        component: "MovimentacaoEquipamentos",
        status: "LIVE_DATA",
        rpc: "get_equipment_movement",
        params: "p_start_date, p_end_date, filters...",
        description: "Fluxo de entrada e saída de equipamentos (instalação/retirada)."
      },
      {
        path: "src/pages/AnaliticoEquipamentosCliente.jsx",
        component: "AnaliticoEquipamentosCliente",
        status: "LIVE_DATA",
        rpc: "get_equipment_by_client",
        params: "p_start_date, p_end_date, grouping_level='client'",
        description: "Inventário e performance de equipamentos por cliente."
      },
      {
        path: "src/pages/AnaliticoEquipamento.jsx",
        component: "AnaliticoEquipamento",
        status: "LIVE_DATA",
        rpc: "get_detailed_equipment_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Análise detalhada por tipo de equipamento."
      },
      {
        path: "src/pages/EquipamentosEmCampo.jsx",
        component: "EquipamentosEmCampo",
        status: "LIVE_DATA",
        rpc: "get_client_equipments",
        params: "p_cliente_id",
        description: "Lista geral de equipamentos ativos em clientes."
      }
    ]
  },
  {
    module: "Visão Analítica (Drilldown)",
    files: [
      {
        path: "src/pages/AnaliticoSupervisor.jsx",
        component: "AnaliticoSupervisor",
        status: "LIVE_DATA",
        rpc: "get_supervisor_analytical_data",
        params: "p_start_date, p_end_date, p_supervisor_name",
        description: "Dashboard específico para um supervisor."
      },
      {
        path: "src/pages/AnaliticoVendedor.jsx",
        component: "AnaliticoVendedor",
        status: "LIVE_DATA",
        rpc: "get_seller_analytical_data",
        params: "p_start_date, p_end_date, p_seller_name",
        description: "Dashboard específico para um vendedor."
      },
      {
        path: "src/pages/AnaliticoRegiao.jsx",
        component: "AnaliticoRegiao",
        status: "LIVE_DATA",
        rpc: "get_regional_summary_v2, get_drilldown_data",
        params: "p_start_date, p_end_date, filters...",
        description: "Análise geográfica de vendas com drilldown."
      },
      {
        path: "src/pages/AnaliticoGrupoClientes.jsx",
        component: "AnaliticoGrupoClientes",
        status: "LIVE_DATA",
        rpc: "get_group_360_analysis, get_group_sales_analysis",
        params: "p_group_name",
        description: "Performance consolidada de redes/grupos."
      },
      {
        path: "src/pages/AnaliseProdutos.jsx", // Updated path
        component: "AnaliseProdutos",
        status: "LIVE_DATA",
        rpc: "get_product_basket_analysis_v2, get_product_mix_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Mix de produtos e cesta de compras."
      }
    ]
  },
  {
    module: "Gerencial (Raio-X)",
    files: [
      {
        path: "src/pages/RaioXSupervisor.jsx",
        component: "RaioXSupervisor",
        status: "LIVE_DATA",
        rpc: "get_supervisor_one_on_one_data",
        params: "p_start_date, p_end_date, p_supervisor_name",
        description: "Relatório detalhado para reuniões One-on-One com supervisores."
      },
      {
        path: "src/pages/RaioXVendedor.jsx",
        component: "RaioXVendedor",
        status: "LIVE_DATA",
        rpc: "get_seller_analytical_data",
        params: "p_start_date, p_end_date, p_seller_name",
        description: "Relatório detalhado de performance individual do vendedor."
      },
      {
        path: "src/pages/Visao360Cliente.jsx",
        component: "Visao360Cliente",
        status: "LIVE_DATA",
        rpc: "get_client_360_data_v2",
        params: "p_target_client_code, p_target_store",
        description: "Ficha completa do cliente (KPIs, histórico, equipamentos)."
      }
    ]
  }
];