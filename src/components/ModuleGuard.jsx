import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const ModuleGuard = ({ children, moduleId, action = '*' }) => {
    const { hasPermission, loading, user } = useAuth();
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        if (loading) return;

        if (!user) {
            // Not logged in, redirect to login
            navigate('/login', { replace: true });
            return;
        }

        const authorized = hasPermission(moduleId, action);
        setIsAuthorized(authorized);

        if (!authorized) {
            console.warn(`Access denied for module: ${moduleId}`);
            // We do NOT redirect automatically here to avoid loops if the target page also has a guard.
            // Instead, we render an unauthorized state below.
        }
    }, [loading, user, moduleId, action, hasPermission, navigate]);

    if (loading || isAuthorized === null) {
        return <LoadingSpinner />;
    }

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4 animate-in fade-in">
                <h2 className="text-2xl font-bold text-slate-800">Acesso Restrito</h2>
                <p className="text-slate-600">Você não tem permissão para acessar este módulo ({moduleId}).</p>
                <button 
                    onClick={() => navigate('/dashboard')}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                >
                    Voltar ao Dashboard
                </button>
            </div>
        );
    }

    return <>{children}</>;
};

export default ModuleGuard;