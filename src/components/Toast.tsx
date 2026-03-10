import { useEffect, useState } from 'react';
import type React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 border-green-300 text-green-800',
  error: 'bg-red-50 border-red-300 text-red-800',
  info: 'bg-blue-50 border-blue-300 text-blue-800',
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: () => void;
}> = function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const Icon = iconMap[toast.type];
  const duration = toast.duration ?? 3000;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg text-sm ${colorMap[toast.type]}`}
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="flex-1">{toast.message}</span>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onDismiss, 300);
        }}
        className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function Toast({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => {
          return (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={() => onDismiss(toast.id)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
