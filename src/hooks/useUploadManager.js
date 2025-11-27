import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { uploadQualificationPhoto } from '@/services/crmService';

const UPLOAD_CACHE_KEY = 'crm_photo_uploads_cache';
const UPLOAD_QUEUE_KEY = 'crm_photo_upload_queue';

// Helper to validate image URL
const validateImageUrl = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
};

export const useUploadManager = (fieldId) => {
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [progress, setProgress] = useState(0);
    const [cachedUrl, setCachedUrl] = useState(null);
    const { toast } = useToast();

    // Load cache and check for pending uploads on mount
    useEffect(() => {
        const loadState = async () => {
            // 1. Check session cache for completed uploads
            try {
                const cacheRaw = sessionStorage.getItem(UPLOAD_CACHE_KEY);
                if (cacheRaw) {
                    const cache = JSON.parse(cacheRaw);
                    const item = cache[fieldId];
                    if (item && item.url) {
                        // Validate integrity before offering it
                        const isValid = await validateImageUrl(item.url);
                        if (isValid) {
                            setCachedUrl(item.url);
                        }
                    }
                }
            } catch (e) {
                console.error("Error loading upload cache", e);
            }

            // 2. Check persistence for interrupted uploads (simulated)
            // Since we can't persist the File object, we check if there was a flag
            const queueRaw = localStorage.getItem(UPLOAD_QUEUE_KEY);
            if (queueRaw) {
                const queue = JSON.parse(queueRaw);
                if (queue[fieldId] && queue[fieldId].status === 'uploading') {
                    setStatus('interrupted');
                }
            }
        };

        loadState();

        // 9) Sync between tabs
        const handleStorageChange = (e) => {
            if (e.key === UPLOAD_CACHE_KEY) {
                loadState();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fieldId]);

    const addToQueue = (fileName) => {
        const queue = JSON.parse(localStorage.getItem(UPLOAD_QUEUE_KEY) || '{}');
        queue[fieldId] = { status: 'uploading', fileName, timestamp: Date.now() };
        localStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));
    };

    const removeFromQueue = () => {
        const queue = JSON.parse(localStorage.getItem(UPLOAD_QUEUE_KEY) || '{}');
        delete queue[fieldId];
        localStorage.setItem(UPLOAD_QUEUE_KEY, JSON.stringify(queue));
    };

    const saveToCache = (url) => {
        const cache = JSON.parse(sessionStorage.getItem(UPLOAD_CACHE_KEY) || '{}');
        cache[fieldId] = { url, timestamp: Date.now() };
        sessionStorage.setItem(UPLOAD_CACHE_KEY, JSON.stringify(cache));
        
        // Dispatch event for same-tab sync if needed
        window.dispatchEvent(new Event('session-storage'));
    };

    const uploadPhoto = useCallback(async (file, onSuccess) => {
        if (!file) return;

        setStatus('uploading');
        setProgress(10); // Start progress
        addToQueue(file.name);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 300);

            const publicUrl = await uploadQualificationPhoto(file, fieldId);
            
            clearInterval(progressInterval);
            setProgress(100);

            // 4) Integrity Check
            const isValid = await validateImageUrl(publicUrl);
            if (!isValid) {
                throw new Error("Upload concluído, mas a imagem parece corrompida.");
            }

            // Success
            saveToCache(publicUrl);
            removeFromQueue();
            setStatus('success');
            setCachedUrl(publicUrl);
            
            if (onSuccess) onSuccess(publicUrl);

            // 8) Confirmation
            toast({
                title: "Foto enviada",
                description: "A imagem foi salva e verificada com sucesso.",
                className: "bg-green-50 border-green-200 text-green-800"
            });

        } catch (error) {
            console.error("Upload error:", error);
            setStatus('error');
            setProgress(0);
            toast({
                variant: "destructive",
                title: "Falha no envio",
                description: "Não foi possível enviar a foto. Tente novamente."
            });
        }
    }, [fieldId, toast]);

    const resetStatus = () => {
        setStatus('idle');
        setProgress(0);
        removeFromQueue();
    };

    return {
        status,
        progress,
        cachedUrl,
        uploadPhoto,
        resetStatus,
        retry: uploadPhoto // Alias for retry logic
    };
};