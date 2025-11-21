import { supabase } from '@/lib/customSupabaseClient';

export const apoioRelatoriosService = {
  async getDashboardKPIs(dataInicio, dataFim) {
    const { data, error } = await supabase.rpc('get_apoio_dashboard_kpis', {
      p_data_inicio: dataInicio,
      p_data_fim: dataFim
    });
    if (error) throw error;
    return data;
  },

  async getChamadosAnalitico(dataInicio, dataFim) {
    const { data, error } = await supabase.rpc('get_apoio_chamados_analitico', {
      p_data_inicio: dataInicio,
      p_data_fim: dataFim
    });
    if (error) throw error;
    return data;
  },

  async getTecnicosPerformance(dataInicio, dataFim) {
    const { data, error } = await supabase.rpc('get_apoio_tecnicos_performance', {
      p_data_inicio: dataInicio,
      p_data_fim: dataFim
    });
    if (error) throw error;
    return data;
  },

  async getEquipamentosStats(dataInicio, dataFim) {
    const { data, error } = await supabase.rpc('get_apoio_equipamentos_stats', {
      p_data_inicio: dataInicio,
      p_data_fim: dataFim
    });
    if (error) throw error;
    return data;
  },

  async getDashboardsPersonalizados() {
    const { data, error } = await supabase
      .from('apoio_dashboards_personalizados')
      .select('*')
      .order('data_criacao', { ascending: false });
    if (error) throw error;
    return data;
  },

  async salvarDashboardPersonalizado(nome, widgets) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('apoio_dashboards_personalizados')
      .insert([{ 
        nome_dashboard: nome, 
        widgets: widgets,
        usuario_id: userData.user.id
      }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async deletarDashboardPersonalizado(id) {
    const { error } = await supabase
      .from('apoio_dashboards_personalizados')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
};