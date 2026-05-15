import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function Toaster() {
  const { toasts, removeToast } = useNotificationStore();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      setTimeout(() => removeToast(toast.id), toast.duration)
    );

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className="w-80 bg-[#141414]/95 border border-white/10 backdrop-blur-xl rounded-xl p-4 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 ${toast.type === 'success' ? 'text-yeah-accent' : 'text-gray-400'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">{toast.title}</p>
                <p className="text-gray-400 text-xs mt-1">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
