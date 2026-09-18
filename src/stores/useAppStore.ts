import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AppState {
    isSetupComplete: boolean;
    setSetupComplete: (val: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            isSetupComplete: false,
            setSetupComplete: (val) => set({ isSetupComplete: val }),
        }),
        {
            name: 'meds-reminder-app',
            storage: createJSONStorage(() => localStorage),
        }
    )
);