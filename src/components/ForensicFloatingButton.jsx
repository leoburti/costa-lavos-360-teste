import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const ForensicFloatingButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // List of paths where the button should NOT appear
  const hiddenPaths = [
    '/login', 
    '/auth/confirm', 
    '/forgot-password', 
    '/update-password', 
    '/unauthorized',
    '/configuracoes/diagnostico-forense' // Hide if already on the page
  ];

  // Check if current path starts with any hidden path (simple check)
  const isHidden = !user || hiddenPaths.some(path => location.pathname.startsWith(path));

  if (isHidden) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="fixed bottom-6 right-6 z-[100] h-14 w-14 rounded-full shadow-2xl border-4 border-background hover:scale-110 transition-all duration-300 animate-in zoom-in slide-in-from-bottom-4"
            onClick={() => navigate('/debug/rpc-test')}
            aria-label="Diagnóstico RPC"
          >
            <Search className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-destructive text-destructive-foreground font-bold text-sm px-3 py-1.5">
          <p>Diagnóstico RPC</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ForensicFloatingButton;