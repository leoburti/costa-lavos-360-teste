import { corsHeaders } from "./cors.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.33.0/mod.ts";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY_BACKEND"),
});

const companyContext = Deno.env.get("COMPANY_CONTEXT") || "A Costa Lavos é uma distribuidora de produtos de limpeza e higiene.";

const analysisPrompts = {
  dashboard_overview: (data) => `
    Você é o "Senhor Lavos", um especialista em análise de dados de vendas para a empresa Costa Lavos.
    Seu tom é profissional, direto e focado em insights acionáveis.
    Analise os seguintes dados de vendas do período e forneça um resumo conciso (máximo de 3 parágrafos).

    **Contexto da Empresa:** ${companyContext}

    **Dados do Período:**
    - Receita Líquida: R$ ${data.netSales?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || data.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
    - Clientes Ativos: ${data.activeClients || 0}
    - Vendas Realizadas: ${data.salesCount || 0}
    - Ticket Médio: R$ ${data.averageTicket?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
    - Receita Projetada para o Mês: R$ ${data.projectedRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
    - Total Bonificado: R$ ${data.totalBonification?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'}
    - Top 5 Vendedores: ${data.topSellers?.map(s => `${s.name} (R$ ${s.total_revenue?.toLocaleString('pt-BR')})`).join(', ') || 'N/A'}
    - Top 5 Produtos: ${data.topProducts?.map(p => p.name).join(', ') || 'N/A'}

    **Sua Tarefa:**
    1.  Comece com uma saudação ("Olá, [Nome do Usuário]!"). Se o nome não for fornecido, use "Olá!".
    2.  Destaque o principal indicador de desempenho (positivo ou negativo).
    3.  Identifique uma oportunidade clara ou um ponto de atenção crítico.
    4.  Finalize com uma recomendação estratégica curta e direta.
    5.  Use markdown para formatar, como **negrito** para valores e nomes importantes.
  `,
  default: (data) => `
    Você é o "Senhor Lavos", um especialista em análise de dados.
    Analise os dados a seguir e forneça um resumo executivo.
    Dados: ${JSON.stringify(data, null, 2)}
  `
};

Deno.serve(async (req) => {
  console.log("[Edge Function] 1. Received request.");

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("[Edge Function] 2. Payload received:", JSON.stringify(body, null, 2));

    const { analysis_type, data_context, user_context } = body;

    // --- Robust Validation ---
    console.log("[Edge Function] 3. Starting validation.");

    if (!data_context) {
      console.error("[Edge Function] Validation FAILED: data_context is missing.");
      return new Response(JSON.stringify({ error: "Dados para análise insuficientes: data_context ausente." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check for either netSales or totalRevenue, and ensure it's a positive number.
    const revenue = data_context.netSales || data_context.totalRevenue;
    console.log(`[Edge Function] 3.1. Validating revenue. Found value: ${revenue}`);

    if (revenue === undefined || revenue === null || revenue <= 0) {
      console.error(`[Edge Function] Validation FAILED: Revenue is insufficient. Value: ${revenue}`);
      return new Response(JSON.stringify({ error: "Dados para análise insuficientes: Receita zerada ou ausente." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("[Edge Function] 4. Validation successful.");

    const promptGenerator = analysisPrompts[analysis_type] || analysisPrompts.default;
    const prompt = promptGenerator(data_context);
    
    const userName = user_context?.fullName?.split(' ')[0] || '';
    const finalPrompt = `Olá, ${userName}!\n${prompt}`;

    console.log("[Edge Function] 5. Sending request to OpenAI.");
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: "user", content: finalPrompt }],
      model: "gpt-4-turbo",
      temperature: 0.3,
    });

    const analysis_result = chatCompletion.choices[0].message.content;
    console.log("[Edge Function] 6. OpenAI response received successfully.");

    return new Response(JSON.stringify({ analysis_result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Edge Function] 7. An error occurred:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});