
import { supabase } from '@/lib/customSupabaseClient';

/**
 * Service to interact with AI related features via Supabase Edge Functions.
 */

export const aiService = {
  /**
   * Calls the predictive-analysis edge function.
   * @param {Object} params - The parameters for prediction.
   * @param {Object} params.context - Contextual information (e.g., client info).
   * @param {Array} params.data - The dataset to analyze (e.g., sales history).
   * @param {string} params.analysisType - Type of analysis (e.g., 'sales_forecast', 'churn_risk').
   * @returns {Promise<Object>} - The AI prediction result.
   */
  async getPrediction({ context, data, analysisType = 'general' }) {
    try {
      const { data: result, error } = await supabase.functions.invoke('predictive-analysis', {
        body: JSON.stringify({ context, data, analysisType })
      });

      if (error) {
        console.error('Supabase Edge Function Error:', error);
        // Return a safe fallback structure instead of throwing immediately to prevent UI crashes
        return {
          prediction: "Serviço de análise temporariamente indisponível.",
          trend: "stable",
          confidence: 0,
          insights: [],
          recommendations: [],
          error: error.message
        };
      }

      return result;
    } catch (err) {
      console.error('AI Service Exception:', err);
      throw err;
    }
  },

  /**
   * Generic method to generate insights (Legacy wrapper)
   */
  async generateInsight(prompt, context) {
    return this.getPrediction({ 
      context, 
      data: { prompt }, 
      analysisType: 'custom_insight' 
    });
  }
};

// Named export for compatibility with some imports
export async function fetchPredictiveAnalysis(payload) {
  return aiService.getPrediction(payload);
}
