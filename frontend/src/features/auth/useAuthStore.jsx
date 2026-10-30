import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import authService from './AuthService';

const getErrorMessage = (error) =>
    (error.response && error.response.data && error.response.data.message) ||
    error.message ||
    error.toString();

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isLoading: false,
            isSuccess: false,
            isError: false,
            message: '',

            register: async (userData) => {
                set({ isLoading: true });
                try {
                    const user = await authService.register(userData);
                    set({ isLoading: false, isSuccess: true, user });
                } catch (error) {
                    set({ isLoading: false, isError: true, message: getErrorMessage(error), user: null });
                }
            },

            login: async (userData) => {
                set({ isLoading: true });
                try {
                    const user = await authService.login(userData);
                    set({ isLoading: false, isSuccess: true, user });
                } catch (error) {
                    set({ isLoading: false, isError: true, message: getErrorMessage(error), user: null });
                }
            },

            logout: async () => {
                await authService.logout();
                set({ user: null });
            },

            reset: () =>
                set({ isLoading: false, isSuccess: false, isError: false, message: '' }),
        }),
        {
            name: 'auth',
            partialize: (state) => ({ user: state.user }),
        },
    ),
);

export default useAuthStore;
