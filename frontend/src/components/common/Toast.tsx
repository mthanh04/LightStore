import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircleIcon className="w-5 h-5 text-[#22C55E] shrink-0" />,
  error:   <XCircleIcon className="w-5 h-5 text-[#EF4444] shrink-0" />,
  info:    <InformationCircleIcon className="w-5 h-5 text-[#3B82F6] shrink-0" />,
  warning: <ExclamationTriangleIcon className="w-5 h-5 text-[#F59E0B] shrink-0" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'border-l-[#22C55E]',
  error:   'border-l-[#EF4444]',
  info:    'border-l-[#3B82F6]',
  warning: 'border-l-[#F59E0B]',
};

const ToastItem: React.FC<{ item: ToastItem; onDismiss: (id: string) => void }> = ({
  item,
  onDismiss,
}) => (
  <div
    className={`flex items-center gap-3 bg-white border border-[#E5E5E5] border-l-4 ${bgMap[item.type]} rounded-[12px] px-4 py-3 shadow-large min-w-[280px] max-w-[360px] animate-slide-up`}
    style={{ fontFamily: 'Roboto, sans-serif' }}
  >
    {iconMap[item.type]}
    <span className="flex-1 text-[14px] text-[#171717] font-[600]">{item.message}</span>
    <button
      onClick={() => onDismiss(item.id)}
      className="text-[#A3A3A3] hover:text-[#525252] transition-colors cursor-pointer"
    >
      <XMarkIcon className="w-4 h-4" />
    </button>
  </div>
);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 3500);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container — bottom-right desktop, bottom-center mobile */}
      <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[200] flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
