import { type ReactNode } from 'react';
import { useToasts } from '../components/ui/toast';

type ToastType = 'success' | 'error' | 'info' | 'warning';

// Provide an empty wrapper for compatibility with RootLayout
export function ToastProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Adapt the new Vercel-style toast to the old showToast signature
export function useToast() {
  const toasts = useToasts();

  const showToast = (message: string, type: ToastType = 'success') => {
    switch (type) {
      case 'success':
        toasts.success(message);
        break;
      case 'error':
        toasts.error(message);
        break;
      case 'warning':
        toasts.warning(message);
        break;
      case 'info':
      default:
        toasts.message({ text: message });
        break;
    }
  };

  return { showToast };
}
