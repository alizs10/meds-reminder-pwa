import { create } from 'zustand';
import { db, type Theme, type Language, type WeekStartDay } from '@/db';

// Re-export types so existing imports in other files don't break
export type { Theme, Language, WeekStartDay };

interface SettingsState {
    settings: {
        theme: Theme;
        language: Language;
        weekStartsOn: WeekStartDay;
    };
    isLoading: boolean;
    isInitialized: boolean;
    initialize: () => Promise<void>;
    update: (newSettings: Partial<SettingsState['settings']>) => Promise<void>;
}

const DEFAULT_SETTINGS = {
    theme: 'system' as Theme,
    language: 'en' as Language,
    weekStartsOn: 6 as WeekStartDay,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    settings: DEFAULT_SETTINGS,
    isLoading: true,
    isInitialized: false,

    initialize: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true });
        try {
            const savedSettings = await db.settings.get('app_settings');
            if (savedSettings) {
                set({
                    settings: {
                        theme: savedSettings.theme,
                        language: savedSettings.language,
                        weekStartsOn: savedSettings.weekStartsOn,
                    },
                    isLoading: false,
                    isInitialized: true,
                });
            } else {
                set({ isLoading: false, isInitialized: true });
            }
        } catch (error) {
            console.error("Failed to load settings:", error);
            set({ isLoading: false, isInitialized: true });
        }
    },

    update: async (newSettings) => {
        const currentSettings = get().settings;
        const mergedSettings = { ...currentSettings, ...newSettings };

        // Optimistically update UI immediately
        set({ settings: mergedSettings });

        try {
            await db.settings.put({
                id: 'app_settings',
                ...mergedSettings,
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Failed to save settings:", error);
        }
    },
}));