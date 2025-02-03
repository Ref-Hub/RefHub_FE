// src/contexts/ToastProvider.tsx
import { useState, useCallback } from 'react';
import { Toast } from '@/components/common/Toast';
import { ToastContext } from './ToastContext';
import type { ToastType } from './types';

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: ToastType;
  }>>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = String(Date.now());
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => {
            setToasts(prev => prev.filter(t => t.id !== toast.id));
          }}
        />
      ))}
    </ToastContext.Provider>
  );
}