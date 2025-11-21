const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(value || 0);

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateDashboardInsight = (dataContext) => {
    const {
        totalRevenue,
        projectedRevenue,
        activeClients,
        averageTicket,
        totalBonification,
        topSupervisors,
        topSellers
    } = dataContext;

    if (!totalRevenue && !activeClients) return "Não há dados suficientes para gerar uma análise. Verifique os filtros.";

    const insights = [];
    const actions = [];

    // Revenue Analysis
    if (totalRevenue > 100000) {
        insights.push(`A receita de **${formatCurrency(totalRevenue)}** é um marco excelente.`);
        if(projectedRevenue > totalRevenue) {
            actions.push(`A projeção de ${formatCurrency(projectedRevenue)} indica um fechamento de mês forte. Continue o bom trabalho!`);
        }
    } else if (totalRevenue > 20000) {
        insights.push(`Com uma receita de **${formatCurrency(totalRevenue)}**, a performance é sólida.`);
        actions.push(`Foco em aumentar o ticket médio pode acelerar o crescimento.`);
    }

    // Active Clients Analysis
    if (activeClients > 100) {
        insights.push(`Ativar **${formatNumber(activeClients)} clientes** demonstra um ótimo alcance de mercado.`);
        actions.push(`Manter o engajamento desses clientes é crucial. Crie campanhas de fidelização.`);
    } else if (activeClients < 20 && activeClients > 0) {
        insights.push(`O número de **${formatNumber(activeClients)} clientes ativos** é um ponto de atenção.`);
        actions.push(`Estratégias para reativar clientes antigos podem ser eficazes.`);
    }

    // Average Ticket Analysis
    if (averageTicket > 1500) {
        insights.push(`O ticket médio de **${formatCurrency(averageTicket)}** é impressionante e indica vendas de alto valor.`);
        actions.push(`Explore oportunidades de cross-selling para aumentar ainda mais.`);
    } else if (averageTicket < 500 && averageTicket > 0) {
        insights.push(`O ticket médio de **${formatCurrency(averageTicket)}** sugere uma oportunidade.`);
        actions.push(`Incentive a compra de mix de produtos para elevá-lo.`);
    }

    // Bonification Analysis
    if (totalBonification > 0 && totalRevenue > 0) {
        const bonificationPercentage = (totalBonification / totalRevenue) * 100;
        if (bonificationPercentage > 10) {
             insights.push(`O total bonificado de **${formatCurrency(totalBonification)}** representa mais de 10% da receita.`);
             actions.push(`É importante analisar o ROI dessa estratégia para garantir sua sustentabilidade.`);
        }
    }

    // Supervisor/Seller Analysis
    if (topSupervisors && topSupervisors.length > 0) {
        const topSupervisor = topSupervisors[0];
        insights.push(`O supervisor **${topSupervisor.name}** lidera com **${formatCurrency(topSupervisor.total_revenue)}**.`);
        actions.push(`Suas estratégias devem ser analisadas e compartilhadas com a equipe.`);
    }
    if (topSellers && topSellers.length > 0) {
        const topSeller = topSellers[0];
        insights.push(`O vendedor **${topSeller.name}** se destaca com **${formatCurrency(topSeller.total_revenue)}**.`);
        actions.push(`Reconhecer seu desempenho pode motivar toda a equipe.`);
    }

    if (insights.length === 0) {
        return "Analise os KPIs para extrair insights. O faturamento, clientes ativos e ticket médio são bons pontos de partida.";
    }

    // Combine one insight with one action
    const randomInsight = getRandomItem(insights);
    const randomAction = getRandomItem(actions);

    return `${randomInsight}\n\n**Ação Sugerida:** ${randomAction || 'Continue monitorando os KPIs para identificar novas oportunidades.'}`;
};

