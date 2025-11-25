
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook specialized in persisting form states (auto-save) with dual storage strategy
 * and tab synchronization.
 * 
 * @param {string} uniqueKey - Unique identifier for the storage key (e.g., contract ID)
 * @param {object} initialData - Data coming from the database or defaults
 * @param {function} onSync - Callback to propagate changes to parent
 */
export const useFormStatePersistence = (uniqueKey, initialData, onSync) => {
    const [formData, setFormData] = useState(initialData || {});
    const [status, setStatus] = useState('idle'); // 'idle', 'saving', 'saved', 'restored'
    const [lastSaved, setLastSaved] = useState(null);
    const timeoutRef = useRef(null);
    const { toast } = useToast();
    
    // Unique keys for storage
    const LOCAL_KEY = `app_draft_${uniqueKey}`;
    const SESSION_KEY = `app_backup_${uniqueKey}`;

    // 1. Load draft on mount
    useEffect(() => {
        if (!uniqueKey) return;

        const loadDraft = () => {
            try {
                // Try LocalStorage first
                const localDraft = localStorage.getItem(LOCAL_KEY);
                const sessionDraft = sessionStorage.getItem(SESSION_KEY);
                
                let draftToUse = null;

                if (localDraft) {
                    draftToUse = JSON.parse(localDraft);
                } else if (sessionDraft) {
                    draftToUse = JSON.parse(sessionDraft);
                }

                if (draftToUse) {
                    // Check if draft is substantially different from initial DB data/defaults
                    // Simple check: keys length or simple JSON comparison
                    const isDifferent = JSON.stringify(draftToUse) !== JSON.stringify(initialData);
                    
                    if (isDifferent) {
                        setFormData(prev => ({ ...prev, ...draftToUse }));
                        setStatus('restored');
                        setLastSaved(new Date());
                        
                        // Propagate to parent/form hook if needed
                        if (onSync) onSync(draftToUse);

                        toast({
                            title: "Rascunho Recuperado",
                            description: "Seus dados não salvos foram restaurados.",
                            className: "bg-blue-50 border-blue-200 text-blue-800"
                        });
                    }
                }
            } catch (error) {
                console.error("Error recovering draft:", error);
            }
        };

        loadDraft();
    }, [uniqueKey, toast]); 

    // 2) & 3) Auto-save with debounce
    const persistData = useCallback((newData) => {
        if (!uniqueKey) return;

        setStatus('saving');
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            try {
                const jsonStr = JSON.stringify(newData);
                localStorage.setItem(LOCAL_KEY, jsonStr);
                sessionStorage.setItem(SESSION_KEY, jsonStr);
                
                setStatus('saved');
                setLastSaved(new Date());
            } catch (e) {
                console.error("Save failed", e);
                setStatus('error');
            }
        }, 1000); // 1 second debounce
    }, [uniqueKey, LOCAL_KEY, SESSION_KEY]);

    // Wrapper for single field changes
    const handleChange = useCallback((fieldId, value) => {
        setFormData(prev => {
            const updated = { ...prev, [fieldId]: value };
            persistData(updated);
            // If onSync expects (id, value) signature
            if (onSync && typeof onSync === 'function') {
                 // Check signature or pass full object if needed. 
                 // For this generic hook, we assume onSync might handle full object in some contexts,
                 // but the main use case `handleChange` usually implies specific field updates.
                 // We won't call onSync(updated) here to avoid loops if parent updates state back.
            }
            return updated;
        });
    }, [persistData, onSync]);

    // Wrapper for bulk updates (e.g. from RHF watch)
    const handleBulkChange = useCallback((newValues) => {
        setFormData(newValues);
        persistData(newValues);
    }, [persistData]);

    // 6) Sync between tabs
    useEffect(() => {
        const handleStorageEvent = (e) => {
            if (e.key === LOCAL_KEY && e.newValue) {
                try {
                    const remoteData = JSON.parse(e.newValue);
                    setFormData(remoteData);
                    setStatus('synced');
                    if (onSync) onSync(remoteData); 
                } catch (err) {
                    console.error("Sync error", err);
                }
            }
        };

        window.addEventListener('storage', handleStorageEvent);
        return () => window.removeEventListener('storage', handleStorageEvent);
    }, [LOCAL_KEY, onSync]);

    // 8) Clear data (to be called after successful submit to DB)
    const clearDraft = useCallback(() => {
        localStorage.removeItem(LOCAL_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        setStatus('idle');
        // Optional: Reset formData to initialData? Usually unmount handles it.
    }, [LOCAL_KEY, SESSION_KEY]);

    return {
        formData,
        handleChange,
        handleBulkChange,
        status,
        lastSaved,
        clearDraft
    };
};
