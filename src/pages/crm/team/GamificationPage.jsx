import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LeaderBoard from '@/components/crm/team/LeaderBoard';
import AchievementBadge from '@/components/crm/team/AchievementBadge';
import { crmTeamService } from '@/services/crmTeamService';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Trophy, Star } from 'lucide-react';

const GamificationPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [badges, setBadges] = useState([]);
    const [allBadges, setAllBadges] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [lbData, userBadgesData, allBadgesData] = await Promise.all([
                    crmTeamService.getLeaderboard(),
                    crmTeamService.getUserBadges(user?.id),
                    crmTeamService.getAllBadges()
                ]);
                setLeaderboard(lbData);
                setBadges(userBadgesData);
                setAllBadges(allBadgesData);
            } catch (error) {
                console.error("Failed to load gamification data", error);
            }
        };
        if (user) loadData();
    }, [user]);

    const myStats = leaderboard.find(u => u.id === user?.id) || { points: 0, level: 1 };

    return (
        <div className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-8 space-y-6">
                {/* My Stats Banner */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium opacity-90">Meu Progresso</h3>
                            <div className="mt-2 flex items-baseline gap-3">
                                <span className="text-4xl font-bold">{myStats.points}</span>
                                <span className="text-sm opacity-80 font-medium uppercase tracking-wide">Pontos Totais</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center justify-center p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Trophy className="h-8 w-8 text-yellow-300" />
                            </div>
                            <p className="mt-1 font-bold">Nível {myStats.level}</p>
                        </div>
                    </div>
                    <div className="mt-6 bg-black/20 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-yellow-400 h-full transition-all duration-1000" 
                            style={{ width: `${(myStats.points % 1000) / 10}%` }} 
                        />
                    </div>
                    <p className="text-xs mt-2 opacity-70 text-right">Próximo nível em {1000 - (myStats.points % 1000)} pontos</p>
                </div>

                {/* Badges Grid */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-amber-500" />
                            Minhas Conquistas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {allBadges.map(badge => {
                                const earned = badges.some(b => b.id === badge.id);
                                return (
                                    <AchievementBadge 
                                        key={badge.id}
                                        {...badge}
                                        earned={earned}
                                    />
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-4">
                <LeaderBoard users={leaderboard} />
            </div>
        </div>
    );
};

export default GamificationPage;