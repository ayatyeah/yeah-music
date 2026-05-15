import { create } from 'zustand';

const buildToast = (toast) => ({
  id: toast.id || `toast_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
  type: toast.type || 'info',
  title: toast.title || 'Notification',
  message: toast.message || '',
  duration: toast.duration || 4000,
});

export const useNotificationStore = create((set) => ({
  toasts: [],

  addToast: (toast) => {
    const next = buildToast(toast);
    set((state) => ({ toasts: [...state.toasts, next] }));
    return next.id;
  },

  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  clearToasts: () => set({ toasts: [] }),
}));
