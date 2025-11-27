/**
 * Mapeamento completo dos arquivos que utilizam dados MOCK e suas respectivas RPC Functions reais.
 * Este arquivo serve como guia para a migração do frontend.
 */
export const RPC_MIGRATION_MAP = [
  {
    module: "Analytics (Geral)",
    files: [
      {
        path: "src/pages/AnaliseChurn.jsx",
        component: "AnaliseChurn",
        status: "MOCK_DATA",
        rpc: "get_churn_analysis_data_v3",
        params: "p_start_date, p_end_date, filters...",
        description: "Análise de clientes em risco, perdidos e retidos."
      },
      {
        path: "src/pages/CurvaABC.jsx",
        component: "CurvaABC",
        status: "MOCK_DATA",
        rpc: "get_projected_abc_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Classificação ABC de clientes baseada em receita projetada."
      },
      {
        path: "src/pages/CalculoRFM.jsx",
        component: "CalculoRFM",
        status: "MOCK_DATA",
        rpc: "get_rfm_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Segmentação Recência, Frequência e Monetaridade."
      },
      {
        path: "src/pages/AnaliseValorUnitario.jsx",
        component: "AnaliseValorUnitario",
        status: "MOCK_DATA",
        rpc: "get_price_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Variação de preço médio e unitário por produto."
      },
      {
        path: "src/pages/TendenciaVendas.jsx",
        component: "TendenciaVendas",
        status: "MOCK_DATA",
        rpc: "get_performance_summary", // Ou get_new_client_trends dependendo do foco
        params: "p_start_date, p_end_date, filters...",
        description: "Comparativo de tendências entre períodos."
      },
      {
        path: "src/pages/BaixoDesempenho.jsx",
        component: "BaixoDesempenho",
        status: "MOCK_DATA",
        rpc: "get_low_performance_clients",
        params: "p_start_date, p_end_date, filters...",
        description: "Clientes com faturamento abaixo do esperado."
      },
      {
        path: "src/pages/AnaliseFidelidade.jsx",
        component: "AnaliseFidelidade",
        status: "MOCK_DATA",
        rpc: "get_loyalty_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Análise de fidelidade baseada em metas de KG/Dia."
      }
    ]
  },
  {
    module: "Bonificações",
    files: [
      {
        path: "src/pages/ProdutosBonificados.jsx",
        component: "ProdutosBonificados",
        status: "MOCK_DATA",
        rpc: "get_bonification_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Visão geral de produtos bonificados."
      },
      {
        path: "src/pages/PerformanceBonificados.jsx",
        component: "PerformanceBonificados",
        status: "MOCK_DATA",
        rpc: "get_bonification_performance",
        params: "p_start_date, p_end_date, filters...",
        description: "Performance percentual de bonificação por vendedor/supervisor."
      },
      {
        path: "src/pages/AnaliticoBonificados.jsx",
        component: "AnaliticoBonificados",
        status: "MOCK_DATA",
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
        status: "MOCK_DATA",
        rpc: "get_equipment_movement",
        params: "p_start_date, p_end_date, filters...",
        description: "Fluxo de entrada e saída de equipamentos (instalação/retirada)."
      },
      {
        path: "src/pages/AnaliticoEquipamentosCliente.jsx",
        component: "AnaliticoEquipamentosCliente",
        status: "MOCK_DATA",
        rpc: "get_equipment_by_client",
        params: "p_start_date, p_end_date, grouping_level='client'",
        description: "Inventário e performance de equipamentos por cliente."
      },
      {
        path: "src/pages/AnaliticoEquipamento.jsx",
        component: "AnaliticoEquipamento",
        status: "MOCK_DATA",
        rpc: "get_detailed_equipment_analysis",
        params: "p_start_date, p_end_date, filters...",
        description: "Análise detalhada por tipo de equipamento."
      },
      {
        path: "src/pages/EquipamentosEmCampo.jsx",
        component: "EquipamentosEmCampo",
        status: "MOCK_DATA",
        rpc: "get_client_equipments", // ou get_equipment_by_client
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
        status: "MOCK_DATA",
        rpc: "get_supervisor_analytical_data",
        params: "p_start_date, p_end_date, p_supervisor_name",
        description: "Dashboard específico para um supervisor."
      },
      {
        path: "src/pages/AnaliticoVendedor.jsx",
        component: "AnaliticoVendedor",
        status: "MOCK_DATA",
        rpc: "get_seller_analytical_data",
        params: "p_start_date, p_end_date, p_seller_name",
        description: "Dashboard específico para um vendedor."
      },
      {
        path: "src/pages/AnaliticoRegiao.jsx",
        component: "AnaliticoRegiao",
        status: "MOCK_DATA",
        rpc: "get_regional_summary_v2", // e get_regional_details
        params: "p_start_date, p_end_date, filters...",
        description: "Análise geográfica de vendas."
      },
      {
        path: "src/pages/AnaliticoGrupoClientes.jsx",
        component: "AnaliticoGrupoClientes",
        status: "MOCK_DATA",
        rpc: "get_group_360_analysis", // ou get_group_sales_analysis
        params: "p_group_name",
        description: "Performance consolidada de redes/grupos."
      },
      {
        path: "src/pages/AnaliticoProduto.jsx",
        component: "AnaliticoProduto",
        status: "MOCK_DATA",
        rpc: "get_product_basket_analysis_v2", // e get_product_mix_analysis
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
        status: "MOCK_DATA",
        rpc: "get_supervisor_one_on_one_data",
        params: "p_start_date, p_end_date, p_supervisor_name",
        description: "Relatório detalhado para reuniões One-on-One com supervisores."
      },
      {
        path: "src/pages/RaioXVendedor.jsx",
        component: "RaioXVendedor",
        status: "MOCK_DATA",
        rpc: "get_seller_analytical_data",
        params: "p_start_date, p_end_date, p_seller_name",
        description: "Relatório detalhado de performance individual do vendedor."
      },
      {
        path: "src/pages/Visao360Cliente.jsx",
        component: "Visao360Cliente",
        status: "MOCK_DATA",
        rpc: "get_client_360_data_v2",
        params: "p_target_client_code, p_target_store",
        description: "Ficha completa do cliente (KPIs, histórico, equipamentos)."
      }
    ]
  }
];