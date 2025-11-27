import React from 'react';
import { Cloud, CloudLightning, RefreshCw, Check } from 'lucide-react';

export const PersistenceStatus = ({ status, lastSaved, className = "" }) => {
    if (status === 'idle') return null;
    
    return (
        <div className={`flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in ${className}`}>
            {status === 'saving' && (
                <>
                    <CloudLightning className="h-3 w-3 text-blue-500 animate-pulse" />
                    <span className="text-blue-500">Salvando...</span>
                </>
            )}
            {status === 'saved' && (
                <>
                    <Cloud className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">Salvo</span>
                    {lastSaved && (
                        <span className="text-[10px] text-gray-400 hidden sm:inline">
                            ({lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                    )}
                </>
            )}
            {status === 'restored' && (
                <>
                    <RefreshCw className="h-3 w-3 text-orange-500" />
                    <span className="text-orange-500">Rascunho restaurado</span>
                </>
            )}
        </div>
    );
};