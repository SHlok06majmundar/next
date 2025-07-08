'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NotificationContextType {
  message: string | null;
  type: 'success' | 'error' | 'info' | null;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<'success' | 'error' | 'info' | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setMessage(message);
    setType(type);
    
    setTimeout(() => {
      clearNotification();
    }, 5000);
  };

  const clearNotification = () => {
    setMessage(null);
    setType(null);
  };

  return (
    <NotificationContext.Provider value={{
      message,
      type,
      showNotification,
      clearNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
