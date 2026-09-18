import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db, type Theme, type Language, type WeekStartDay } from '@/db';

// Re-export types so existing imports in other files don't break
export type { Theme, Language, WeekStartDay };

interface SettingsState {
    settings: {
        theme: Theme;
        language: Language;
        weekStartsOn: WeekStartDay;
    };
    update: (newSettings: Partial<SettingsState['settings']>) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            settings: {
                theme: 'system',
                language: 'en',
                weekStartsOn: 6,
            },
            update: (newSettings) => {
                const currentSettings = get().settings;
                const mergedSettings = { ...currentSettings, ...newSettings };

                // 1. Update Zustand state (automatically syncs to localStorage instantly)
                set({ settings: mergedSettings });

                // 2. Sync to IndexedDB in the background
                db.settings.put({
                    id: 'app_settings',
                    ...mergedSettings,
                    updatedAt: new Date().toISOString(),
                }).catch(err => console.error("Failed to sync settings to IndexedDB:", err));
            },
        }),
        {
            name: 'meds-reminder-settings',
            storage: createJSONStorage(() => localStorage), // Instant synchronous hydration!
        }
    )
);