import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Helper to format currency and numbers for the prompt
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const formatNumber = (value) => new Intl.NumberFormat('pt-BR').format(value || 0);

// Function to generate a detailed, structured prompt
const generatePrompt = (analysisType, dataContext, companyContext) => {
  const {
    totalRevenue,
    activeClients,
    salesCount,
    averageTicket,
    totalBonification,
    dailyRevenues,
    topProducts,
    salesByRegion,
    topSupervisors,
    topSellers,
  } = dataContext;

  let prompt = `
    Você é o "Senhor Lavos", um especialista em análise de dados comerciais para a empresa ${companyContext}. Sua personalidade é formal, analítica e direta ao ponto.
    Sua tarefa é analisar os seguintes dados de vendas e fornecer um insight acionável em UM parágrafo conciso.
    Use markdown simples para formatação (negrito com **texto**). Não use cabeçalhos (#).

    **Contexto da Empresa:** ${companyContext}.

    **Dados para Análise (${analysisType}):**
    - **Receita Total:** ${formatCurrency(totalRevenue)}
    - **Clientes Ativos:** ${formatNumber(activeClients)}
    - **Número de Vendas:** ${formatNumber(salesCount)}
    - **Ticket Médio:** ${formatCurrency(averageTicket)}
    - **Total em Bonificações:** ${formatCurrency(totalBonification)}
  `;

  if (topProducts && topProducts.length > 0) {
    prompt += `\n- **Top 5 Produtos:** ${topProducts.slice(0, 5).map(p => `${p.name} (${formatCurrency(p.total_revenue)})`).join(', ')}.`;
  }
  if (salesByRegion && salesByRegion.length > 0) {
    prompt += `\n- **Top 3 Regiões:** ${salesByRegion.slice(0, 3).map(r => `${r.name} (${formatCurrency(r.total_revenue)})`).join(', ')}.`;
  }
  if (topSupervisors && topSupervisors.length > 0) {
    prompt += `\n- **Supervisor Destaque:** ${topSupervisors[0].name} com ${formatCurrency(topSupervisors[0].total_revenue)}.`;
  }
  if (topSellers && topSellers.length > 0) {
    prompt += `\n- **Vendedor Destaque:** ${topSellers[0].name} com ${formatCurrency(topSellers[0].total_revenue)}.`;
  }

  prompt += `

    **Instrução:** Com base nos dados, gere um insight estratégico e prático. Foque em uma única recomendação clara (ex: "focar em aumentar o ticket médio", "expandir na região X", "replicar a estratégia do vendedor Y").
    **Exemplo de Resposta:** "Com uma receita de ${formatCurrency(150000)} e um ticket médio de ${formatCurrency(850)}, a performance é sólida. **Ação recomendada:** Focar em estratégias de cross-selling para os ${formatNumber(50)} clientes da região de ${salesByRegion?.[0]?.name || 'SP'} para elevar o ticket médio, potencializando a base de clientes já ativa."
  `;

  return prompt;
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    // 2. Get request body
    const { analysisType, dataContext } = await req.json();
    if (!analysisType || !dataContext) {
      throw new Error('Missing analysisType or dataContext in request body');
    }

    // 3. Get API Key and Company Context from environment variables
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const COMPANY_CONTEXT = Deno.env.get("COMPANY_CONTEXT") || "Costa Lavos";
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }

    // 4. Generate the prompt
    const prompt = generatePrompt(analysisType, dataContext, COMPANY_CONTEXT);

    // 5. Call Google Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const insightText = response.text();

    // 6. Return the successful response
    return new Response(JSON.stringify({ insight: insightText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // 7. Handle errors
    console.error('Edge Function Error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});