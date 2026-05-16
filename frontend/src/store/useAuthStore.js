import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';
import { useNotificationStore } from './useNotificationStore';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      rememberMe: true,

      setRememberMe: (value) => set({ rememberMe: value }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
          });
          useNotificationStore.getState().addToast({
            type: 'success',
            title: 'Welcome back',
            message: `Signed in as ${response.user.username}`,
          });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          useNotificationStore.getState().addToast({
            type: 'error',
            title: 'Sign in failed',
            message: error.message,
          });
          throw error;
        }
          {
            name: 'yeahmusic-auth',
            partialize: (state) => ({
              user: state.user,
              token: state.token,
              isAuthenticated: state.isAuthenticated,
              rememberMe: state.rememberMe,
            }),
            onRehydrateStorage: (storeApi) => (persistedState) => {
              if (persistedState?.token && !persistedState?.user) {
                // Try to fetch profile with persisted token
                authService
                  .me()
                  .then((res) => {
                    if (res?.user) {
                      storeApi.setState({ user: res.user, isAuthenticated: true });
                    }
                  })
                  .catch(() => {
                    // token invalid -> clear
                    storeApi.setState({ token: null, user: null, isAuthenticated: false });
                  });
              }
            }
          }
            isAuthenticated: true,
            isLoading: false,
          });
          useNotificationStore.getState().addToast({
            type: 'success',
            title: 'Account created',
            message: `Welcome, ${response.user.username}`,
          });
          return response;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          useNotificationStore.getState().addToast({
            type: 'error',
            title: 'Registration failed',
            message: error.message,
          });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        useNotificationStore.getState().addToast({
          type: 'info',
          title: 'Signed out',
          message: 'See you next time.',
        });
      },

      setRole: (role) => set((state) => ({ user: { ...state.user, role } })),

      updateProfile: async (updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = {
            ...get().user,
            ...updates,
          };
          set({
            user: updatedUser,
            isLoading: false,
          });
          return updatedUser;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },
    }),
    {
      name: 'yeahmusic-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        rememberMe: state.rememberMe,
      }),
    }
  )
);
