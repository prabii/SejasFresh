import React, { createContext, ReactNode, useContext, useState } from 'react';
import Toast, { ToastConfig } from './Toast';

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

interface ToastState extends ToastConfig {
  id: string;
  visible: boolean;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = (config: ToastConfig) => {
    const id = Date.now().toString();
    const newToast: ToastState = {
      ...config,
      id,
      visible: true,
    };

    setToasts(prev => [...prev, newToast]);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccess = (message: string, duration = 3000) => {
    showToast({ message, type: 'success', duration });
  };

  const showError = (message: string, duration = 4000) => {
    showToast({ message, type: 'error', duration });
  };

  const showWarning = (message: string, duration = 3500) => {
    showToast({ message, type: 'warning', duration });
  };

  const showInfo = (message: string, duration = 3000) => {
    showToast({ message, type: 'info', duration });
  };

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          visible={toast.visible}
          onHide={() => hideToast(toast.id)}
          onPress={toast.onPress}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};