const generateChurnInsight = (dataContext) => {
    const { kpis } = dataContext;
    if (!kpis) return "Dados de churn insuficientes para análise.";

    const insights = [];
    const totalClients = (kpis.phase1Count || 0) + (kpis.phase2Count || 0) + (kpis.phase3Count || 0) + (kpis.phase4Count || 0);
    if(totalClients === 0) return "Não há clientes para analisar o churn no período selecionado."

    if (kpis.phase4Count > totalClients * 0.1) {
        insights.push(`A fase crítica (Churn) com **${kpis.phase4Count} clientes** representa um alerta. É vital entender os motivos da perda para reverter a tendência.`);
    }
    if (kpis.phase2Count > kpis.phase3Count) {
        insights.push(`Há mais clientes na fase de 'Risco' (**${kpis.phase2Count}**) do que em 'Risco Elevado' (${kpis.phase3Count}). Ações proativas agora podem prevenir que avancem para o churn.`);
    }
    if (kpis.phase4Loss > 10000) {
        insights.push(`A perda potencial na fase de Churn é de **${formatCurrency(kpis.phase4Loss)}**. Recuperar uma fração desses clientes poderia ter um impacto significativo na receita.`);
    }
    if (kpis.phase1Count > totalClients * 0.7) {
        insights.push(`Com **${kpis.phase1Count} clientes** na fase 'Ativo', a base de clientes parece saudável. O foco deve ser em manter a satisfação e a frequência de compra.`);
    }

    if (insights.length === 0) {
        return "A distribuição de clientes nas fases de churn está equilibrada. Monitore a fase de 'Risco' para ações preventivas.";
    }

    return getRandomItem(insights);
};

const generateRegionalInsight = (dataContext) => {
    const { regionalSales } = dataContext;
    if (!regionalSales || regionalSales.length === 0) return "Sem dados de vendas regionais para análise.";

    const insights = [];
    const topRegion = regionalSales[0];
    const bottomRegion = regionalSales[regionalSales.length - 1];

    if (regionalSales.length > 1) {
        const topRegionSales = topRegion.sales || topRegion.value;
        const secondRegionSales = regionalSales[1].sales || regionalSales[1].value;
        if (topRegionSales > secondRegionSales * 2) {
            insights.push(`A região **${topRegion.name}** domina as vendas com **${formatCurrency(topRegionSales)}**, mais que o dobro da segunda colocada. Há potencial para replicar essa estratégia em outras áreas.`);
        }
    }

    insights.push(`A região de **${topRegion.name}** é o principal motor de receita, com **${formatCurrency(topRegion.sales || topRegion.value)}**. Fortalecer a presença nesta área é estratégico.`);
    
    if (regionalSales.length > 2 && topRegion.name !== bottomRegion.name) {
        insights.push(`Enquanto ${topRegion.name} lidera, a região de **${bottomRegion.name}** apresenta a menor performance com ${formatCurrency(bottomRegion.sales || bottomRegion.value)}. Uma análise de mercado local pode revelar oportunidades de crescimento.`);
    }

    return getRandomItem(insights);
};

const analysisMap = {
    'dashboard_overview': generateDashboardInsight,
    'churn_analysis': generateChurnInsight,
    'regional_analysis': generateRegionalInsight,
};

export const generateClientSideInsight = (analysisType, dataContext) => {
    const generator = analysisMap[analysisType];
    if (generator && dataContext) {
        try {
            return generator(dataContext);
        } catch (e) {
            console.error("Error generating client-side insight:", e);
        }
    }
    
    // Generic Fallback
    const revenue = dataContext?.totalRevenue || dataContext?.total_revenue || 0;
    const clients = dataContext?.activeClients || dataContext?.client_count || 0;
    if (revenue > 0 || clients > 0) {
        return `Com uma receita de **${formatCurrency(revenue)}** e **${formatNumber(clients)} clientes** ativos, a operação demonstra saúde. O ticket médio de ${formatCurrency(revenue / (clients || 1))} é um indicador chave a ser monitorado.`;
    }
    
    return "Análise de IA não configurada para esta página. Observe os principais indicadores para obter insights.";
};