import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { toast } = useToast();
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((newNotification) => {
        setNotifications((prevNotifications) => [...prevNotifications, { ...newNotification, id: Date.now() }]);
        toast({
            title: newNotification.title,
            description: newNotification.description,
            variant: newNotification.variant || 'default',
        });
    }, [toast]);

    const removeNotification = useCallback((id) => {
        setNotifications((prevNotifications) => prevNotifications.filter(notification => notification.id !== id));
    }, []);

    const value = {
        notifications,
        addNotification,
        removeNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};