import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Crown } from 'lucide-react';

const RankIcon = ({ rank }) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400 fill-slate-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-700 fill-amber-700" />;
  return <span className="font-bold text-slate-500 w-5 text-center">{rank}</span>;
};

const LeaderBoard = ({ users = [] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Ranking da Equipe
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {users.map((user, index) => (
            <div key={user.id} className="flex items-center p-4 hover:bg-slate-50 transition-colors">
              <div className="mr-4 flex items-center justify-center w-8">
                <RankIcon rank={index + 1} />
              </div>
              
              <Avatar className="h-10 w-10 mr-3 border-2 border-white shadow-sm">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
                <p className="text-xs text-slate-500">Nível {user.level}</p>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{user.points}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Pontos</p>
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nenhum dado de ranking disponível.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LeaderBoard;