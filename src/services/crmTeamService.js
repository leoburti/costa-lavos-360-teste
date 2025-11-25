
import { supabase } from '@/lib/customSupabaseClient';

export const crmTeamService = {
  // --- GOALS ---
  async getGoals(userId) {
    let query = supabase.from('team_goals').select('*').order('end_date', { ascending: true });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createGoal(goalData) {
    const { data, error } = await supabase.from('team_goals').insert([goalData]).select();
    if (error) throw error;
    return data;
  },

  async updateGoalProgress(goalId, currentValue) {
    const { data, error } = await supabase
      .from('team_goals')
      .update({ current_value: currentValue })
      .eq('id', goalId)
      .select();
    if (error) throw error;
    return data;
  },

  // --- ACTIVITIES ---
  async getActivities(filters = {}) {
    let query = supabase.from('team_activities').select('*').order('created_at', { ascending: false });
    
    if (filters.user_id) query = query.eq('user_id', filters.user_id);
    if (filters.status) query = query.eq('status', filters.status);
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createActivity(activityData) {
    const { data, error } = await supabase.from('team_activities').insert([activityData]).select();
    if (error) throw error;
    return data;
  },

  async completeActivity(activityId) {
    const { data, error } = await supabase
      .from('team_activities')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', activityId)
      .select();
    if (error) throw error;
    return data;
  },

  // --- GAMIFICATION ---
  async getLeaderboard() {
    // Fetch users and their gamification stats
    const { data: stats, error } = await supabase
      .from('team_gamification')
      .select(`
        *,
        users:user_id (
          raw_user_meta_data
        )
      `)
      .order('total_points', { ascending: false })
      .limit(10);

    if (error) throw error;
    
    // Map to friendly format
    return stats.map(stat => ({
      id: stat.user_id,
      name: stat.users?.raw_user_meta_data?.full_name || 'Usuário',
      points: stat.total_points,
      level: stat.current_level,
      avatar: stat.users?.raw_user_meta_data?.avatar_url
    }));
  },

  async getUserBadges(userId) {
    const { data, error } = await supabase
      .from('team_user_achievements')
      .select(`
        *,
        achievement:achievement_id (*)
      `)
      .eq('user_id', userId);
      
    if (error) throw error;
    return data.map(d => d.achievement);
  },
  
  async getAllBadges() {
      const { data, error } = await supabase.from('team_achievements').select('*');
      if(error) throw error;
      return data;
  }
};
