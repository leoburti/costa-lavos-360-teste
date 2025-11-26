
import { supabase } from '@/lib/customSupabaseClient';

export const crmTeamService = {
  async getLeaderboard() {
    // Use the new RPC for better performance and to avoid relationship issues
    const { data, error } = await supabase.rpc('get_leaderboard', { limit_count: 10 });
    
    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
    
    // Map to expected format if necessary
    return data.map(item => ({
      id: item.id,
      name: item.full_name || 'Usuário',
      points: item.total_points,
      level: item.current_level,
      avatar: item.avatar_url
    }));
  },

  async getUserBadges(userId) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('team_user_achievements')
      .select('*, achievement:team_achievements(*)')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching user badges:', error);
      return [];
    }
    
    return data.map(item => ({
      ...item.achievement,
      earnedAt: item.earned_at
    }));
  },

  async getAllBadges() {
    const { data, error } = await supabase
      .from('team_achievements')
      .select('*')
      .order('required_points', { ascending: true });
      
    if (error) {
      console.error('Error fetching badges:', error);
      return [];
    }
    
    return data;
  }
};
